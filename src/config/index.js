export const huggingface = {
  apiKey: process.env.HF_TOKEN,
  model: process.env.HF_MODEL || 'sentence-transformers/all-MiniLM-L6-v2'
};

export default {
  huggingface
};