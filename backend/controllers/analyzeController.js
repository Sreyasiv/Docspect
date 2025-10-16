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

    let text = "";
    if (file.mimetype === "application/pdf") {
      text = await extractTextFromPDF(file.path);
    } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      text = await extractTextFromDocx(file.path);
    } else {
      console.log(" ANALYZE_LOG: Unsupported file type:", file.mimetype);
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // --- LOG 1: Input Data Size ---
    console.log(`🔎 ANALYZE_LOG: Document text extracted. Size: ${text.length} characters.`);
    fs.unlinkSync(file.path);

    // Run summarization and risk detection in parallel
    const [summaryResult, riskResult] = await Promise.all([
      summarizeDocument(text),
      detectRiskClauses(text)
    ]);
    
    // --- LOG 2: Results from Services ---
    console.log("🔎 ANALYZE_LOG: Summarization Service returned:", summaryResult ? { keys: Object.keys(summaryResult), summaryLength: summaryResult.summary?.length, truncated: summaryResult.truncated } : "null");
    console.log("🔎 ANALYZE_LOG: Risk Detection Service returned:", riskResult ? `${riskResult.length} risks detected.` : "null");


    // ---CRITICAL FIX: MAP LLM KEYS TO FRONTEND KEYS ---
    const risks = riskResult ?? [];
    
    // The RiskClauseList component expects clause_snippet and ai_suggestion.
    // The LLM provides 'clause' and 'explanation'. We must map them here.
    const formattedRisks = risks.map(r => ({
        // Map 'clause' to 'clause_snippet'
        clause_snippet: r.clause, 
        // Map 'explanation' to 'ai_suggestion'
        ai_suggestion: r.explanation, 
        // Keep other fields (severity, risk_type) for component logic
        severity: r.severity,
        risk_type: r.risk_type,
    }));
    // --- END CRITICAL FIX ---


    // --- LLM RISK CLAUSE INJECTION ---
    const llmDisclaimerRequired = true;
    const llmWarnings = [
      "AI Analysis is an ASSISTANT, NOT a substitute for professional legal advice.",
      "LLM output may contain **Hallucinations** (inaccuracies or fabrications). Always verify against the original document.",
      "The service is provided 'AS IS' and accuracy is not warranted.",
    ];
    
    // Construct unified response using the formatted array
    const response = {
      ok: true,
      summary: summaryResult?.summary || [],
      risks: formattedRisks, // 👈 USE THE MAPPED ARRAY
      truncated: !!summaryResult?.truncated,
      llmDisclaimerRequired,
      llmWarnings,
    };

    // --- LOG 3: FINAL RESPONSE OBJECT ---
    console.log("=========================================================");
    console.log("FINAL RESPONSE PAYLOAD SENT TO FRONTEND:");
    console.log(`  - ok: ${response.ok}`);
    console.log(`  - summary: [${response.summary?.length || 0} sections]`);
    console.log(`  - risks: [${response.risks?.length || 0} clauses]`);
    console.log(`  - truncated: ${response.truncated}`);
    console.log(`  - llmDisclaimerRequired: ${response.llmDisclaimerRequired}`);
    console.log(`  - llmWarnings: [${response.llmWarnings?.length || 0} warnings]`);
    
    // Log a sample of the actual data to verify content
    if (response.risks?.length > 0) {
        // Log sample using the new mapped keys to confirm structure is correct
        console.log(`  - Risk Sample (Mapped): Clause Snippet Exists: ${!!response.risks[0].clause_snippet}, AI Suggestion Exists: ${!!response.risks[0].ai_suggestion}`);
    }
    console.log("=========================================================");

    res.json(response);
    console.log("Document analyzed successfully! (Response Sent)");
  } catch (err) {
    console.error(" Error in analyzeDocumentHandler:", err);
    res.status(500).json({ error: "Failed to analyze document" });
  }
}

module.exports = { analyzeDocumentHandler };