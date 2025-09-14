import Query from '../models/Query.js';
import contextService from '../service/contextService.js';
import cacheService from '../service/cacheService.js';
import auditService from '../service/auditService.js';

const processQuery = async (req, res) => {
  const startTime = Date.now();

  try {
    const { question, userId, sessionId } = req.body;
    const contextResult = await contextService.assembleContext(userId, question, sessionId);
    const answerResult = await contextService.generateContextualAnswer(question, contextResult.context);

    const queryRecord = await Query.createQuery({
      user_id: userId,
      session_id: sessionId,
      question,
      answer: answerResult.answer,
      context_used: contextResult.context,
      similarity_score: answerResult.confidence,
      response_time_ms: Date.now() - startTime
    });

    if (userId) {
      cacheService.cacheUserQuery(userId, {
        question,
        answer: answerResult.answer,
        similarity_score: answerResult.confidence
      });
    }

    await auditService.logContextAssembly(queryRecord.id, {
      contextSources: {
        semanticMatches: contextResult.context.semanticMatches.length,
        recentQueries: contextResult.context.recentQueries.length,
        userContext: !!contextResult.context.user.metadata
      },
      matchingAlgorithm: 'semantic_similarity',
      assemblyDetails: {
        primaryMatchId: contextResult.primaryMatch?.id,
        confidence: contextResult.confidence,
        processingTime: contextResult.context.processingTimeMs
      },
      performanceMetrics: {
        totalResponseTime: Date.now() - startTime,
        contextAssemblyTime: contextResult.context.processingTimeMs
      }
    });

    res.json({
      success: true,
      data: {
        question,
        answer: answerResult.answer,
        confidence: answerResult.confidence,
        source: answerResult.source,
        queryId: queryRecord.id,
        responseTime: Date.now() - startTime,
        context: {
          matchesFound: contextResult.context.semanticMatches.length,
          recentQueries: contextResult.context.recentQueries.length,
          hasUserContext: !!contextResult.context.user.metadata
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process query: ' + error.message
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { from, to, limit = parseInt(process.env.ANALYTICS_DEFAULT_LIMIT) || 100 } = req.query;
    const auditLogs = await auditService.getAuditLogs({ from, to, limit });

    const analytics = {
      totalQueries: auditLogs.length,
      averageConfidence:
        auditLogs.reduce((sum, log) => sum + (log.context_assembly_details?.confidence || 0), 0) /
        (auditLogs.length || 1),
      cacheStats: cacheService.getCacheStats()
    };

    res.json({ success: true, data: { analytics, logs: auditLogs } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllQueries = async (req, res) => {
  try {
    const { limit = 50, offset = 0, userId } = req.query;
    const queries = await Query.getAllQueries({ 
      limit: parseInt(limit), 
      offset: parseInt(offset),
      userId 
    });
    res.json({ success: true, data: queries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getQueryById = async (req, res) => {
  try {
    const query = await Query.getQueryById(req.params.id);
    if (!query) {
      return res.status(404).json({ success: false, error: 'Query not found' });
    }
    res.json({ success: true, data: query });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export default {
  processQuery,
  getAnalytics,
  getAllQueries,
  getQueryById
};