const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function summarizeWithOpenRouter(prompt) {
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
    const text = response?.data?.choices?.[0]?.message?.content || response?.data?.output?.[0]?.content?.[0]?.text;
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
