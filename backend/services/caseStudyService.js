const axios = require('axios');
// CORRECT — matches how riskDetectionService imports it
const {analyzeWithOpenRouter} = require('../LLM/openRouterClient');

// Mapping of risk types to Indian legal search keywords
const riskTypeKeywordMap = {
  IT: {
    IP: "software intellectual property ownership employee India IT",
    Termination: "IT employee termination notice period India technology company",
    Confidentiality: "confidentiality breach software employee India data",
    Financial: "stipend dispute IT apprenticeship India technology",
    Liability: "liability clause software contract India IT company",
    Compliance: "IT compliance violation employee India technology",
    Legal: "software contract enforceability India IT",
    Operational: "restrictive covenant IT employee India non-compete technology",
    Other: "IT employment contract dispute India technology company",
  },
  Finance: {
    IP: "intellectual property ownership financial sector India",
    Termination: "wrongful termination banking finance employee India",
    Confidentiality: "confidentiality breach banking financial data India",
    Financial: "financial dispute salary bonus banking India",
    Liability: "liability clause banking contract India",
    Compliance: "SEBI compliance violation employee India finance",
    Legal: "financial contract enforceability India banking",
    Operational: "restrictive covenant banking finance India",
    Other: "financial sector employment dispute India",
  },
  Healthcare: {
    IP: "medical intellectual property ownership doctor India",
    Termination: "doctor nurse termination hospital India",
    Confidentiality: "patient data confidentiality breach India healthcare",
    Financial: "salary dispute doctor hospital India",
    Liability: "medical liability malpractice India hospital",
    Compliance: "healthcare compliance violation India hospital",
    Legal: "medical contract enforceability India",
    Operational: "non-compete clause doctor hospital India",
    Other: "healthcare employment dispute India",
  },
  General: {
    IP: "intellectual property ownership employee India",
    Termination: "wrongful termination notice period India",
    Confidentiality: "confidentiality breach employment India",
    Financial: "financial dispute employment contract India",
    Liability: "liability clause contract dispute India",
    Compliance: "compliance violation employment India",
    Legal: "contract enforceability India",
    Operational: "restrictive covenant employment India",
    Other: "employment contract dispute India",
  },
};

// Fallback — unknown sectors use General
function getKeywordMap(sector) {
  return riskTypeKeywordMap[sector] || riskTypeKeywordMap["General"];
}

/**
 * Fetch case studies from Indian Kanoon API for given risks
 * @param {Array} risks - Array of risk objects with risk_type field
 * @returns {Promise<Array>} - Array of case study results
 */

async function detectDocumentSector(risks, contractText) {
  const prompt = `
Look at these risk types found in a contract: ${risks.map(r => r.risk_type).join(", ")}

And this contract excerpt: "${contractText?.slice(0, 500) || ""}"

Reply with ONLY one word from this list — the sector this contract belongs to:
IT, Healthcare, Finance, Education, Manufacturing, Retail, Legal, General

Rules:
- If the contract mentions software, code, data, technology, apprenticeship at a tech company, IP of digital products — reply IT
- If unsure — reply General

Return ONE WORD ONLY. No explanation.
`;
  const raw = await analyzeWithOpenRouter(prompt, { temperature: 0, max_tokens: 10 });
  return raw?.trim().split(/\s+/)[0] || "General";
}

async function fetchCaseStudies(risks, contractText = "") {
  if (!risks || !Array.isArray(risks) || risks.length === 0) {
    return [];
  }

  const token = process.env.INDIAN_KANOON_TOKEN;
  if (!token) {
    console.error('INDIAN_KANOON_TOKEN is not set in environment variables');
    return [];
  }
  const sector = await detectDocumentSector(risks, contractText);
  console.log(`📄 CASE_STUDY_LOG: Detected sector — ${sector}`);

  const keywordMap = getKeywordMap(sector);

  // Deduplicate risk types - filter out any that are missing or not in our map
  const validRiskTypes = risks
    .map(risk => risk.risk_type)
    .filter(riskType => riskType && keywordMap[riskType]);

  const uniqueRiskTypes = [...new Set(validRiskTypes)];

  console.log(`Processing ${uniqueRiskTypes.length} unique valid risk types out of ${risks.length} total risks`);

  const caseStudies = [];

  // Fetch case studies for each unique risk type
  for (const riskType of uniqueRiskTypes) {
    try {
  const keyword = keywordMap[riskType];

      if (!keyword) {
        console.warn(`Unknown risk type: ${riskType}`);
        continue;
      }

      const url = `https://api.indiankanoon.org/search/?formInput=${encodeURIComponent(
        keyword,
      )}&pagenum=0`;

      const response = await axios.post(url, null, {
        headers: {
          Authorization: `Token ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.data && response.data.docs && Array.isArray(response.data.docs)) {
        // Extract top 2 results
        const topDocs = response.data.docs.slice(0, 2);

        for (const doc of topDocs) {
          let relevanceNote = null;

          // Summarize case using OpenRouter
          try {
            const strippedHeadline = doc.headline ? doc.headline.replace(/<[^>]*>/g, '') : '';
            const prompt = `
You are explaining a legal court case to a 20-year-old college student in India who just got their first job offer.

Write EXACTLY one sentence (10-18 words max). 

Rules:
- Zero legal jargon. If you use words like "enforceable", "covenant", "jurisdiction", "plaintiff" — you have failed.
- Connect it directly to what this means for THEM signing a ${riskType} clause.
- Write like a helpful older sibling warning them, not a lawyer.
- Start with what actually happened, end with why they should care.

BAD example: "This case established enforceability of restrictive covenants during employment tenure."
GOOD example: "A company sued an ex-employee for working at a rival — and won."

Case name: ${doc.title}
What it's about: ${strippedHeadline}

Return ONLY the one sentence. No quotes, no punctuation at start, no explanation.
`;

            relevanceNote = await analyzeWithOpenRouter(prompt);
          } catch (llmError) {
            console.error(`Error summarizing case for ${riskType}:`, llmError.message);
            relevanceNote = null;
          }

          caseStudies.push({
            risk_type: riskType,
            title: doc.title,
            docsource: doc.docsource,
            docid: doc.tid,
            url: `https://indiankanoon.org/doc/${doc.tid}`,
            relevanceNote,
          });
        }
      } else {
        console.warn(`No docs found in response for ${riskType}`);
      }
    } catch (error) {
      console.error(`Error fetching case studies for risk type ${riskType}:`, error.message);
      // Continue to next risk type instead of throwing
    }
  }

  return caseStudies;
}

module.exports = {
  fetchCaseStudies,
};
