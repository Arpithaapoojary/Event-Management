const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err.message || err);

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A record with these unique details already exists.',
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
    });
  }

  // Mongoose bad ObjectId format (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Resource not found: Invalid ID format.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
