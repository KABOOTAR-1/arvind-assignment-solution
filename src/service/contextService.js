import FAQ from '../models/FAQ.js';
import User from '../models/User.js';
import Query from '../models/Query.js';
import SemanticMatcher from './semanticsService.js';
import Cache from './cacheService.js';


async function assembleContext(userId, userQuestion, sessionId = null) {
  const startTime = Date.now();

  try {
    const user = userId ? await User.getUserById(userId) : null;
    const userContext = user
      ? {
          metadata: user.metadata,
          preferences: user.metadata?.preferences || {},
          profile: {
            name: user.name,
            email: user.email
          }
        }
      : {};

    const semanticMatches = await SemanticMatcher.findSimilarFAQs(userQuestion, parseInt(process.env.CONTEXT_SEMANTIC_MATCHES_LIMIT) || 5);

    let recentQueries = [];
    if (userId) {
      recentQueries =
        Cache.getRecentQueries(userId) || (await Query.getRecentQueries(userId, parseInt(process.env.CONTEXT_RECENT_QUERIES_LIMIT) || 5));
    }

    const contextBundle = {
      user: userContext,
      semanticMatches: semanticMatches.map(match => ({
        id: match.id,
        question: match.question,
        answer: match.answer,
        category: match.category,
        similarity: match.similarity_score || match.sim_score
      })),
      recentQueries: recentQueries.map(query => ({
        question: query.question,
        answer: query.answer,
        timestamp: query.created_at,
        similarity: query.similarity_score
      })),
      sessionContext: sessionId ? { sessionId } : {},
      assemblyTimestamp: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime
    };

    return {
      context: contextBundle,
      primaryMatch: semanticMatches[0] || null,
      confidence: calculateConfidence(contextBundle)
    };
  } catch (error) {
    console.error('Context assembly error:', error);
    throw new Error('Failed to assemble context: ' + error.message);
  }
}

function calculateConfidence(contextBundle) {
  const { semanticMatches, recentQueries } = contextBundle;

  if (!semanticMatches.length) return 0;

  const primarySimilarity = semanticMatches[0]?.similarity || 0;
  const hasRecentContext = recentQueries.length > 0 ? 0.1 : 0;
  const matchCount = Math.min(semanticMatches.length / 5, 1) * 0.1;

  return Math.min(primarySimilarity + hasRecentContext + matchCount, 1);
}

async function generateContextualAnswer(question, contextBundle) {
  const primaryMatch = contextBundle.semanticMatches[0];

  if (!primaryMatch || primaryMatch.similarity < (parseFloat(process.env.CONTEXT_SIMILARITY_THRESHOLD) || 0.5)) {
    return {
      answer:
        "I don't have enough information to answer that question accurately. Could you please rephrase or provide more details?",
      confidence: 0.1,
      source: 'fallback'
    };
  }
  let answer = primaryMatch.answer;


  return {
    answer,
    confidence: primaryMatch.similarity,
    source: 'semantic_match',
    faq_id: primaryMatch.id,
    category: primaryMatch.category
  };
}


export default {
  assembleContext,
  generateContextualAnswer,
  calculateConfidence,
};
