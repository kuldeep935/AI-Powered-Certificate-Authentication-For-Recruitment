const express = require("express");
const router = express.Router();
const bc = require("../blockchain");

// ➕ Add Certificate
router.post("/add", async (req, res) => {
  const { name, certId } = req.body;
  const hash = await bc.addCertificate(name, certId);
  res.json({ hash });
});

// ✔ Verify Certificate
router.post("/verify", async (req, res) => {
  const { name, certId } = req.body;
  const valid = await bc.verifyCertificate(name, certId);
  res.json({ valid });
});

module.exports = router;