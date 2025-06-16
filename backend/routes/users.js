const express = require('express');
const router = express.Router();

// Example users route
router.get('/', (req, res) => {
  res.json({ message: 'Users route working' });
});

module.exports = router;
