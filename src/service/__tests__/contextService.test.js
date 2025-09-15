import contextService from '../contextService.js';
import FAQ from '../../models/FAQ.js';
import User from '../../models/User.js';
import Query from '../../models/Query.js';
import SemanticMatcher from '../semanticsService.js';
import Cache from '../cacheService.js';

// Mock dependencies
jest.mock('../../models/FAQ.js');
jest.mock('../../models/User.js');
jest.mock('../../models/Query.js');
jest.mock('../semanticsService.js');
jest.mock('../cacheService.js');

describe('Context Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default environment variables
    process.env.CONTEXT_SEMANTIC_MATCHES_LIMIT = '5';
    process.env.CONTEXT_RECENT_QUERIES_LIMIT = '5';
    process.env.CONTEXT_SIMILARITY_THRESHOLD = '0.5';
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

    const mockSemanticMatches = [
      {
        id: 1,
        question: 'What is AI?',
        answer: 'AI is artificial intelligence',
        category: 'technology',
        similarity_score: 0.9
      },
      {
        id: 2,
        question: 'How does ML work?',
        answer: 'ML works through algorithms',
        category: 'technology',
        similarity_score: 0.7
      }
    ];

    const mockRecentQueries = [
      {
        question: 'Previous question',
        answer: 'Previous answer',
        created_at: new Date('2023-01-01'),
        similarity_score: 0.8
      }
    ];

    it('should assemble context with user data and semantic matches', async () => {
      User.getUserById.mockResolvedValue(mockUser);
      SemanticMatcher.findSimilarFAQs.mockResolvedValue(mockSemanticMatches);
      Cache.getRecentQueries.mockReturnValue(mockRecentQueries);

      const result = await contextService.assembleContext(1, 'What is artificial intelligence?', 'session123');

      expect(result).toHaveProperty('context');
      expect(result).toHaveProperty('primaryMatch');
      expect(result).toHaveProperty('confidence');

      expect(result.context.user.profile.name).toBe('Test User');
      expect(result.context.user.profile.email).toBe('test@example.com');
      expect(result.context.user.preferences.detail_level).toBe('brief');

      expect(result.context.semanticMatches).toHaveLength(2);
      expect(result.context.semanticMatches[0].id).toBe(1);
      expect(result.context.semanticMatches[0].similarity).toBe(0.9);

      expect(result.context.recentQueries).toHaveLength(1);
      expect(result.context.recentQueries[0].question).toBe('Previous question');

      expect(result.context.sessionContext.sessionId).toBe('session123');
      expect(result.primaryMatch.id).toBe(1);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should handle anonymous users (no userId)', async () => {
      SemanticMatcher.findSimilarFAQs.mockResolvedValue(mockSemanticMatches);

      const result = await contextService.assembleContext(null, 'test question');

      expect(User.getUserById).not.toHaveBeenCalled();
      expect(result.context.user).toEqual({});
      expect(result.context.recentQueries).toHaveLength(0);
      expect(result.context.semanticMatches).toHaveLength(2);
    });

    it('should fallback to database when cache is empty', async () => {
      User.getUserById.mockResolvedValue(mockUser);
      SemanticMatcher.findSimilarFAQs.mockResolvedValue(mockSemanticMatches);
      Cache.getRecentQueries.mockReturnValue(null);
      Query.getRecentQueries.mockResolvedValue(mockRecentQueries);

      const result = await contextService.assembleContext(1, 'test question');

      expect(Cache.getRecentQueries).toHaveBeenCalledWith(1);
      expect(Query.getRecentQueries).toHaveBeenCalledWith(1, 5);
      expect(result.context.recentQueries).toHaveLength(1);
    });

    it('should handle missing session ID', async () => {
      User.getUserById.mockResolvedValue(mockUser);
      SemanticMatcher.findSimilarFAQs.mockResolvedValue(mockSemanticMatches);
      Cache.getRecentQueries.mockReturnValue([]);

      const result = await contextService.assembleContext(1, 'test question');

      expect(result.context.sessionContext).toEqual({});
    });

    it('should handle errors gracefully', async () => {
      User.getUserById.mockRejectedValue(new Error('Database error'));

      await expect(contextService.assembleContext(1, 'test question'))
        .rejects.toThrow('Failed to assemble context: Database error');
    });

    it('should respect environment variable limits', async () => {
      process.env.CONTEXT_SEMANTIC_MATCHES_LIMIT = '3';
      process.env.CONTEXT_RECENT_QUERIES_LIMIT = '2';

      User.getUserById.mockResolvedValue(mockUser);
      SemanticMatcher.findSimilarFAQs.mockResolvedValue(mockSemanticMatches);
      Cache.getRecentQueries.mockReturnValue(mockRecentQueries);

      await contextService.assembleContext(1, 'test question');

      expect(SemanticMatcher.findSimilarFAQs).toHaveBeenCalledWith('test question', 3);
    });

    it('should include processing time in context', async () => {
      User.getUserById.mockResolvedValue(mockUser);
      SemanticMatcher.findSimilarFAQs.mockResolvedValue(mockSemanticMatches);
      Cache.getRecentQueries.mockReturnValue([]);

      const result = await contextService.assembleContext(1, 'test question');

      expect(result.context.processingTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.context.assemblyTimestamp).toBeDefined();
    });
  });

  describe('calculateConfidence', () => {
    it('should return 0 for no semantic matches', () => {
      const contextBundle = {
        semanticMatches: [],
        recentQueries: []
      };

      const confidence = contextService.calculateConfidence(contextBundle);

      expect(confidence).toBe(0);
    });

    it('should calculate confidence based on primary similarity', () => {
      const contextBundle = {
        semanticMatches: [
          { similarity: 0.8 }
        ],
        recentQueries: []
      };

      const confidence = contextService.calculateConfidence(contextBundle);

      expect(confidence).toBe(0.8);
    });

    it('should add bonus for recent queries', () => {
      const contextBundle = {
        semanticMatches: [
          { similarity: 0.7 }
        ],
        recentQueries: [
          { question: 'test' }
        ]
      };

      const confidence = contextService.calculateConfidence(contextBundle);

      expect(confidence).toBe(0.8); // 0.7 + 0.1 for recent queries
    });

    it('should add bonus for multiple matches', () => {
      const contextBundle = {
        semanticMatches: [
          { similarity: 0.6 },
          { similarity: 0.5 },
          { similarity: 0.4 },
          { similarity: 0.3 },
          { similarity: 0.2 }
        ],
        recentQueries: []
      };

      const confidence = contextService.calculateConfidence(contextBundle);

      expect(confidence).toBe(0.7); // 0.6 + 0.1 for 5 matches
    });

    it('should cap confidence at 1.0', () => {
      const contextBundle = {
        semanticMatches: [
          { similarity: 0.95 }
        ],
        recentQueries: [
          { question: 'test1' },
          { question: 'test2' }
        ]
      };

      const confidence = contextService.calculateConfidence(contextBundle);

      expect(confidence).toBe(1.0); // Capped at 1.0
    });

    it('should handle missing similarity scores', () => {
      const contextBundle = {
        semanticMatches: [
          { /* no similarity score */ }
        ],
        recentQueries: []
      };

      const confidence = contextService.calculateConfidence(contextBundle);

      expect(confidence).toBe(0);
    });
  });

  describe('generateContextualAnswer', () => {
    it('should return primary match for high similarity', () => {
      const contextBundle = {
        semanticMatches: [
          {
            id: 1,
            answer: 'This is the correct answer',
            similarity: 0.8,
            category: 'technology'
          }
        ]
      };

      const result = contextService.generateContextualAnswer('test question', contextBundle);

      expect(result.answer).toBe('This is the correct answer');
      expect(result.confidence).toBe(0.8);
      expect(result.source).toBe('semantic_match');
      expect(result.faq_id).toBe(1);
      expect(result.category).toBe('technology');
    });

    it('should return fallback for low similarity', () => {
      const contextBundle = {
        semanticMatches: [
          {
            id: 1,
            answer: 'This is an answer',
            similarity: 0.3, // Below default threshold of 0.5
            category: 'technology'
          }
        ]
      };

      const result = contextService.generateContextualAnswer('test question', contextBundle);

      expect(result.answer).toContain("I don't have enough information");
      expect(result.confidence).toBe(0.1);
      expect(result.source).toBe('fallback');
    });

    it('should return fallback for no matches', () => {
      const contextBundle = {
        semanticMatches: []
      };

      const result = contextService.generateContextualAnswer('test question', contextBundle);

      expect(result.answer).toContain("I don't have enough information");
      expect(result.confidence).toBe(0.1);
      expect(result.source).toBe('fallback');
    });

    it('should respect custom similarity threshold from environment', () => {
      process.env.CONTEXT_SIMILARITY_THRESHOLD = '0.7';

      const contextBundle = {
        semanticMatches: [
          {
            id: 1,
            answer: 'This is an answer',
            similarity: 0.6, // Below custom threshold of 0.7
            category: 'technology'
          }
        ]
      };

      const result = contextService.generateContextualAnswer('test question', contextBundle);

      expect(result.source).toBe('fallback');
    });

    it('should handle missing primary match', () => {
      const contextBundle = {
        semanticMatches: [null] // Null primary match
      };

      const result = contextService.generateContextualAnswer('test question', contextBundle);

      expect(result.source).toBe('fallback');
    });

    it('should handle undefined similarity in primary match', () => {
      const contextBundle = {
        semanticMatches: [
          {
            id: 1,
            answer: 'This is an answer',
            // similarity is undefined
            category: 'technology'
          }
        ]
      };

      const result = contextService.generateContextualAnswer('test question', contextBundle);

      expect(result.source).toBe('fallback');
    });
  });
});
