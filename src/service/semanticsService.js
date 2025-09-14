import FAQ from '../models/FAQ.js';
import User from '../models/User.js';
import Query from '../models/Query.js';
import Cache from './cacheService.js';

async function assembleContext(userId, userQuestion, sessionId = null) {
    const startTime = Date.now();
    const user = userId ? await User.getUserById(userId) : null;
    const userContext = user
        ? { metadata: user.metadata, preferences: user.metadata?.preferences || {}, profile: { name: user.name, email: user.email } }
        : {};
    const semanticMatches = [];
    let recentQueries = [];
    if (userId) recentQueries = Cache.getRecentQueries(userId) || (await Query.getRecentQueries(userId, 5));
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
    return { context: contextBundle, primaryMatch: semanticMatches[0] || null, confidence: calculateConfidence(contextBundle) };
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
    if (!primaryMatch || primaryMatch.similarity < 0.5) 
        return { answer: "I don't have enough information to answer that question accurately. Could you please rephrase or provide more details?", confidence: 0.1, source: 'fallback' };
    return { answer: primaryMatch.answer, confidence: primaryMatch.similarity, source: 'semantic_match', faq_id: primaryMatch.id, category: primaryMatch.category };
}

async function findSimilarFAQs(question, limit = 5) {
    try {
        const allFAQs = await FAQ.getAllFAQs();

        const questionWords = question.toLowerCase().split(/\s+/);
        const matches = [];

        for (const faq of allFAQs) {
            const faqText = (faq.question + ' ' + faq.answer).toLowerCase();
            let score = 0;

            for (const word of questionWords) {
                if (word.length > 2 && faqText.includes(word)) {
                    score += 1;
                }
            }

            if (score > 0) {
                matches.push({
                    ...faq,
                    similarity_score: Math.min(score / questionWords.length, 1)
                });
            }
        }

        return matches
            .sort((a, b) => b.similarity_score - a.similarity_score)
            .slice(0, limit);

    } catch (error) {
        console.error('Error in findSimilarFAQs:', error);
        return [];
    }
}

function personalizeAnswer(answer, userMetadata) {
    if (userMetadata.preferences?.detail_level === 'brief') return answer;
    if (userMetadata.preferences?.detail_level === 'detailed') return answer;
    return answer;
}

export default { assembleContext, generateContextualAnswer, calculateConfidence, findSimilarFAQs, personalizeAnswer };
