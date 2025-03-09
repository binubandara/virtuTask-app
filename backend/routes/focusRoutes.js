const express = require("express");
const { logFocusSession, getFocusSessions } = require("../controllers/focusController");

const router = express.Router();

router.post("/", logFocusSession);
router.get("/", getFocusSessions);

module.exports = router;
