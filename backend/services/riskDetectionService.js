// services/riskDetectionService.js
const splitIntoChunks = require("./chunker");
const analyzeWithOpenRouter = require("../LLM/openRouterClient");

const SENTINEL = "<<<END_RISK_ANALYSIS>>>";

function cleanRaw(raw) {
  if (!raw) return "";
  let s = String(raw).replace(/```json|```/g, "").trim();
  const i = s.search(/[\[\{]/);
  if (i > 0) s = s.slice(i).trim();
  return s;
}

function tryParseWithFixes(s) {
  try { return JSON.parse(s); } catch {}
  try {
    // Fixes trailing commas commonly introduced by LLMs
    const fixed = s.replace(/,\s*([\]\}])/g, "$1");
    return JSON.parse(fixed);
  } catch {}
  return null;
}

function isValidRiskArray(parsed) {
  if (!Array.isArray(parsed)) return false;
  return parsed.every(el =>
    el &&
    typeof el === "object" &&
    // Check for the minimum required keys
    ["clause", "risk_type", "severity", "explanation"].every(k => typeof el[k] === "string")
  );
}

async function detectRiskClauses(text) {
  const chunks = splitIntoChunks(text);
  const results = [];

  for (const chunk of chunks) {
    const prompt = `
You are an AI legal risk analyzer. Read the contract text below and extract **risky clauses**.
For each clause that could expose either party to risk, return a JSON OBJECT with these fields:

- "clause": the risky sentence or short excerpt
- "risk_type": one of ["Financial", "Legal", "Operational", "Confidentiality", "Liability", "Termination", "IP", "Compliance", "Other"]
- "severity": one of ["High", "Medium", "Low"]
- "explanation": a concise explanation (<= 25 words)

Return a **JSON ARRAY** of such objects. Example:

[
  {
    "clause": "Either party may terminate without notice.",
    "risk_type": "Termination",
    "severity": "High",
    "explanation": "Unilateral termination without notice exposes parties to sudden contract loss."
  }
]

Append this token at the end: ${SENTINEL}

Text:
${chunk}
`;

    // Increased max_tokens slightly for safety, though 2000 is usually fine
    const raw = await analyzeWithOpenRouter(prompt, { temperature: 0, max_tokens: 2500 });
    const cleaned = cleanRaw(raw);
    
    // Attempt to remove the sentinel and parse
    const parsed = tryParseWithFixes(cleaned.replace(SENTINEL, "").trim());
    
    if (parsed && isValidRiskArray(parsed)) {
        console.log(`\n🔍 RISK_LOG: Successfully parsed ${parsed.length} risks from chunk.`);
        results.push(...parsed);
    } else {
        console.warn(`\n RISK_LOG: Failed to parse valid risk array from chunk. Raw output snippet: "${cleaned.substring(0, 100)}..."`);
    }
  }

  // Deduplicate by clause text
  const seen = new Set();
  const deduped = results.filter(r => {
    // Use a clean version of the clause for deduplication
    const key = r.clause ? r.clause.trim() : ''; 
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });


  console.log("\n========================================================");
  console.log(`FINAL RISK CLAUSES PAYLOAD (${deduped.length} total):`);
  console.log(JSON.stringify(deduped, null, 2));
  console.log("========================================================\n");


  return deduped;
  
}

module.exports = detectRiskClauses;