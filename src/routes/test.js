const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/public', (req, res) => {
  res.json({
    success: true,
    message: 'Public test endpoint working',
    timestamp: new Date().toISOString()
  });
});

router.get('/private', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Private endpoint',
    user: req.user
  });
});

module.exports = router;