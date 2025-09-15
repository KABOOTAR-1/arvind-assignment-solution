import dotenv from 'dotenv';
dotenv.config();
import { InferenceClient } from '@huggingface/inference';

const apiKey = process.env.HF_TOKEN;
const model = process.env.HF_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

let hf;
if (apiKey) hf = new InferenceClient(apiKey);

async function requestEmbedding(text) {
  if (!hf) {
    console.log('HuggingFace client not initialized - API key missing');
    return null;
  }
  try {
    const result = await hf.featureExtraction({ model: model, inputs: text });
    
    if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'number') {
      return result;
    } else {
      console.error('Unexpected embedding format:', typeof result, Array.isArray(result));
      return null;
    }
  } catch (error) {
    console.error('HuggingFace API error:', error.message);
    if (error.message.includes('401')) {
      console.error('Authentication error - check HF_TOKEN');
    } else if (error.message.includes('429')) {
      console.error('Rate limit exceeded - too many requests');
    }
    return null;
  }
}

export default { requestEmbedding };
