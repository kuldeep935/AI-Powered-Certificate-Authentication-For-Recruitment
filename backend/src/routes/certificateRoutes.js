const express = require('express');
const router = express.Router();
const { validateAllCertificates } = require('../controllers/certificateController');

// POST route to trigger the bulk sweep
router.post('/admin/certificates/validate-all', async (req, res) => {
    try {
        validateAllCertificates()
            .then(stats => console.log("Background validation finished with stats:", stats))
            .catch(err => console.error("Background validation crashed:", err));

        res.status(200).json({ 
            success: true, 
            message: "Bulk validation started in the background. Check server logs for progress." 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to start validation process." });
    }
});

module.exports = router;