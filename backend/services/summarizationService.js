// summarizationService.js
const splitIntoChunks = require("./chunker");
const summarizeWithOpenRouter = require("../LLM/openRouterClient");

const SENTINEL = "<<<END_SUMMARY>>>";

/** --- utilities --- */
function cleanRaw(raw) {
  if (!raw) return "";
  let s = String(raw).replace(/```json|```/g, "").trim();
  const i = s.search(/[\[\{]/);
  if (i > 0) s = s.slice(i).trim();
  s = s.replace(/\u2026/g, "");
  return s;
}

function tryParseWithFixes(s) {
  if (!s) return null;
  try { return JSON.parse(s); } catch (e) {}
  try {
    const fixed = s.replace(/,\s*([\]\}])/g, "$1");
    return JSON.parse(fixed);
  } catch (e) {}
  return null;
}

function isValidSectionArray(parsed) {
  if (!Array.isArray(parsed)) return false;
  for (const el of parsed) {
    if (!el || typeof el !== "object" || Array.isArray(el)) return false;
    const keys = Object.keys(el);
    if (keys.length === 0) return false;
    for (const k of keys) {
      if (typeof k !== "string") return false;
      const v = el[k];
      if (!Array.isArray(v)) return false;
      for (const item of v) if (typeof item !== "string") return false;
    }
  }
  return true;
}

/** call model, enforce sentinel + shape, retry with stricter prompts */
async function callModelStrict(prompt, opts = { temperature: 0, max_tokens: 2000 }, maxRetries = 2) {
  let lastRaw = "";
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const raw = await summarizeWithOpenRouter(prompt, opts);
    lastRaw = typeof raw === "string" ? raw : (raw && raw.summary) ? raw.summary : String(raw);
    const cleaned = cleanRaw(lastRaw);
    const hasSentinel = cleaned.includes(SENTINEL);
    const payload = hasSentinel ? cleaned.replace(SENTINEL, "").trim() : cleaned;

    const parsed = tryParseWithFixes(payload);
    if (parsed && isValidSectionArray(parsed)) {
      return { parsed, raw: lastRaw, truncated: !hasSentinel };
    }

    if (attempt < maxRetries) {
      const tighter = `STRICT JSON ONLY. RETURN a JSON ARRAY of SECTION OBJECTS.
Each element must be an OBJECT with a section heading (string) as the key and an ARRAY OF SHORT BULLET STRINGS as the value.
Do NOT include any other text, explanation, markdown, or code fences.
Keep bullets short (<= 20 words). Remove duplicates.
Keep the entire summary concise — total output should be under 500 words.

Example:
[
  { "Agreement Details": ["Effective date is ...", "Parties involved are ..."] },
  { "Confidentiality": ["Confidential Information includes ...", "Receiving Party must ..."] }
]

Append exactly this token at the end of your output: ${SENTINEL}

Previous attempt was invalid. Return the correct JSON only now.

` + prompt;

      prompt = tighter;
      opts = { ...opts, temperature: 0, max_tokens: Math.max(opts.max_tokens || 2000, 3000) };
      continue;
    }

    // last attempt: if parsed is array-like, try to coerce into proper objects (salvage)
    if (parsed && Array.isArray(parsed)) {
      const coerced = parsed.map(item => {
        if (typeof item === "string") return { "Summary": [item] };
        if (Array.isArray(item)) return { "Summary": item.map(String) };
        if (item && typeof item === "object") {
          const out = {};
          for (const [k, v] of Object.entries(item)) {
            if (Array.isArray(v)) out[String(k)] = v.map(String);
            else out[String(k)] = [String(v)];
          }
          return out;
        }
        return { "Summary": [String(item)] };
      });
      return { parsed: coerced, raw: lastRaw, truncated: !hasSentinel };
    }

    // nothing parseable
    return { parsed: null, raw: lastRaw, truncated: true };
  }
}

/** attempt continuation when a raw is truncated */
async function attemptContinuation(partialRaw, maxTokens = 1400) {
  try {
    const contPrompt = `Previous response was truncated. HERE IS THE PARTIAL JSON OUTPUT (may be missing the ending):\n\n${partialRaw}\n\nContinue from the partial output and RETURN ONLY THE COMPLETE JSON ARRAY OF SECTION OBJECTS. Do NOT include any text, markdown, or explanation. Ensure the JSON is syntactically valid and closes all brackets. Example shape:\n[\n  { "Agreement Details": ["..."] },\n  { "Confidentiality": ["..."] }\n]\n\nReturn the full JSON array now.`;
    const contRaw = await summarizeWithOpenRouter(contPrompt, { temperature: 0, max_tokens: maxTokens });
    const cleaned = cleanRaw(contRaw);
    const parsedCont = tryParseWithFixes(cleaned);
    if (parsedCont && isValidSectionArray(parsedCont)) return { parsed: parsedCont, raw: contRaw, success: true };

    const retryPrompt = `Continuation attempt invalid. RETURN ONLY the complete JSON array of section objects. Close all brackets/quotes, no markdown, no commentary.\n\nPartial:\n${partialRaw}\n\nReturn JSON now.`;
    const retryRaw = await summarizeWithOpenRouter(retryPrompt, { temperature: 0, max_tokens: Math.max(1600, maxTokens) });
    const cleaned2 = cleanRaw(retryRaw);
    const parsedRetry = tryParseWithFixes(cleaned2);
    if (parsedRetry && isValidSectionArray(parsedRetry)) return { parsed: parsedRetry, raw: retryRaw, success: true };

    return { parsed: parsedCont || parsedRetry || null, raw: contRaw || retryRaw, success: false };
  } catch (e) {
    console.warn("Continuation attempt error:", e);
    return { parsed: null, raw: null, success: false };
  }
}

/** --- main function --- */
async function summarizeDocument(text) {
  // 1) chunk
  const chunks = splitIntoChunks(text);

  // 2) get bullets per chunk (ask each chunk to return JSON array of strings)
  const chunkSummariesRaw = await Promise.all(
    chunks.map((chunk, i) => {
      const p = `You are a legal contract summarizer. For the CHUNK below, extract the main bullet points as a JSON ARRAY OF STRINGS (["...","..."]). Keep each bullet concise (<=20 words). Return ONLY JSON (no markdown/backticks). CHUNK:\n\n${chunk}`;
      return summarizeWithOpenRouter(p);
    })
  );

  // flatten chunk outputs into array of strings (best-effort)
  const flattenedBullets = [];
  for (const raw of chunkSummariesRaw) {
    const cleaned = cleanRaw(raw);
    const parsed = tryParseWithFixes(cleaned);
    if (Array.isArray(parsed)) {
      flattenedBullets.push(...parsed.map(String).filter(Boolean));
    } else {
      const lines = cleaned.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length) flattenedBullets.push(...lines.map(String));
      else flattenedBullets.push(String(raw));
    }
  }

  // de-duplicate while preserving order
  const seen = new Set();
  const dedupedBullets = [];
  for (const b of flattenedBullets) {
    const s = String(b).trim();
    if (!s) continue;
    if (!seen.has(s)) { seen.add(s); dedupedBullets.push(s); }
  }

  // 3) final merge: enforce section-object shape from LLM
  const finalPrompt = `You are a legal document summarizer AI.
Below are concise bullets extracted from a contract. Merge and group them into meaningful sections. Make sure you cover all important aspects of the contract. Keep the final summary concise (under 500 words).
RETURN EXACTLY a JSON ARRAY of SECTION OBJECTS where each element is an OBJECT with a single STRING key (the section heading)
and the value is an ARRAY of SHORT BULLET STRINGS.

Use natural, common legal section headings when appropriate (e.g., "Agreement Details", "Parties", "Purpose / Scope", "Confidentiality", "Intellectual Property", "Use & Restrictions", "Notices", "Liability & Remedies", "Term & Termination", "Governing Law", "Dispute Resolution", "Miscellaneous").

Requirements:
- Do NOT include any explanation, markdown, backticks, or other text outside the JSON.
- Keep each bullet <= 20 words and independent.
- Remove duplicates.
- If a bullet clearly belongs to a common heading, put it under that heading. If unsure, use "Miscellaneous".
- Append exactly this token at the end of your output: ${SENTINEL}

Bullets (JSON):
${JSON.stringify(dedupedBullets, null, 2)}
`;

  // call and allow more tokens
  const { parsed, raw, truncated } = await callModelStrict(finalPrompt, { temperature: 0, max_tokens: 4000 }, 2);

  // if truncated -> try continuation
  if (truncated) {
    console.warn("summarizationService: final output truncated. Attempting continuation...");
    const cont = await attemptContinuation(raw, 1800);
    if (cont && cont.success && cont.parsed && isValidSectionArray(cont.parsed)) {
      return { summary: cont.parsed, raw: cont.raw, truncated: false };
    } else {
      console.warn("summarizationService: continuation failed or invalid. Will attempt to salvage partial parsed output if possible.");
      // salvage: parse cleaned raw (even if truncated) and return any section objects present
      const cleanedRaw = cleanRaw(raw);
      const salvaged = tryParseWithFixes(cleanedRaw);
      if (Array.isArray(salvaged) && salvaged.length && salvaged.every(item => typeof item === "object")) {
        console.warn("summarizationService: salvaged partial parsed sections -- returning them (truncated=true)");
        // Ensure values are arrays of strings
        const normalized = salvaged.map(s => {
          const out = {};
          if (s && typeof s === "object" && !Array.isArray(s)) {
            for (const [k, v] of Object.entries(s)) out[k] = Array.isArray(v) ? v.map(String) : [String(v)];
            return out;
          }
          return { Summary: [String(s)] };
        });
        return { summary: normalized, raw, truncated: true };
      }
      // else, fall through to last fallback (flat Summary)
    }
  }

  if (parsed && isValidSectionArray(parsed)) {
    return { summary: parsed, raw, truncated };
  }

  // fallback: return flat bullets only if nothing else parseable
  console.warn("summarizationService: returning fallback Summary section (LLM failed to produce sections). Raw sample:", String(raw || "").slice(0, 1000));
  return { summary: [{ "Summary": dedupedBullets }], raw, truncated: true };
}

module.exports = summarizeDocument;
