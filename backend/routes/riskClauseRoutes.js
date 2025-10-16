// routes/riskRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { riskAnalysisHandler } = require("../controllers/riskController");

router.post("/analyze-risk", upload.single("document"), riskAnalysisHandler);

module.exports = router;
