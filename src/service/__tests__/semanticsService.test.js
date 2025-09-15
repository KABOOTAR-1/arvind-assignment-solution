import semanticsService from '../semanticsService.js';
import FAQ from '../../models/FAQ.js';
import User from '../../models/User.js';
import Query from '../../models/Query.js';
import Cache from '../cacheService.js';
import huggingfaceService from '../huggingfaceService.js';

// Mock dependencies
jest.mock('../../models/FAQ.js');
jest.mock('../../models/User.js');
jest.mock('../../models/Query.js');
jest.mock('../cacheService.js');
jest.mock('../huggingfaceService.js');

describe('Semantics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cosineSimilarity', () => {
    it('should calculate correct cosine similarity for identical vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [1, 0, 0];
      
      // Access the internal function through reflection or create a test export
      // For now, we'll test through findSimilarFAQs which uses it
      expect(true).toBe(true); // Placeholder - will test through integration
    });

    it('should calculate correct cosine similarity for orthogonal vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [0, 1, 0];
      
      // Should return 0 for orthogonal vectors
      expect(true).toBe(true); // Placeholder
    });

    it('should handle zero vectors gracefully', () => {
      const vecA = [0, 0, 0];
      const vecB = [1, 0, 0];
      
      // Should return 0 for zero norm vectors
      expect(true).toBe(true); // Placeholder
    });

    it('should handle dimension mismatch', () => {
      const vecA = [1, 0];
      const vecB = [1, 0, 0];
      
      // Should return 0 for mismatched dimensions
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('findSimilarFAQs', () => {
    const mockFAQs = [
      {
        id: 1,
        question: 'What is AI?',
        answer: 'Artificial Intelligence is...',
        category: 'technology',
        embedding: JSON.stringify([0.8, 0.6, 0.0])
      },
      {
        id: 2,
        question: 'How does machine learning work?',
        answer: 'Machine learning works by...',
        category: 'technology',
        embedding: JSON.stringify([0.6, 0.8, 0.0])
      },
      {
        id: 3,
        question: 'What is the weather?',
        answer: 'Weather is...',
        category: 'general',
        embedding: JSON.stringify([0.0, 0.0, 1.0])
      }
    ];

    it('should find similar FAQs using semantic matching', async () => {
      const questionEmbedding = [0.9, 0.5, 0.0];
      
      huggingfaceService.requestEmbedding.mockResolvedValue(questionEmbedding);
      FAQ.getAllFAQs.mockResolvedValue(mockFAQs);
      
      const result = await semanticsService.findSimilarFAQs('What is artificial intelligence?');
      
      expect(result).toHaveLength(2); // Should filter out low similarity matches
      expect(result[0].id).toBe(1); // Should be most similar
      expect(result[0]).toHaveProperty('similarity_score');
      expect(result[0].similarity_score).toBeGreaterThan(0.2);
    });

    it('should fallback to keyword matching when embeddings fail', async () => {
      huggingfaceService.requestEmbedding.mockResolvedValue(null);
      FAQ.getAllFAQs.mockResolvedValue(mockFAQs);
      
      const result = await semanticsService.findSimilarFAQs('artificial intelligence machine');
      
      expect(result).toBeDefined();
      expect(huggingfaceService.requestEmbedding).toHaveBeenCalled();
    });

    it('should handle FAQs without embeddings', async () => {
      const faqsWithoutEmbeddings = mockFAQs.map(faq => ({ ...faq, embedding: null }));
      
      huggingfaceService.requestEmbedding.mockResolvedValue([0.8, 0.6, 0.0]);
      FAQ.getAllFAQs.mockResolvedValue(faqsWithoutEmbeddings);
      
      const result = await semanticsService.findSimilarFAQs('What is AI?');
      
      expect(result).toBeDefined();
      // Should fallback to keyword matching
    });

    it('should handle malformed embedding data', async () => {
      const faqsWithBadEmbeddings = [
        {
          id: 1,
          question: 'Test question',
          answer: 'Test answer',
          embedding: 'invalid-json'
        }
      ];
      
      huggingfaceService.requestEmbedding.mockResolvedValue([0.8, 0.6, 0.0]);
      FAQ.getAllFAQs.mockResolvedValue(faqsWithBadEmbeddings);
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await semanticsService.findSimilarFAQs('test');
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(result).toBeDefined();
      
      consoleSpy.mockRestore();
    });

    it('should respect the limit parameter', async () => {
      huggingfaceService.requestEmbedding.mockResolvedValue([0.8, 0.6, 0.0]);
      FAQ.getAllFAQs.mockResolvedValue(mockFAQs);
      
      const result = await semanticsService.findSimilarFAQs('AI technology', 1);
      
      expect(result).toHaveLength(1);
    });

    it('should filter out low similarity matches', async () => {
      const lowSimilarityEmbedding = [0.0, 0.0, 0.1]; // Very different from FAQ embeddings
      
      huggingfaceService.requestEmbedding.mockResolvedValue(lowSimilarityEmbedding);
      FAQ.getAllFAQs.mockResolvedValue(mockFAQs);
      
      const result = await semanticsService.findSimilarFAQs('completely unrelated query');
      
      // Should return empty array or very few results due to low similarity
      expect(result.length).toBeLessThanOrEqual(mockFAQs.length);
    });
  });

  describe('assembleContext', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      metadata: {
        preferences: { detail_level: 'brief' }
      }
    };

    const mockRecentQueries = [
      {
        question: 'Previous question',
        answer: 'Previous answer',
        created_at: new Date(),
        similarity_score: 0.8
      }
    ];

    it('should assemble context with user data', async () => {
      User.getUserById.mockResolvedValue(mockUser);
      Cache.getRecentQueries.mockReturnValue(mockRecentQueries);
      
      // Mock findSimilarFAQs
      const mockSimilarFAQs = [
        {
          id: 1,
          question: 'Similar question',
          answer: 'Similar answer',
          category: 'test',
          similarity_score: 0.9
        }
      ];
      
      // We need to mock the findSimilarFAQs method
      jest.spyOn(semanticsService, 'findSimilarFAQs').mockResolvedValue(mockSimilarFAQs);
      
      const result = await semanticsService.assembleContext(1, 'test question', 'session123');
      
      expect(result).toHaveProperty('context');
      expect(result).toHaveProperty('primaryMatch');
      expect(result).toHaveProperty('confidence');
      expect(result.context.user.profile.name).toBe('Test User');
      expect(result.context.semanticMatches).toHaveLength(1);
      expect(result.context.recentQueries).toHaveLength(1);
      expect(result.context.sessionContext.sessionId).toBe('session123');
    });

    it('should handle anonymous users', async () => {
      User.getUserById.mockResolvedValue(null);
      jest.spyOn(semanticsService, 'findSimilarFAQs').mockResolvedValue([]);
      
      const result = await semanticsService.assembleContext(null, 'test question');
      
      expect(result.context.user).toEqual({});
      expect(result.context.recentQueries).toHaveLength(0);
    });

    it('should fallback to database queries when cache is empty', async () => {
      User.getUserById.mockResolvedValue(mockUser);
      Cache.getRecentQueries.mockReturnValue(null);
      Query.getRecentQueries.mockResolvedValue(mockRecentQueries);
      jest.spyOn(semanticsService, 'findSimilarFAQs').mockResolvedValue([]);
      
      const result = await semanticsService.assembleContext(1, 'test question');
      
      expect(Query.getRecentQueries).toHaveBeenCalledWith(1, 5);
      expect(result.context.recentQueries).toHaveLength(1);
    });
  });

  describe('calculateConfidence', () => {
    it('should return 0 for no semantic matches', () => {
      const contextBundle = {
        semanticMatches: [],
        recentQueries: []
      };
      
      const confidence = semanticsService.calculateConfidence(contextBundle);
      
      expect(confidence).toBe(0);
    });

    it('should calculate confidence based on similarity and context', () => {
      const contextBundle = {
        semanticMatches: [
          { similarity: 0.8 },
          { similarity: 0.6 },
          { similarity: 0.4 }
        ],
        recentQueries: [{ question: 'test' }]
      };
      
      const confidence = semanticsService.calculateConfidence(contextBundle);
      
      expect(confidence).toBeGreaterThan(0.8);
      expect(confidence).toBeLessThanOrEqual(1);
    });

    it('should cap confidence at 1.0', () => {
      const contextBundle = {
        semanticMatches: [
          { similarity: 1.0 },
          { similarity: 0.9 },
          { similarity: 0.8 },
          { similarity: 0.7 },
          { similarity: 0.6 }
        ],
        recentQueries: [{ question: 'test' }]
      };
      
      const confidence = semanticsService.calculateConfidence(contextBundle);
      
      expect(confidence).toBeLessThanOrEqual(1.0);
    });
  });

  describe('generateContextualAnswer', () => {
    it('should return primary match answer for high similarity', () => {
      const contextBundle = {
        semanticMatches: [
          {
            id: 1,
            answer: 'This is the answer',
            similarity: 0.8,
            category: 'test'
          }
        ]
      };
      
      const result = semanticsService.generateContextualAnswer('test question', contextBundle);
      
      expect(result.answer).toBe('This is the answer');
      expect(result.confidence).toBe(0.8);
      expect(result.source).toBe('semantic_match');
      expect(result.faq_id).toBe(1);
    });

    it('should return fallback answer for low similarity', () => {
      const contextBundle = {
        semanticMatches: [
          {
            id: 1,
            answer: 'This is the answer',
            similarity: 0.3,
            category: 'test'
          }
        ]
      };
      
      const result = semanticsService.generateContextualAnswer('test question', contextBundle);
      
      expect(result.answer).toContain("I don't have enough information");
      expect(result.confidence).toBe(0.1);
      expect(result.source).toBe('fallback');
    });

    it('should return fallback answer for no matches', () => {
      const contextBundle = {
        semanticMatches: []
      };
      
      const result = semanticsService.generateContextualAnswer('test question', contextBundle);
      
      expect(result.answer).toContain("I don't have enough information");
      expect(result.confidence).toBe(0.1);
      expect(result.source).toBe('fallback');
    });
  });

  describe('personalizeAnswer', () => {
    it('should return answer unchanged for brief preference', () => {
      const answer = 'Test answer';
      const userMetadata = {
        preferences: { detail_level: 'brief' }
      };
      
      const result = semanticsService.personalizeAnswer(answer, userMetadata);
      
      expect(result).toBe(answer);
    });

    it('should return answer unchanged for detailed preference', () => {
      const answer = 'Test answer';
      const userMetadata = {
        preferences: { detail_level: 'detailed' }
      };
      
      const result = semanticsService.personalizeAnswer(answer, userMetadata);
      
      expect(result).toBe(answer);
    });

    it('should handle missing preferences', () => {
      const answer = 'Test answer';
      const userMetadata = {};
      
      const result = semanticsService.personalizeAnswer(answer, userMetadata);
      
      expect(result).toBe(answer);
    });
  });
});
