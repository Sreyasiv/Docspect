const summarizeWithOpenRouter = require("../utils/summarizer");

async function extractRiskClauses(text) {
  const prompt = `You are a legal document risk reviewer AI. Your task is to analyze the following contract and extract all potentially risky clauses. For each clause, return:

- A short title (clauseTitle)
- The full clause text (clause)
- A brief explanation of why it's risky (risk)
- A clear, professional suggestion to mitigate the risk (advice)

Format your output strictly as a JSON array of objects like this:

[
  {
    "clauseTitle": "Termination Without Notice",
    "clause": "The employer may terminate this agreement at any time without prior notice.",
    "risk": "This gives the employer the right to terminate you without warning.",
    "advice": "Negotiate a clause requiring at least 2 weeks' notice before termination."
  },
  ...
]

Now analyze the following contract text:

""" 
${text}
"""
`;

  let raw = await summarizeWithOpenRouter(prompt);
  let riskClauses = [];

  try {
    riskClauses = JSON.parse(raw);
  } catch (err) {
    console.error("JSON parse failed:", err);
    console.log("Raw Mistral response:", raw);
    // Optional fallback if needed
    riskClauses = [];
  }

  return riskClauses;
}

module.exports = extractRiskClauses;
