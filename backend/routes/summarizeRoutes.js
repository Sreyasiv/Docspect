const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { summarizeDocumentHandler } = require("../controllers/summarizeController");

router.post("/summarize", upload.single("document"), summarizeDocumentHandler);

module.exports = router;
