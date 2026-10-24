const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const users = require("../controllers/users.controller");

router.get("/me", auth, users.getMyProfile);
router.patch("/me", auth, users.updateMyProfile);
router.get("/:id", users.getPublicProfile);

module.exports = router;
