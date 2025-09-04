// middleware/auth.js
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  let token = req.headers.token;
  const auth = req.headers.authorization;
  if (!token && auth?.startsWith("Bearer ")) {
    token = auth.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success:false, message: "Not Authorized! Login Again" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");

    const token_decode = jwt.verify(token, secret);
    if (!req.body) req.body = {};
    req.body.userId = token_decode.id;
    req.body.isAdmin = token_decode.role === "admin";
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ success:false, message: "Invalid token" });
  }
};

// Middleware to verify admin role
const verifyAdmin = async (req, res, next) => {
  if (!req.body.isAdmin) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

export { authMiddleware as default, verifyAdmin };
