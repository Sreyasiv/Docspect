// routes/analyzeRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { analyzeDocumentHandler } = require("../controllers/analyzeController");

router.post("/analyze", upload.single("document"), analyzeDocumentHandler);

module.exports = router;
