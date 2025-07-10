const fs = require("fs");
const { extractTextFromPDF, extractTextFromDocx } = require("../utils/textExtractors");
const summarizeWithOpenRouter = require("../utils/summarizer");
const splitIntoChunks = require("../utils/chunker");

async function summarizeDocument(text) {
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

  const finalPrompt = `You are a legal document summarizer AI. Below are bullet-point summaries of different sections from a legal contract.
Merge them into one clean, professional summary. 
Return it as a JSON array of clear, grouped bullet points that are easy for a layperson to understand. 
Avoid repetition. Group related points together.\n\n${chunkSummaries.join("\n\n")}`;

  const finalSummary = await summarizeWithOpenRouter(finalPrompt);

  return {
    summary: finalSummary,
    keyClauses: chunkSummaries.flat(), // Optional: treat chunk bullets as "keyClauses"
    recommendations: [], // You can generate recommendations separately later
  };
}

module.exports = summarizeDocument;
