import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_STD_TTL) || 3600,
  checkperiod: parseInt(process.env.CACHE_CHECK_PERIOD) || 600
});
const MAX_QUERIES_PER_USER = parseInt(process.env.CACHE_MAX_QUERIES_PER_USER) || 100;

function getCacheKey(userId, type) {
    return `${type}:${userId}`;
}

function cacheUserQuery(userId, queryData) {
    const key = getCacheKey(userId, 'queries');
    let queries = cache.get(key) || [];
    queries.unshift({ ...queryData, timestamp: new Date().toISOString() });
    if (queries.length > MAX_QUERIES_PER_USER) queries = queries.slice(0, MAX_QUERIES_PER_USER);
    cache.set(key, queries);
}

function getRecentQueries(userId, limit = 10) {
    const key = getCacheKey(userId, 'queries');
    const queries = cache.get(key) || [];
    return queries.slice(0, limit);
}

function cacheUserSession(userId, sessionData) {
    const key = getCacheKey(userId, 'session');
    cache.set(key, sessionData);
}

function getUserSession(userId) {
    const key = getCacheKey(userId, 'session');
    return cache.get(key);
}

function invalidateUserCache(userId) {
    cache.del([getCacheKey(userId, 'queries'), getCacheKey(userId, 'session')]);
}

function getCacheStats() {
    return { keys: cache.keys().length, stats: cache.getStats() };
}

export default {
    cacheUserQuery,
    getRecentQueries,
    cacheUserSession,
    getUserSession,
    invalidateUserCache,
    getCacheStats
};
