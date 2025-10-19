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
    const fixed = s.replace(/,\s*([\]\}])/g, "$1");
    return JSON.parse(fixed);
  } catch {}
  return null;
}

// No change here, still used for validation
function isValidRiskArray(parsed) {
  if (!Array.isArray(parsed)) return false;
  return parsed.every(el =>
    el &&
    typeof el === "object" &&
    ["clause", "risk_type", "severity", "explanation"].every(k => typeof el[k] === "string")
  );
}

async function detectRiskClauses(text) {
  const chunks = splitIntoChunks(text);
  const allClauses = [];
  let riskScore = null; // ⚡ Store AI-generated risk score

  for (const chunk of chunks) {
    const prompt = `
You are an AI legal risk analyzer. Analyze the contract text below and return STRICT JSON ONLY.

Return an object with:
- "clauses": a JSON ARRAY of risky clauses. Each object must have:
    - "clause": the risky sentence or excerpt
    - "risk_type": one of ["Financial","Legal","Operational","Confidentiality","Liability","Termination","IP","Compliance","Other"]
    - "severity": one of ["High","Medium","Low"]
    - "explanation": concise explanation <=25 words
- "riskScore": an integer 0-100 representing the overall riskiness of the text.

Example response:
{
  "clauses": [
    {
      "clause": "Either party may terminate without notice.",
      "risk_type": "Termination",
      "severity": "High",
      "explanation": "Unilateral termination exposes parties to sudden contract loss."
    }
  ],
  "riskScore": 72
}

Append this token at the end: ${SENTINEL}

Text:
${chunk}
`;

    const raw = await analyzeWithOpenRouter(prompt, { temperature: 0, max_tokens: 2500 });
    const cleaned = cleanRaw(raw);

    // Parse AI output
    const parsed = tryParseWithFixes(cleaned.replace(SENTINEL, "").trim());

    if (parsed && Array.isArray(parsed.clauses)) {
      allClauses.push(...parsed.clauses);

      // Take latest or average if multiple chunks
      if (typeof parsed.riskScore === "number") {
        if (riskScore === null) riskScore = parsed.riskScore;
        else riskScore = Math.round((riskScore + parsed.riskScore) / 2);
      }

      console.log(`\n🔍 RISK_LOG: Parsed ${parsed.clauses.length} risks from chunk.`);
    } else {
      console.warn(`\n⚠️ Failed to parse valid risk object. Snippet: "${cleaned.substring(0,100)}..."`);
    }
  }

  // Deduplicate by clause text
  const seen = new Set();
  const deduped = allClauses.filter(r => {
    const key = r.clause?.trim() || '';
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log("\n========================================================");
  console.log(`FINAL RISK CLAUSES PAYLOAD (${deduped.length} total):`);
  console.log(JSON.stringify(deduped, null, 2));
  console.log(`AI GENERATED RISK SCORE: ${riskScore}`);
  console.log("========================================================\n");

  // ✅ Return both clauses and riskScore
  return {
    clauses: deduped,
    riskScore: riskScore ?? 0
  };
}

module.exports = detectRiskClauses;
