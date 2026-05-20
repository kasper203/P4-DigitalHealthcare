const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid authorization token." });
  }

  try {
    req.auth = jwt.verify(token, getJwtSecret());
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

const canAccessUserRecord = (req, targetUserId) => {
  const authRole = String(req.auth?.role || "").toLowerCase();
  if (authRole === "doctor") return true;
  return Number(req.auth?.userId) === Number(targetUserId);
};

module.exports = {
  authenticateToken,
  canAccessUserRecord,
  getJwtSecret,
};