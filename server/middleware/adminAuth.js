// Middleware to restrict administrative access
const adminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_KEY || 'admin2026';

  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (adminKey) {
    token = adminKey;
  }

  if (!token || token !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Valid administrative credentials or passcode required.',
    });
  }

  next();
};

module.exports = adminAuth;
