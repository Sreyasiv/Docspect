function splitIntoChunks(text, maxTokens = 1500) {
  const sentences = text.match(/[^.?!]+[.?!]+/g) || [text];
  const chunks = [];
  let chunk = '';
  let tokenEstimate = 0;

  for (let sentence of sentences) {
    const tokenCount = Math.ceil(sentence.length / 4);
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

module.exports = splitIntoChunks;
