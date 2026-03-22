const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

router.get('/health', (req, res) => {
    res.json({ status: 'ok', dbConnected: !!supabase });
});

module.exports = router;
