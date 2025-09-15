import pool from '../config/database.js';

const createQuery = async (data) => {
    const {
        user_id,
        session_id,
        question,
        answer,
        context_used,
        similarity_score,
        response_time_ms
    } = data;

    const query = `
      INSERT INTO queries 
      (user_id, session_id, question, answer, context_used, similarity_score, response_time_ms)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`;
    const result = await pool.query(query, [
        user_id,
        session_id,
        question,
        answer,
        context_used,
        similarity_score,
        response_time_ms
    ]);
    return result.rows[0];
}

const getQueriesByUserId = async (user_id, limit = 50) => {
    const query = `
      SELECT * FROM queries 
      WHERE user_id = $1
      ORDER BY created_at DESC    
      LIMIT $2
    `;
    const result = await pool.query(query, [user_id, limit]);
    return result.rows;
}

const getQueryById = async (id) => {
    const query = 'SELECT * FROM queries WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

const getRecentQueries = async (user_id, limit = 10) => {
    const query = `
      SELECT question, answer, created_at, similarity_score
      FROM queries
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [user_id, limit]);
    return result.rows;
}

const getAllQueries = async (filters = {}) => {
    const { limit = 50, offset = 0, userId } = filters;
    let query = 'SELECT * FROM queries';
    const params = [];
    const conditions = [];

    if (userId) {
        params.push(userId);
        conditions.push(`user_id = $${params.length}`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
        params.push(parseInt(limit));
        query += ` LIMIT $${params.length}`;
    }

    if (offset) {
        params.push(parseInt(offset));
        query += ` OFFSET $${params.length}`;
    }

    const result = await pool.query(query, params);
    return result.rows;
}

const deleteQuery = async (id) => {
    const query = 'DELETE FROM queries WHERE id = $1';
    await pool.query(query, [id]);
    return true;
}

const Query = {
    createQuery,
    getQueriesByUserId,
    getQueryById,
    getRecentQueries,
    getAllQueries,
    deleteQuery
};

export default Query;