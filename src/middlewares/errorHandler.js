const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: 'Database connection failed'
    });
  }
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry'
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'Foreign key constraint violation'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};

export default { errorHandler };