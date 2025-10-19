// controllers/analyzeController.js
const fs = require("fs");
const { extractTextFromPDF, extractTextFromDocx } = require("../services/fileProcessing");
const summarizeDocument = require("../services/summarizationService");
const detectRiskClauses = require("../services/riskDetectionService");

async function analyzeDocumentHandler(req, res) {
  try {
    const file = req.file;
    if (!file) {
      console.log(" ANALYZE_LOG: No file uploaded.");
      return res.status(400).json({ error: "No file uploaded" });
    }

    // --- Extract text ---
    let text = "";
    if (file.mimetype === "application/pdf") {
      text = await extractTextFromPDF(file.path);
    } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      text = await extractTextFromDocx(file.path);
    } else {
      console.log(" ANALYZE_LOG: Unsupported file type:", file.mimetype);
      return res.status(400).json({ error: "Unsupported file type" });
    }

    console.log(`🔎 ANALYZE_LOG: Document text extracted. Size: ${text.length} characters.`);
    fs.unlinkSync(file.path);

    // --- Run summarization and risk detection in parallel ---
    const [summaryResult, riskResultObj] = await Promise.all([
      summarizeDocument(text),
      detectRiskClauses(text) // ⚡ now returns { clauses, riskScore }
    ]);

    // --- Extract clauses and AI-generated score ---
    const riskClausesRaw = riskResultObj?.clauses ?? [];
    const riskScore = riskResultObj?.riskScore ?? 0;

    // --- Map AI keys to frontend keys ---
    const formattedRisks = riskClausesRaw.map(r => ({
      clause_snippet: r.clause,      // 'clause' -> 'clause_snippet'
      ai_suggestion: r.explanation,  // 'explanation' -> 'ai_suggestion'
      severity: r.severity,
      risk_type: r.risk_type,
    }));

    // --- LLM disclaimer info ---
    const llmDisclaimerRequired = true;
    const llmWarnings = [
      "AI Analysis is an ASSISTANT, NOT a substitute for professional legal advice.",
      "LLM output may contain **Hallucinations** (inaccuracies or fabrications). Always verify against the original document.",
      "The service is provided 'AS IS' and accuracy is not warranted.",
    ];

    // --- Construct unified response ---
    const response = {
      ok: true,
      summary: summaryResult?.summary || [],
      risks: formattedRisks,       // mapped array for frontend
      riskScore,                   // ⚡ AI-generated score included
      truncated: !!summaryResult?.truncated,
      llmDisclaimerRequired,
      llmWarnings,
    };

    // --- Logs ---
    console.log("=========================================================");
    console.log("FINAL RESPONSE PAYLOAD SENT TO FRONTEND:");
    console.log(`  - ok: ${response.ok}`);
    console.log(`  - summary: [${response.summary?.length || 0} sections]`);
    console.log(`  - risks: [${response.risks?.length || 0} clauses]`);
    console.log(`  - riskScore: ${response.riskScore}`); // ⚡ log the AI score
    console.log(`  - truncated: ${response.truncated}`);
    console.log(`  - llmDisclaimerRequired: ${response.llmDisclaimerRequired}`);
    console.log(`  - llmWarnings: [${response.llmWarnings?.length || 0} warnings]`);
    if (response.risks?.length > 0) {
      console.log(`  - Risk Sample (Mapped): Clause Snippet Exists: ${!!response.risks[0].clause_snippet}, AI Suggestion Exists: ${!!response.risks[0].ai_suggestion}`);
    }
    console.log("=========================================================");

    // --- Send response ---
    res.json(response);
    console.log("Document analyzed successfully! (Response Sent)");

  } catch (err) {
    console.error(" Error in analyzeDocumentHandler:", err);
    res.status(500).json({ error: "Failed to analyze document" });
  }
}

module.exports = { analyzeDocumentHandler };
