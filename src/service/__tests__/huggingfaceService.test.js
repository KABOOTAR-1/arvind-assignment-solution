import huggingfaceService from '../huggingfaceService.js';
import { InferenceClient } from '@huggingface/inference';

// Mock the HuggingFace inference client
jest.mock('@huggingface/inference');

describe('HuggingFace Service', () => {
  let mockFeatureExtraction;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockFeatureExtraction = jest.fn();
    InferenceClient.mockImplementation(() => ({
      featureExtraction: mockFeatureExtraction
    }));
  });

  describe('requestEmbedding', () => {
    it('should return embedding vector for valid input', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4];
      mockFeatureExtraction.mockResolvedValue(mockEmbedding);
      
      const result = await huggingfaceService.requestEmbedding('test question');
      
      expect(result).toEqual(mockEmbedding);
      expect(mockFeatureExtraction).toHaveBeenCalledWith({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: 'test question'
      });
    });

    it('should return null when API key is missing', async () => {
      // Mock environment without API key
      const originalEnv = process.env.HF_TOKEN;
      delete process.env.HF_TOKEN;
      
      // Re-import to get fresh instance without API key
      jest.resetModules();
      const { default: serviceWithoutKey } = await import('../huggingfaceService.js');
      
      const result = await serviceWithoutKey.requestEmbedding('test question');
      
      expect(result).toBeNull();
      
      // Restore environment
      process.env.HF_TOKEN = originalEnv;
    });

    it('should return null for unexpected embedding format', async () => {
      mockFeatureExtraction.mockResolvedValue({ unexpected: 'format' });
      
      const result = await huggingfaceService.requestEmbedding('test question');
      
      expect(result).toBeNull();
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('401 Unauthorized');
      mockFeatureExtraction.mockRejectedValue(authError);
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await huggingfaceService.requestEmbedding('test question');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('HuggingFace API error:', '401 Unauthorized');
      expect(consoleSpy).toHaveBeenCalledWith('Authentication error - check HF_TOKEN');
      
      consoleSpy.mockRestore();
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = new Error('429 Too Many Requests');
      mockFeatureExtraction.mockRejectedValue(rateLimitError);
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await huggingfaceService.requestEmbedding('test question');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Rate limit exceeded - too many requests');
      
      consoleSpy.mockRestore();
    });

    it('should handle general API errors', async () => {
      const generalError = new Error('Network error');
      mockFeatureExtraction.mockRejectedValue(generalError);
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await huggingfaceService.requestEmbedding('test question');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('HuggingFace API error:', 'Network error');
      
      consoleSpy.mockRestore();
    });

    it('should handle empty input', async () => {
      const mockEmbedding = [0.0, 0.0, 0.0, 0.0];
      mockFeatureExtraction.mockResolvedValue(mockEmbedding);
      
      const result = await huggingfaceService.requestEmbedding('');
      
      expect(result).toEqual(mockEmbedding);
    });

    it('should handle nested array format', async () => {
      mockFeatureExtraction.mockResolvedValue([[0.1, 0.2, 0.3]]);
      
      const result = await huggingfaceService.requestEmbedding('test');
      
      expect(result).toBeNull();
    });
  });
});
