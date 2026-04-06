// usage: authorize('admin', 'analyst')
const authorize = (...roles) => {
  return (req, res, next) => {
    // safety check: ensure req.user exists (protect middleware must run first)
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    next();
  };
};

module.exports = { authorize };
