import React, { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";

/* Utilities */
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
    const fixed = s.replace(/,\s*([\]}])/g, "$1");
    return JSON.parse(fixed);
  } catch (e) {}
  return null;
}

function extractQuotedStrings(s) {
  if (!s) return null;
  const items = [];
  const re = /"([^"]+)"|'([^']+)'/g;
  let m;
  while ((m = re.exec(s)) !== null) items.push(m[1] ?? m[2]);
  return items.length ? items : null;
}

/* parseSummary: accepts many shapes and returns either:
   - array of section objects: [{ Heading: [..] }, ...]
   - array of strings: ["a","b"]
   - null if nothing parseable
*/
function parseSummary(rawInput) {
  if (rawInput === undefined) return null;

  // 1) handle object wrappers like { summary: ... }
  if (rawInput && typeof rawInput === "object") {
    if (Array.isArray(rawInput) && rawInput.length && typeof rawInput[0] === "object") return rawInput;
    const candidates = ["summary", "data", "result"];
    for (const k of candidates) if (rawInput[k] !== undefined) return parseSummary(rawInput[k]);

    const keys = Object.keys(rawInput);
    if (keys.length && keys.every(k => Array.isArray(rawInput[k]) || typeof rawInput[k] === "string")) {
      return keys.map(k => ({ [k]: Array.isArray(rawInput[k]) ? rawInput[k].map(String) : [String(rawInput[k])] }));
    }
  }

  // 2) array of strings
  if (Array.isArray(rawInput) && rawInput.every(x => typeof x === "string")) return rawInput;

  // 3) string parsing
  if (typeof rawInput === "string") {
    const s = cleanRaw(rawInput);
    const parsed = tryParseWithFixes(s);
    if (parsed) return parseSummary(parsed); // recurse
    const quoted = extractQuotedStrings(s);
    if (quoted && quoted.length) return quoted;
    const lines = s.split(/\r?\n/).map(l => l.replace(/^[\s\-\•\*]+/, "").trim()).filter(Boolean);
    if (lines.length) return lines;
  }

  return null;
}

/* normalize: always return array of section objects [{ Heading: [..] }, ...] */
function normalizeToSections(parsed) {
  if (!parsed) return null;

  // already section objects
  if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === "object" && !Array.isArray(parsed[0])) {
    return parsed.map(obj => {
      const out = {};
      for (const [k, v] of Object.entries(obj)) out[k] = Array.isArray(v) ? v.map(String) : [String(v)];
      return out;
    });
  }

  // flat array of strings -> single section
  if (Array.isArray(parsed) && parsed.every(p => typeof p === "string")) return [{ Summary: parsed }];

  // object -> convert to sections
  if (parsed && typeof parsed === "object") {
    return Object.entries(parsed).map(([k, v]) => ({ [k]: Array.isArray(v) ? v.map(String) : [String(v)] }));
  }

  return [{ Summary: [String(parsed)] }];
}

function ShortExpandable({ text, maxChars = 220 }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  if (text.length <= maxChars) return <span>{text}</span>;
  return (
    <span>
      {open ? text : text.slice(0, maxChars) + "…"}{" "}
      <button onClick={() => setOpen(!open)} className="text-sm text-blue-600 hover:underline">
        {open ? "show less" : "show more"}
      </button>
    </span>
  );
}

export default function DocumentSummary({ summary, truncated }) {
  useEffect(() => {
    console.log("DocumentSummary received prop `summary`:", summary);
    if (truncated) console.log("DocumentSummary: truncated flag is true");
  }, [summary, truncated]);

  const parsed = parseSummary(summary);
  console.log("DocumentSummary parsed shape:", parsed);

  const sections = normalizeToSections(parsed);

  if (!sections) {
    console.error("Unparseable summary:", summary);
    return <p className="text-gray-700">Invalid summary format</p>;
  }

  // Copy JSON helper for power users
  const copyJSON = () => {
    try {
      const json = JSON.stringify(sections, null, 2);
      navigator.clipboard.writeText(json);
      // small UX could be added - kept minimal
      console.log("Summary JSON copied to clipboard");
    } catch (e) { console.warn("Copy failed", e); }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">

      {/* Sections grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        {sections.map((section, sidx) =>
          Object.entries(section).map(([title, items], idx) => (
            <div key={`${sidx}-${idx}`} className="flex flex-col gap-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                {title}
              </p>
              {items.map((it, i) => (
                <p key={`${sidx}-${idx}-item-${i}`} className="text-sm text-gray-700 leading-relaxed">
                  <ShortExpandable text={String(it)} />
                </p>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
