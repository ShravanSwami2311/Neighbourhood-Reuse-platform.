const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const items = require("../controllers/items.controller");

router.get("/", items.getItems);
router.get("/mine", auth, items.getMyItems);
router.get("/:id", items.getItemById);
router.post("/", auth, items.createItem);
router.delete("/:id", auth, items.deleteItem);
router.patch("/:id/donated", auth, items.markDonated);

module.exports = router;
