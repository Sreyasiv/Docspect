const splitIntoChunks = require("./chunker");
const { analyzeWithOpenRouter } = require("../LLM/openRouterClient");

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

function isValidRiskArray(parsed) {
  if (!Array.isArray(parsed)) return false;
  return parsed.every(el =>
    el &&
    typeof el === "object" &&
    ["clause", "risk_type", "severity", "explanation"].every(k => typeof el[k] === "string")
  );
}

function tryRescueTruncated(cleaned, allClauses, riskScore) {
  try {
    const raw = cleaned.replace(SENTINEL, "").trim();
    const lastBrace = raw.lastIndexOf("}");
    if (lastBrace === -1) return riskScore;

    const salvaged = raw.slice(0, lastBrace + 1);

    let attempt = null;
    if (salvaged.startsWith('{"clauses"')) {
      attempt = salvaged + "]}";
    } else if (salvaged.includes('"clause"')) {
      // find first { that starts a clause object
      const firstClause = salvaged.indexOf('{"clause"');
      if (firstClause !== -1) {
        attempt = '{"clauses":[' + salvaged.slice(firstClause) + "]}";
      }
    }

    if (!attempt) return riskScore;

    const rescued = tryParseWithFixes(attempt);
    if (rescued && Array.isArray(rescued.clauses) && rescued.clauses.length > 0) {
      // Filter to only valid clause objects
      const valid = rescued.clauses.filter(el =>
        el && typeof el === "object" &&
        typeof el.clause === "string" &&
        typeof el.risk_type === "string" &&
        typeof el.severity === "string"
      );
      if (valid.length > 0) {
        console.log(`🔧 RISK_LOG: Rescued ${valid.length} clauses from truncated output.`);
        allClauses.push(...valid);
        if (typeof rescued.riskScore === "number") {
          return riskScore === null
            ? rescued.riskScore
            : Math.round((riskScore + rescued.riskScore) / 2);
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ Rescue attempt threw:", err.message);
  }
  return riskScore;
}

async function detectRiskClauses(text) {
  const chunks = splitIntoChunks(text);
  const allClauses = [];
  let riskScore = null;

  for (const chunk of chunks) {
    const prompt = `
You are a legal risk analyzer helping everyday people understand contracts.

Analyze the contract text below. Return STRICT JSON ONLY — no markdown, no explanation outside the JSON.

Return an object with exactly these two keys:

"clauses": array of risky clause objects. Each object must have:
  - "clause": copy the exact sentence or phrase from the text that is risky
  - "risk_type": exactly one of ["Financial","Legal","Operational","Confidentiality","Liability","Termination","IP","Compliance","Other"]
  - "severity": exactly one of ["High","Medium","Low"]
    Use "High" for clauses that could seriously harm the person's money, career, or legal rights.
    Use "Medium" for clauses that are unfair but not immediately dangerous.
    Use "Low" for clauses that are standard but worth knowing.
  - "explanation": one sentence, max 20 words, written in plain English like you're texting a friend.
    NO legal jargon. BAD: "Unilateral termination exposes parties to contractual vulnerability." GOOD: "They can fire you in 7 days for literally any reason."

"riskScore": integer from 0 to 100.
  Score based on these weights:
  - Number of High severity clauses: +15 each
  - Number of Medium severity clauses: +7 each
  - Clauses that waive statutory rights (like Copyright Act, labour laws): +10 each
  - Clauses that let company change terms unilaterally: +15
  - No job guarantee after completion: +10
  - Standard/fair clauses: no addition
  A typical unfair apprenticeship contract should score 65-80. A balanced contract scores 30-50.

CRITICAL: You MUST close all JSON brackets and braces. Never leave the JSON incomplete.
Keep each "clause" value SHORT — one sentence only, under 30 words.
Keep each "explanation" under 20 words.
If you detect many clauses, limit to the 6 most important ones to stay within output limits.

Example:
{
  "clauses": [
    {
      "clause": "Either party may terminate without notice.",
      "risk_type": "Termination",
      "severity": "High",
      "explanation": "They can end your contract any day with zero warning."
    }
  ],
  "riskScore": 74
}

Append this token at the very end after the closing brace: ${SENTINEL}

Contract text:
${chunk}
`;

    const raw = await analyzeWithOpenRouter(prompt, { temperature: 0, max_tokens: 4000 });
    const cleaned = cleanRaw(raw);
    const stripped = cleaned.replace(SENTINEL, "").trim();
    const parsed = tryParseWithFixes(stripped);

    if (parsed && Array.isArray(parsed.clauses)) {
      allClauses.push(...parsed.clauses);
      if (typeof parsed.riskScore === "number") {
        riskScore = riskScore === null
          ? parsed.riskScore
          : Math.round((riskScore + parsed.riskScore) / 2);
      }
      console.log(`\n🔍 RISK_LOG: Parsed ${parsed.clauses.length} risks from chunk.`);
    } else {
      console.warn(`\n⚠️ Failed to parse. Attempting rescue... Snippet: "${cleaned.substring(0, 120)}..."`);
      riskScore = tryRescueTruncated(cleaned, allClauses, riskScore);
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

  return {
    clauses: deduped,
    riskScore: riskScore ?? 0
  };
}

module.exports = detectRiskClauses;