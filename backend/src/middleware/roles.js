// backend/src/middleware/auth.js

// role-based access control middleware
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {

    // no user info or role in request
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // if user's role is not in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions",
      });
    }

    // otherwise, proceed
    next();
  };
};

export default requireRole;