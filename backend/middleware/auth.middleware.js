const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ message: "Your session is invalid or expired. Please log in again." });
  }
}

module.exports = authenticateToken;
