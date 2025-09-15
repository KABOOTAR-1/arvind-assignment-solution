import pool from '../config/database.js';
import huggingfaceService from '../service/huggingfaceService.js';

const createFAQ = async (data) => {
const {question, answer, category} = data;

// Generate embedding for the FAQ content
const faqText = `${question} ${answer}`;
const embedding = await huggingfaceService.requestEmbedding(faqText);

const query = `
      INSERT INTO faqs (question, answer, category, embedding)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [question, answer, category, embedding ? JSON.stringify(embedding) : null]);
    return result.rows[0];
}

const getAllFAQs = async (filters={}) => {
    let query='SELECT * FROM faqs';
    const params = [];
    const conditions = [];
    let paramIndex = 1;


    if (filters.category) {
        params.push(filters.category);
        conditions.push(`category = $${paramIndex++}`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }


    const result = await pool.query(query, params);
    return result.rows;
}

const getFAQById = async (id) => {
    const query = 'SELECT * FROM faqs WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];

}

const updateFAQ = async (id, data) => {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    // Check if question or answer is being updated
    const needsEmbeddingUpdate = data.question !== undefined || data.answer !== undefined;

    for (const key in data) {
        fields.push(`${key} = $${paramIndex++}`);
        params.push(data[key]);
    }

    // If content changed, regenerate embedding
    if (needsEmbeddingUpdate) {
        const existingFAQ = await getFAQById(id);
        if (existingFAQ) {
            const updatedQuestion = data.question !== undefined ? data.question : existingFAQ.question;
            const updatedAnswer = data.answer !== undefined ? data.answer : existingFAQ.answer;
            const faqText = `${updatedQuestion} ${updatedAnswer}`;
            const embedding = await huggingfaceService.requestEmbedding(faqText);

            fields.push(`embedding = $${paramIndex++}`);
            params.push(embedding ? JSON.stringify(embedding) : null);
        }
    }

    params.push(id);

    const query = `
      UPDATE faqs
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    const result = await pool.query(query, params);
    return result.rows[0];
}

const deleteFAQ = async (id) => {
    const query = 'DELETE FROM faqs WHERE id = $1';
    await pool.query(query, [id]);
    return true;
}

const searchFAQs = async (embedding, limit=5) => {
    const query = `
      SELECT *, (embedding <=> $1) AS distance
      FROM faqs
      ORDER BY distance
      LIMIT $2
    `;
    const result = await pool.query(query, [embedding, limit]);
    return result.rows;
}

const FAQ = {
    createFAQ,
    getAllFAQs,
    getFAQById,
    updateFAQ,
    deleteFAQ,
    searchFAQs
};

export default FAQ;