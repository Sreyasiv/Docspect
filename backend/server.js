// 📁 server.js
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const {
  extractTextFromPDF,
  extractTextFromDocx,
} = require("./utils/textExtractors");
const summarizeWithOpenRouter = require("./utils/summarizer");
const splitIntoChunks = require("./utils/chunker");

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

    // 🧾 Extract text from uploaded file
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

    fs.unlinkSync(file.path); // Remove uploaded file after use
    console.log("📄 Raw text length:", text.length);

    // 🔍 Prompt AI to extract risky clauses
    const riskPrompt =`You are a legal document risk reviewer AI. Extract risky clauses from this part of a contract. Return as JSON array.\n\n${text}`;

    let riskClausesRaw = await summarizeWithOpenRouter(riskPrompt);
    let riskClauses = [];

    // 🛠️ Parse AI response with robust fallback
    try {
      riskClauses = JSON.parse(riskClausesRaw);
    } catch (err) {
      console.warn("❌ Failed to parse risk clause JSON. Falling back to regex split.");

      // Fallback: attempt manual clause extraction
      riskClauses = riskClausesRaw
        .split(/\n|,(?=\s*")/) // split on newline or comma before a quote
        .map((line) =>
          line
            .trim()
            .replace(/^["\d.\s-]+/, "") // remove leading quotes, numbers, dots
            .replace(/"$/, "") // remove trailing quote
        )
        .filter(Boolean);
    }

    if (!Array.isArray(riskClauses)) {
      riskClauses = [String(riskClauses)];
    }

    console.log("🧠 Final parsed risk clauses:", riskClauses);



    //check for relevant case studies
     const casePrompt =`You are a legal document case stud AI. Extract relevant case studies from this part of a contract. Return as JSON array.\n\n${text}`;

    let caseStudiesRaw = await summarizeWithOpenRouter(casePrompt);
    let caseStudies = [];

    // 🛠️ Parse AI response with robust fallback
    try {
      caseStudies = JSON.parse(caseStudiesRaw);
    } catch (err) {
      console.warn("❌ Failed to parse case studies JSON. Falling back to regex split.");

      // Fallback: attempt manual clause extraction
      caseStudies = caseStudiesRaw
        .split(/\n|,(?=\s*")/) // split on newline or comma before a quote
        .map((line) =>
          line
            .trim()
            .replace(/^["\d.\s-]+/, "") // remove leading quotes, numbers, dots
            .replace(/"$/, "") // remove trailing quote
        )
        .filter(Boolean);
    }

    if (!Array.isArray(caseStudies)) {
      caseStudies = [String(caseStudies)];
    }

    console.log("🧠 Final parsed case studies:",caseStudies)

    // ✂️ Split document into chunks and summarize each
   const chunks = splitIntoChunks(text);

const chunkSummaries = await Promise.all(
  chunks.map((chunk) =>
    summarizeWithOpenRouter(
      `You are a legal contract summarizer AI. Read the following contract chunk and return a clear, simplified list of bullet points summarizing it. 
Keep each point short and focused. Use plain English. Avoid legal jargon unless necessary. 
Return the result as a JSON array of strings.\n\n${chunk}`
    )
  )
);

// 🧩 Merge all summaries into a single one
const finalPrompt = `You are a legal document summarizer AI. Below are bullet-point summaries of different sections from a legal contract.

Merge them into one clean, professional summary. 
Return it as a JSON array of clear, grouped bullet points that are easy for a layperson to understand. 
Avoid repetition. Group related points together.\n\n${chunkSummaries.join("\n\n")}`;

const finalSummary = await summarizeWithOpenRouter(finalPrompt);

    // ✅ Prepare API response
    const responsePayload = {
      summary: finalSummary,
      keyClauses: riskClauses, // optional alias
    };

    console.log("📤 Sending response:", responsePayload);

    res.json(responsePayload);
  } catch (err) {
    console.error("❌ Error during /api/summarize:", err);
    res.status(500).json({ error: "Failed to summarize document" });
  }
});

app.listen(3001, () => {
  console.log("🦉 Server running on http://localhost:3001");
});
