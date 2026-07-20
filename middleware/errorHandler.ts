const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);
  
  if (err.name === 'SqliteError') {
    // Prevent leaking SQL syntax
    return res.status(500).json({ error: 'A database error occurred' });
  }
  
  res.status(500).json({ error: err.message || 'Internal Server Error' });
};

module.exports = errorHandler;
