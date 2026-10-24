const pool = require("../config/db");

async function getMyProfile(req, res, next) {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, phone, area, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Profile not found." });
    res.json({ user: rows[0] });
  } catch (err) { next(err); }
}

async function updateMyProfile(req, res, next) {
  try {
    const { name, phone, area } = req.body;
    if (!name || String(name).trim().length > 100) {
      return res.status(400).json({ message: "A name of up to 100 characters is required." });
    }
    await pool.execute(
      "UPDATE users SET name = ?, phone = ?, area = ? WHERE id = ?",
      [String(name).trim(), phone || null, area || null, req.user.id]
    );
    res.json({ message: "Profile updated." });
  } catch (err) { next(err); }
}

async function getPublicProfile(req, res, next) {
  try {
    const [users] = await pool.execute(
      "SELECT id, name, area, created_at FROM users WHERE id = ?",
      [req.params.id]
    );
    if (!users.length) return res.status(404).json({ message: "User not found." });
    const [items] = await pool.execute(
      `SELECT id, title, category, item_condition, image_url, location, status, created_at
       FROM items WHERE user_id = ? AND status <> 'donated' ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json({ user: users[0], items });
  } catch (err) { next(err); }
}

module.exports = { getMyProfile, updateMyProfile, getPublicProfile };
