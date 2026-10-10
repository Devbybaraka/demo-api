const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authorization = req.get('Authorization') || '';
  const match = authorization.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({ message: 'A bearer token is required' });
  }

  try {
    const decoded = jwt.verify(match[1], process.env.JWT_SECRET);
    if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded.sub;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    next(error);
  }
};
