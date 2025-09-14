import { huggingface } from '../config/index.js';
import { InferenceClient } from '@huggingface/inference';

let hf;
if (huggingface.apiKey) hf = new InferenceClient(huggingface.apiKey);

async function requestEmbedding(text) {
  if (!hf) return null;
  try {
    const result = await hf.featureExtraction({ model: huggingface.model, inputs: text });
    const sentenceEmbedding = result[0].map((_, i) =>
      result.reduce((sum, token) => sum + token[i], 0) / result.length
    );
    return sentenceEmbedding;
  } catch {
    return null;
  }
}

export default { requestEmbedding };
