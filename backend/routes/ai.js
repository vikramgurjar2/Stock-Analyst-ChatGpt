const express = require('express');
const router = express.Router();

// Example AI route
router.get('/', (req, res) => {
  res.json({ message: 'AI route working' });
});

module.exports = router;
