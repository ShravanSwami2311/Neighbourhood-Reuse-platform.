const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const requests = require("../controllers/requests.controller");

router.use(auth);
router.post("/", requests.createRequest);
router.get("/sent", requests.getSentRequests);
router.get("/received", requests.getReceivedRequests);
router.patch("/:id/status", requests.updateRequestStatus);
router.patch("/:id/cancel", requests.cancelRequest);

module.exports = router;
