const fs = require("fs");
const { extractTextFromPDF, extractTextFromDocx } = require("../services/fileProcessing");
const summarizeDocument = require("../services/summarizationService");

async function summarizeDocumentHandler(req, res) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    let text = "";
    if (file.mimetype === "application/pdf") {
      text = await extractTextFromPDF(file.path);
    } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      text = await extractTextFromDocx(file.path);
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    fs.unlinkSync(file.path);
    const  summary = await summarizeDocument(text);

    res.json({ ok: true, summary: summary.summary, raw: summary.raw ?? null, truncated: !!summary.truncated });
    console.log("📄 Document summarized successfully", summary);
  } catch (err) {
    console.error("❌ Error in summarizeDocumentHandler:", err);
    res.status(500).json({ error: "Failed to summarize document" });
  }
}

module.exports = { summarizeDocumentHandler };
