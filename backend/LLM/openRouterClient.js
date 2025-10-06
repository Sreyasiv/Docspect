// backend/LLM/openRouterClient.js
const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function summarizeWithOpenRouter(prompt) {
  // Fallback: no key present → return demo JSON so the app works end-to-end
  if (!OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY not set. Using demo fallback responses.");
    const isFinalStep = prompt.includes("Append exactly this token") || prompt.includes("<<<END_SUMMARY>>>");
    if (isFinalStep) {
      const demo = [
        { "Agreement Details": ["Effective date is unspecified (demo)", "Parties identified from document context (demo)"] },
        { "Confidentiality": ["Recipient must not disclose information (demo)", "Reasonable safeguards required (demo)"] },
        { "Term & Termination": ["Term auto-renews unless notice (demo)", "Either party may terminate for breach (demo)"] }
      ];
      return JSON.stringify(demo) + "<<<END_SUMMARY>>>"; // include sentinel for parser
    } else {
      // chunk-level bullets
      return JSON.stringify([
        "Key obligations identified (demo)",
        "Payment terms noted (demo)",
        "Limitation of liability present (demo)"
      ]);
    }
  }

  // Real call if key is present
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3001',
          'Content-Type': 'application/json',
        },
      }
    );
    const text = response?.data?.choices?.[0]?.message?.content
      || response?.data?.output?.[0]?.content?.[0]?.text;
    return text;
  } catch (error) {
    console.error("🛑 OpenRouter summarization failed:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw new Error("Summarization failed");
  }
}

module.exports = summarizeWithOpenRouter;