const { addToBlockchain, verifyOnBlockchain, computeHash } = require("../blockchain");

exports.add = async (req, res) => {
  try {
    const result = await addToBlockchain(req.body);
    res.json({ success: true, message: "OK", ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

exports.verify = async (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) {
      return res.status(400).json({ success: false, message: "Hash required", data: null });
    }
    const result = await verifyOnBlockchain(hash);
    res.json({ success: true, message: "OK", ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

exports.hash = async (req, res) => {
  try {
    const hash = computeHash(req.body);
    res.json({ success: true, message: "OK", hash });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
