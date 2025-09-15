import queryController from '../queryController.js';
import Query from '../../models/Query.js';
import contextService from '../../service/contextService.js';
import cacheService from '../../service/cacheService.js';
import auditService from '../../service/auditService.js';

// Mock dependencies
jest.mock('../../models/Query.js');
jest.mock('../../service/contextService.js');
jest.mock('../../service/cacheService.js');
jest.mock('../../service/auditService.js');

describe('Query Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      query: {},
      params: {},
      body: {}
    };
    
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    // Set default environment variables
    process.env.ANALYTICS_DEFAULT_LIMIT = '100';
  });

  describe('processQuery', () => {
    const mockContextResult = {
      context: {
        semanticMatches: [
          { id: 1, question: 'Test Q', answer: 'Test A', similarity: 0.8 }
        ],
        recentQueries: [
          { question: 'Recent Q', answer: 'Recent A' }
        ],
        user: { metadata: { preferences: {} } },
        processingTimeMs: 50
      },
      primaryMatch: { id: 1, question: 'Test Q', answer: 'Test A' },
      confidence: 0.8
    };

    const mockAnswerResult = {
      answer: 'This is the answer',
      confidence: 0.8,
      source: 'semantic_match'
    };

    const mockQueryRecord = {
      id: 123,
      user_id: 1,
      session_id: 'session123',
      question: 'Test question',
      answer: 'This is the answer'
    };

    it('should process query successfully with user context', async () => {
      mockReq.body = {
        question: 'Test question',
        userId: 1,
        sessionId: 'session123'
      };

      contextService.assembleContext.mockResolvedValue(mockContextResult);
      contextService.generateContextualAnswer.mockResolvedValue(mockAnswerResult);
      Query.createQuery.mockResolvedValue(mockQueryRecord);
      auditService.logContextAssembly.mockResolvedValue();

      await queryController.processQuery(mockReq, mockRes);

      expect(contextService.assembleContext).toHaveBeenCalledWith(1, 'Test question', 'session123');
      expect(contextService.generateContextualAnswer).toHaveBeenCalledWith('Test question', mockContextResult.context);
      expect(Query.createQuery).toHaveBeenCalledWith({
        user_id: 1,
        session_id: 'session123',
        question: 'Test question',
        answer: 'This is the answer',
        context_used: mockContextResult.context,
        similarity_score: 0.8,
        response_time_ms: expect.any(Number)
      });
      expect(cacheService.cacheUserQuery).toHaveBeenCalledWith(1, {
        question: 'Test question',
        answer: 'This is the answer',
        similarity_score: 0.8
      });
      expect(auditService.logContextAssembly).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          question: 'Test question',
          answer: 'This is the answer',
          confidence: 0.8,
          source: 'semantic_match',
          queryId: 123,
          responseTime: expect.any(Number),
          context: {
            matchesFound: 1,
            recentQueries: 1,
            hasUserContext: true
          }
        }
      });
    });

    it('should process query without user ID', async () => {
      mockReq.body = {
        question: 'Test question',
        sessionId: 'session123'
      };

      contextService.assembleContext.mockResolvedValue(mockContextResult);
      contextService.generateContextualAnswer.mockResolvedValue(mockAnswerResult);
      Query.createQuery.mockResolvedValue({ ...mockQueryRecord, user_id: null });
      auditService.logContextAssembly.mockResolvedValue();

      await queryController.processQuery(mockReq, mockRes);

      expect(contextService.assembleContext).toHaveBeenCalledWith(undefined, 'Test question', 'session123');
      expect(cacheService.cacheUserQuery).not.toHaveBeenCalled();
    });

    it('should handle context assembly errors', async () => {
      mockReq.body = {
        question: 'Test question',
        userId: 1
      };

      contextService.assembleContext.mockRejectedValue(new Error('Context assembly failed'));

      await queryController.processQuery(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to process query: Context assembly failed'
      });
    });

    it('should handle answer generation errors', async () => {
      mockReq.body = {
        question: 'Test question',
        userId: 1
      };

      contextService.assembleContext.mockResolvedValue(mockContextResult);
      contextService.generateContextualAnswer.mockRejectedValue(new Error('Answer generation failed'));

      await queryController.processQuery(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to process query: Answer generation failed'
      });
    });

    it('should handle database errors during query creation', async () => {
      mockReq.body = {
        question: 'Test question',
        userId: 1
      };

      contextService.assembleContext.mockResolvedValue(mockContextResult);
      contextService.generateContextualAnswer.mockResolvedValue(mockAnswerResult);
      Query.createQuery.mockRejectedValue(new Error('Database error'));

      await queryController.processQuery(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('should handle audit logging errors gracefully', async () => {
      mockReq.body = {
        question: 'Test question',
        userId: 1
      };

      contextService.assembleContext.mockResolvedValue(mockContextResult);
      contextService.generateContextualAnswer.mockResolvedValue(mockAnswerResult);
      Query.createQuery.mockResolvedValue(mockQueryRecord);
      auditService.logContextAssembly.mockRejectedValue(new Error('Audit logging failed'));

      await queryController.processQuery(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAnalytics', () => {
    const mockAuditLogs = [
      {
        id: 1,
        context_assembly_details: { confidence: 0.8 },
        created_at: new Date()
      },
      {
        id: 2,
        context_assembly_details: { confidence: 0.6 },
        created_at: new Date()
      }
    ];

    const mockCacheStats = {
      hits: 10,
      misses: 5,
      keys: 15
    };

    it('should return analytics with default parameters', async () => {
      mockReq.query = {};
      
      auditService.getAuditLogs.mockResolvedValue(mockAuditLogs);
      cacheService.getCacheStats.mockReturnValue(mockCacheStats);

      await queryController.getAnalytics(mockReq, mockRes);

      expect(auditService.getAuditLogs).toHaveBeenCalledWith({
        from: undefined,
        to: undefined,
        limit: 100
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          analytics: {
            totalQueries: 2,
            averageConfidence: 0.7, // (0.8 + 0.6) / 2
            cacheStats: mockCacheStats
          },
          logs: mockAuditLogs
        }
      });
    });

    it('should return analytics with custom parameters', async () => {
      mockReq.query = {
        from: '2023-01-01',
        to: '2023-12-31',
        limit: '50'
      };
      
      auditService.getAuditLogs.mockResolvedValue(mockAuditLogs);
      cacheService.getCacheStats.mockReturnValue(mockCacheStats);

      await queryController.getAnalytics(mockReq, mockRes);

      expect(auditService.getAuditLogs).toHaveBeenCalledWith({
        from: '2023-01-01',
        to: '2023-12-31',
        limit: 50
      });
    });

    it('should handle empty audit logs', async () => {
      mockReq.query = {};
      
      auditService.getAuditLogs.mockResolvedValue([]);
      cacheService.getCacheStats.mockReturnValue(mockCacheStats);

      await queryController.getAnalytics(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          analytics: {
            totalQueries: 0,
            averageConfidence: 0, // 0 / 1 = 0
            cacheStats: mockCacheStats
          },
          logs: []
        }
      });
    });

    it('should handle audit logs without confidence scores', async () => {
      const logsWithoutConfidence = [
        { id: 1, context_assembly_details: {} },
        { id: 2, context_assembly_details: null }
      ];
      
      mockReq.query = {};
      auditService.getAuditLogs.mockResolvedValue(logsWithoutConfidence);
      cacheService.getCacheStats.mockReturnValue(mockCacheStats);

      await queryController.getAnalytics(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          analytics: {
            totalQueries: 2,
            averageConfidence: 0, // (0 + 0) / 2
            cacheStats: mockCacheStats
          },
          logs: logsWithoutConfidence
        }
      });
    });

    it('should handle audit service errors', async () => {
      mockReq.query = {};
      auditService.getAuditLogs.mockRejectedValue(new Error('Audit service error'));

      await queryController.getAnalytics(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Audit service error'
      });
    });
  });

  describe('getAllQueries', () => {
    const mockQueries = [
      { id: 1, question: 'Query 1', answer: 'Answer 1', user_id: 1 },
      { id: 2, question: 'Query 2', answer: 'Answer 2', user_id: 2 }
    ];

    it('should return all queries with default parameters', async () => {
      mockReq.query = {};
      Query.getAllQueries.mockResolvedValue(mockQueries);

      await queryController.getAllQueries(mockReq, mockRes);

      expect(Query.getAllQueries).toHaveBeenCalledWith({
        limit: 50,
        offset: 0,
        userId: undefined
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockQueries
      });
    });

    it('should return queries with custom parameters', async () => {
      mockReq.query = {
        limit: '25',
        offset: '10',
        userId: '1'
      };
      Query.getAllQueries.mockResolvedValue(mockQueries);

      await queryController.getAllQueries(mockReq, mockRes);

      expect(Query.getAllQueries).toHaveBeenCalledWith({
        limit: 25,
        offset: 10,
        userId: '1'
      });
    });

    it('should handle database errors', async () => {
      mockReq.query = {};
      Query.getAllQueries.mockRejectedValue(new Error('Database error'));

      await queryController.getAllQueries(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error'
      });
    });
  });

  describe('getQueryById', () => {
    const mockQuery = {
      id: 1,
      question: 'Test question',
      answer: 'Test answer',
      user_id: 1,
      created_at: new Date()
    };

    it('should return query by ID', async () => {
      mockReq.params = { id: '1' };
      Query.getQueryById.mockResolvedValue(mockQuery);

      await queryController.getQueryById(mockReq, mockRes);

      expect(Query.getQueryById).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockQuery
      });
    });

    it('should return 404 for non-existent query', async () => {
      mockReq.params = { id: '999' };
      Query.getQueryById.mockResolvedValue(null);

      await queryController.getQueryById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Query not found'
      });
    });

    it('should handle database errors', async () => {
      mockReq.params = { id: '1' };
      Query.getQueryById.mockRejectedValue(new Error('Database error'));

      await queryController.getQueryById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error'
      });
    });
  });
});
