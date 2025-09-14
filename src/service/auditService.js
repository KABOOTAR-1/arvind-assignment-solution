import pool from '../config/database.js';

async function logContextAssembly(queryId, auditData) {
  try {
    const { contextSources, matchingAlgorithm, assemblyDetails, performanceMetrics } = auditData;

    const query = `
      INSERT INTO audit_logs (
        query_id,
        context_sources,
        matching_algorithm,
        context_assembly_details,
        performance_metrics
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      queryId,
      JSON.stringify(contextSources || {}),
      matchingAlgorithm || 'semantic_similarity',
      JSON.stringify(assemblyDetails || {}),
      JSON.stringify(performanceMetrics || {}),
    ]);

    return result.rows[0];
  } catch (error) {
    return null;
  }
}

async function getAuditLogs(filters = {}) {
  let query = `
    SELECT al.*, q.question, q.answer
    FROM audit_logs al
    LEFT JOIN queries q ON al.query_id = q.id
  `;

  const params = [];
  const conditions = [];

  if (filters.queryId) {
    conditions.push(`al.query_id = $${params.length + 1}`);
    params.push(filters.queryId);
  }

  if (filters.from) {
    conditions.push(`al.created_at >= $${params.length + 1}`);
    params.push(filters.from);
  }

  if (filters.to) {
    conditions.push(`al.created_at <= $${params.length + 1}`);
    params.push(filters.to);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY al.created_at DESC';

  if (filters.limit) {
    query += ` LIMIT $${params.length + 1}`;
    params.push(filters.limit);
  }

  const result = await pool.query(query, params);
  return result.rows;
}

export default {
  logContextAssembly,
  getAuditLogs,
};
