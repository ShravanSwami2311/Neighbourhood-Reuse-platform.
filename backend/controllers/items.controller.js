const pool = require("../config/db");

const categories = ["Clothing", "Books", "Electronics", "Furniture", "Household", "Toys", "Other"];
const conditions = ["New", "Like New", "Good", "Fair"];

async function getItems(req, res, next) {
  try {
    const { search = "", category = "", location = "" } = req.query;
    let sql = `SELECT i.id, i.user_id, i.title, i.description, i.category,
      i.item_condition, i.image_url, i.location, i.status, i.created_at,
      u.name AS donor_name
      FROM items i JOIN users u ON u.id = i.user_id
      WHERE i.status = 'available'`;
    const params = [];
    if (search.trim()) {
      sql += " AND (i.title LIKE ? OR i.description LIKE ?)";
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }
    if (category) { sql += " AND i.category = ?"; params.push(category); }
    if (location.trim()) { sql += " AND i.location LIKE ?"; params.push(`%${location.trim()}%`); }
    sql += " ORDER BY i.created_at DESC";
    const [items] = await pool.execute(sql, params);
    res.json({ items });
  } catch (err) { next(err); }
}

async function getItemById(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT i.*, u.name AS donor_name FROM items i
       JOIN users u ON u.id = i.user_id WHERE i.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Item not found." });
    res.json({ item: rows[0] });
  } catch (err) { next(err); }
}

async function createItem(req, res, next) {
  try {
    const { title, description, category, item_condition = "Good", image_url, location } = req.body;
    if (!title || !description || !category || !location) {
      return res.status(400).json({ message: "Title, description, category and location are required." });
    }
    if (!categories.includes(category)) return res.status(400).json({ message: "Choose a valid category." });
    if (!conditions.includes(item_condition)) return res.status(400).json({ message: "Choose a valid condition." });
    const [result] = await pool.execute(
      `INSERT INTO items (user_id, title, description, category, item_condition, image_url, location)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, String(title).trim(), String(description).trim(), category, item_condition, image_url || null, String(location).trim()]
    );
    res.status(201).json({ message: "Donation posted successfully.", itemId: result.insertId });
  } catch (err) { next(err); }
}

async function deleteItem(req, res, next) {
  try {
    const [result] = await pool.execute("DELETE FROM items WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Item not found or you are not the donor." });
    res.json({ message: "Donation post deleted." });
  } catch (err) { next(err); }
}

async function getMyItems(req, res, next) {
  try {
    const [items] = await pool.execute(
      "SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json({ items });
  } catch (err) { next(err); }
}

async function markDonated(req, res, next) {
  try {
    const [result] = await pool.execute(
      "UPDATE items SET status = 'donated' WHERE id = ? AND user_id = ? AND status = 'reserved'",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(409).json({ message: "Only your reserved items can be marked donated." });
    res.json({ message: "Item marked as donated." });
  } catch (err) { next(err); }
}

module.exports = { getItems, getItemById, createItem, deleteItem, getMyItems, markDonated };
