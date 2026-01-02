// backend/src/middleware/roles.js

// imports
import jwt from "jsonwebtoken";

// auth middleware
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // no authorization header or doesn't start with Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    // extract token
    const token = authHeader.split(" ")[1];

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    // otherwise, proceed
    next();
  } 
  // error handling
  catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default auth;