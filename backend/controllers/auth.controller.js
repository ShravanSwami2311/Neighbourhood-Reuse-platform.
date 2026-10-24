const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

async function register(req, res, next) {
  try {
    const { name, email, password, phone, area } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (String(name).trim().length > 100 || String(password).length < 8) {
      return res.status(400).json({ message: "Name must be at most 100 characters and password at least 8 characters." });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const [found] = await pool.execute("SELECT id FROM users WHERE email = ?", [cleanEmail]);
    if (found.length) return res.status(409).json({ message: "An account with this email already exists." });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, phone, area) VALUES (?, ?, ?, ?, ?)",
      [String(name).trim(), cleanEmail, hash, phone || null, area || null]
    );
    const user = { id: result.insertId, name: String(name).trim(), email: cleanEmail };
    res.status(201).json({ message: "Account created successfully.", user, token: makeToken(user) });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Email already registered." });
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const [rows] = await pool.execute(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [String(email).trim().toLowerCase()]
    );
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const user = { id: rows[0].id, name: rows[0].name, email: rows[0].email };
    res.json({ message: "Login successful.", user, token: makeToken(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
