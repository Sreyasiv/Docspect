require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const fs = require('fs');
const app=express()

app.use(express.json())
const cors = require("cors");

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));


if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const upload = multer({ dest: 'uploads/' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// 🧠 Claude-compatible summarizer via OpenRouter
async function summarizeWithOpenRouter(prompt) {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'anthropic/claude-3-sonnet-20240229',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3001', // or your live website/github
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}

// 🧾 Extract text from PDF
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

// 📝 Extract text from DOCX
async function extractTextFromDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

// ✂️ Split into manageable GPT chunks (~1500 tokens)
function splitIntoChunks(text, maxTokens = 1500) {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  let chunks = [], chunk = '', tokenEstimate = 0;

  for (let sentence of sentences) {
    const tokenCount = Math.ceil(sentence.length / 4); // rough token count
    if (tokenEstimate + tokenCount > maxTokens) {
      chunks.push(chunk);
      chunk = sentence;
      tokenEstimate = tokenCount;
    } else {
      chunk += sentence;
      tokenEstimate += tokenCount;
    }
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}

// 📤 Upload & summarize route
app.post('/api/summarize', upload.single('document'), async (req, res) => {
  try {
    const file = req.file;
    let text = '';

    if (file.mimetype === 'application/pdf') {
      text = await extractTextFromPDF(file.path);
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      text = await extractTextFromDocx(file.path);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Delete uploaded file
    fs.unlinkSync(file.path);

    // Split + summarize
    const chunks = splitIntoChunks(text);
    let chunkSummaries = [];

    for (let i = 0; i < chunks.length; i++) {
      const prompt = `Summarize the following part of a legal contract into clear, professional bullet points that are easy to understand:\n\n${chunks[i]}`;
      const summary = await summarizeWithOpenRouter(prompt);
      chunkSummaries.push(summary);
    }

    const finalPrompt = `Here are detailed bullet-point summaries of sections from a legal document:\n\n${chunkSummaries.join(
      '\n\n'
    )}\n\nPlease merge these into a single bullet-point summary that is easy for a layperson to understand. Use simple language and group related points together.`;
    const finalSummary = await summarizeWithOpenRouter(finalPrompt);

    res.json({ summary: finalSummary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to summarize document' });
  }
});

app.listen(3001, () => {
  console.log('🦉 Server running on http://localhost:3001');
});
