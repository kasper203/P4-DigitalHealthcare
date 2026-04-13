const express = require('express');
const db = require('../db'); // mysql pool
const router = express.Router();

router.get('/user/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  const sql = ` 
    SELECT id, user_id, test_result, date, test_type, author
    FROM testinfo
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

router.post('/', async (req, res) => {
  const userId = Number(req.body.user_id);
  const testResult = String(req.body.test_result || '').trim();
  const testType = String(req.body.test_type || '').trim();
  const author = String(req.body.author || '').trim();

  if (!userId) {
    return res.status(400).json({ error: 'Invalid user_id' });
  }

  if (!testResult) {
    return res.status(400).json({ error: 'test_result is required' });
  }

  if (!testType) {
    return res.status(400).json({ error: 'test_type is required' });
  }

  if (!author) {
    return res.status(400).json({ error: 'author is required' });
  }

  const sql = `
    INSERT INTO TestInfo (user_id, test_result, date, test_type, author)
    VALUES (?, ?, CURDATE(), ?, ?)
  `;

  try {
    const [result] = await db.execute(sql, [userId, testResult, testType, author]);

    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      test_result: testResult,
      test_type: testType,
      author,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create test result' });
  }
});

module.exports = router;