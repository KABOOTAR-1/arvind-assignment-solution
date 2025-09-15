import pool from "../config/database.js";

const createUser = async (data) => {
  const { name, email, metadata } = data;
    const query = `
      INSERT INTO users (name, email, metadata)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [name, email, metadata]);
    return result.rows[0];
}

const getUserById = async (id) => {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
}

const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
}

const getAllUsers = async (filters = {}) => {
    const { limit = 50, offset = 0 } = filters;
    let query = 'SELECT * FROM users';
    const params = [];

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

const updateUser = async (id, data) => {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    for (const key in data) {
        let value = data[key];

        if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
        }

        fields.push(`${key} = $${paramIndex++}`);
        params.push(value);
    }

    params.push(id);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
};

const deleteUser = async (id) => {
    const query = 'DELETE FROM users WHERE id = $1';
    await pool.query(query, [id]);
    return true;
}   

const User={
    createUser,
    getUserById,
    getUserByEmail,
    getAllUsers,
    updateUser,
    deleteUser
}

export default User;


