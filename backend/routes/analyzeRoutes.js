// routes/analyzeRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { analyzeDocumentHandler } = require("../controllers/analyzeController");
const { caseStudyHandler } = require("../controllers/caseStudyController");

router.post("/analyze", upload.single("document"), analyzeDocumentHandler);
router.post("/case-studies", caseStudyHandler);

module.exports = router;
