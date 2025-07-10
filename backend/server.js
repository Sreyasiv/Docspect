require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");

const {
  extractTextFromPDF,
  extractTextFromDocx,
} = require("./utils/textExtractors");

const extractRiskClauses = require("./routes/riskClauses");
const extractCaseStudies = require("./routes/caseStudies");
const summarizeDocument = require("./routes/summary");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const upload = multer({ dest: "uploads/" });

app.post("/api/summarize", upload.single("document"), async (req, res) => {
  try {
    const file = req.file;
    let text = "";

    // 🔍 Extract text from uploaded document
    if (file.mimetype === "application/pdf") {
      text = await extractTextFromPDF(file.path);
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await extractTextFromDocx(file.path);
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    fs.unlinkSync(file.path); // Clean up file

    console.log("📄 Extracted text length:", text.length);

    // 🧠 Analyze using modular route logic
    const riskClauses = await extractRiskClauses(text);
    const caseStudies = await extractCaseStudies(text);
    const { summary, keyClauses, recommendations } = await summarizeDocument(text);

    // ✅ Send all in one payload
    res.json({
      summary,
      keyClauses,
      riskClauses,
      caseStudies,
      recommendations,
    });
  } catch (err) {
    console.error("❌ Error during /api/summarize:", err);
    res.status(500).json({ error: "Failed to summarize document" });
  }
});

app.listen(3001, () => {
  console.log("🦉 Server running on http://localhost:3001");
});
