const express = require('express');
const db = require('../db'); // mysql pool
const router = express.Router();

router.get('/user/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  const sql = `
    SELECT id, user_id, journal_input, date, author
    FROM journal
    WHERE user_id = ?
    ORDER BY date DESC
  `;

  try {
    const [rows] = await db.execute(sql, [userId]);  // parameterized
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;