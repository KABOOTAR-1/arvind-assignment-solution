import FAQ from '../models/FAQ.js';
import User from '../models/User.js';
import Query from '../models/Query.js';
import Cache from './cacheService.js';
import huggingfaceService from './huggingfaceService.js';

async function assembleContext(userId, userQuestion, sessionId = null) {
    const startTime = Date.now();
    const user = userId ? await User.getUserById(userId) : null;
    const userContext = user
        ? { metadata: user.metadata, preferences: user.metadata?.preferences || {}, profile: { name: user.name, email: user.email } }
        : {};
    const semanticMatches = await findSimilarFAQs(userQuestion);
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
        const questionEmbedding = await huggingfaceService.requestEmbedding(question);
        
        if (!questionEmbedding) {
            return await findSimilarFAQsKeyword(question, limit);
        }

        const allFAQs = await FAQ.getAllFAQs();
        const faqsWithEmbeddings = allFAQs.filter(faq => faq.embedding);
        
        if (faqsWithEmbeddings.length === 0) {
            return await findSimilarFAQsKeyword(question, limit);
        }

        const matches = [];

        for (const faq of faqsWithEmbeddings) {
            try {
                const faqEmbedding = typeof faq.embedding === 'string' 
                    ? JSON.parse(faq.embedding) 
                    : faq.embedding;
                
                const similarity = cosineSimilarity(questionEmbedding, faqEmbedding);
                
                if (similarity > 0.2) {
                    matches.push({
                        ...faq,
                        similarity_score: similarity
                    });
                }
            } catch (embeddingError) {
                console.error(`Error processing embedding for FAQ ${faq.id}:`, embeddingError.message);
            }
        }

        const sortedMatches = matches
            .sort((a, b) => b.similarity_score - a.similarity_score)
            .slice(0, limit);

        return sortedMatches;

    } catch (error) {
        console.error('Error in findSimilarFAQs:', error.message);
        return await findSimilarFAQsKeyword(question, limit);
    }
}

// Fallback keyword matching function
async function findSimilarFAQsKeyword(question, limit = 5) {
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
        console.error('Error in findSimilarFAQsKeyword:', error);
        return [];
    }
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
    if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
        console.error('Invalid vectors for similarity calculation');
        return 0;
    }
    
    if (vecA.length !== vecB.length) {
        console.error(`Vector dimension mismatch: ${vecA.length} vs ${vecB.length}`);
        return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) {
        console.error('Zero norm vector detected');
        return 0;
    }
    
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return Math.max(0, Math.min(1, similarity));
}

function personalizeAnswer(answer, userMetadata) {
    if (userMetadata.preferences?.detail_level === 'brief') return answer;
    if (userMetadata.preferences?.detail_level === 'detailed') return answer;
    return answer;
}

export default { assembleContext, generateContextualAnswer, calculateConfidence, findSimilarFAQs, personalizeAnswer };
