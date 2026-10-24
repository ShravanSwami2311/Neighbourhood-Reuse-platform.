const pool = require("../config/db");

async function createRequest(req, res, next) {
  try {
    const { item_id, message = "" } = req.body;
    if (!Number.isInteger(Number(item_id)) || Number(item_id) < 1) {
      return res.status(400).json({ message: "A valid item_id is required." });
    }
    const [items] = await pool.execute("SELECT id, user_id, status FROM items WHERE id = ?", [item_id]);
    if (!items.length) return res.status(404).json({ message: "Item not found." });
    const item = items[0];
    if (item.user_id === req.user.id) return res.status(400).json({ message: "You cannot request your own item." });
    if (item.status !== "available") return res.status(409).json({ message: "This item is not available." });

    const [result] = await pool.execute(
      "INSERT INTO requests (item_id, requester_id, message) VALUES (?, ?, ?)",
      [item_id, req.user.id, String(message).slice(0, 500) || null]
    );
    res.status(201).json({ message: "Request sent to the donor.", requestId: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "You have already requested this item." });
    next(err);
  }
}

async function getSentRequests(req, res, next) {
  try {
    const [requests] = await pool.execute(
      `SELECT r.*, i.title, i.image_url, i.location, u.name AS donor_name
       FROM requests r JOIN items i ON i.id = r.item_id
       JOIN users u ON u.id = i.user_id
       WHERE r.requester_id = ? ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ requests });
  } catch (err) { next(err); }
}

async function getReceivedRequests(req, res, next) {
  try {
    const [requests] = await pool.execute(
      `SELECT r.*, i.title, i.status AS item_status, u.name AS requester_name, u.email AS requester_email
       FROM requests r JOIN items i ON i.id = r.item_id
       JOIN users u ON u.id = r.requester_id
       WHERE i.user_id = ? ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json({ requests });
  } catch (err) { next(err); }
}

async function updateRequestStatus(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be accepted or rejected." });
    }
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      `SELECT r.id, r.item_id, r.status, i.user_id, i.status AS item_status
       FROM requests r JOIN items i ON i.id = r.item_id
       WHERE r.id = ? FOR UPDATE`,
      [req.params.id]
    );
    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Request not found." });
    }
    const request = rows[0];
    if (request.user_id !== req.user.id) {
      await connection.rollback();
      return res.status(403).json({ message: "Only the donor can update this request." });
    }
    if (request.status !== "pending") {
      await connection.rollback();
      return res.status(409).json({ message: "This request has already been processed." });
    }
    if (status === "accepted") {
      const [updated] = await connection.execute(
        "UPDATE items SET status = 'reserved' WHERE id = ? AND status = 'available'",
        [request.item_id]
      );
      if (!updated.affectedRows) {
        await connection.rollback();
        return res.status(409).json({ message: "This item is no longer available." });
      }
      await connection.execute(
        "UPDATE requests SET status = 'rejected' WHERE item_id = ? AND id <> ? AND status = 'pending'",
        [request.item_id, request.id]
      );
    }
    await connection.execute("UPDATE requests SET status = ? WHERE id = ?", [status, request.id]);
    await connection.commit();
    res.json({ message: `Request ${status}.`, status });
  } catch (err) {
    try { await connection.rollback(); } catch {}
    next(err);
  } finally { connection.release(); }
}

async function cancelRequest(req, res, next) {
  try {
    const [result] = await pool.execute(
      "UPDATE requests SET status = 'cancelled' WHERE id = ? AND requester_id = ? AND status = 'pending'",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Pending request not found or not yours." });
    res.json({ message: "Request cancelled." });
  } catch (err) { next(err); }
}

module.exports = { createRequest, getSentRequests, getReceivedRequests, updateRequestStatus, cancelRequest };
