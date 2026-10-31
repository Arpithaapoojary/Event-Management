// Middleware to restrict administrative access with 401 (Unauthorized) and 403 (Forbidden) handling
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

  // 1. Missing authentication credentials -> 401 Unauthorized (redirect to login)
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No administrative session token provided. Please log in.',
    });
  }

  // 2. Token provided but does not match expected admin credentials -> 403 Forbidden (403 page)
  if (token !== expectedKey) {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: Administrative privileges required. You do not have permission to access this resource.',
    });
  }

  next();
};

module.exports = adminAuth;

