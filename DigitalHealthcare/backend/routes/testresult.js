const express = require('express');
const db = require('../db'); // mysql pool
const router = express.Router();
const { encryptField, decryptField } = require('../encryptionHelper');
const { authenticateToken, canAccessUserRecord } = require('../middleware/jwtAuth');

router.use(authenticateToken);

router.get('/user/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  if (!canAccessUserRecord(req, userId)) {
    return res.status(403).json({ error: 'You do not have access to this patient.' });
  }

  const sql = ` 
    SELECT id, user_id, test_result, date, test_type, author
    FROM TestInfo
    WHERE user_id = ?
    ORDER BY date DESC
  `;

  try {
    const [rows] = await db.execute(sql, [userId]); // parameterized

    const decryptedRows = rows.map((row) => ({
      ...row,
      test_result: decryptField(row.test_result),
      test_type: decryptField(row.test_type),
      author: decryptField(row.author),
    }));

    res.json(decryptedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

router.post('/', async (req, res) => {
  if (String(req.auth?.role || '').toLowerCase() !== 'doctor') {
    return res.status(403).json({ error: 'Only doctors can create test results.' });
  }

  const userId = Number(req.body.user_id);
  const testResult = String(req.body.test_result || '').trim();
  const testType = String(req.body.test_type || '').trim();
  // Author is taken from the authenticated JWT to prevent spoofing
  const authorFromToken = String(req.auth?.username || req.auth?.userId || '').trim();

  if (!userId) {
    return res.status(400).json({ error: 'Invalid user_id' });
  }

  if (!testResult) {
    return res.status(400).json({ error: 'test_result is required' });
  }

  if (!testType) {
    return res.status(400).json({ error: 'test_type is required' });
  }

  if (!authorFromToken) {
    return res.status(400).json({ error: 'Author not available from token' });
  }

  const encryptedTestResult = encryptField(testResult);
  const encryptedTestType = encryptField(testType);
  const encryptedAuthor = encryptField(authorFromToken);

  const sql = `
    INSERT INTO TestInfo (user_id, test_result, date, test_type, author)
    VALUES (?, ?, CURDATE(), ?, ?)
  `;

  try {
    const [result] = await db.execute(sql, [
      userId,
      encryptedTestResult,
      encryptedTestType,
      encryptedAuthor,
    ]);

    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      test_result: testResult,
      test_type: testType,
      author: authorFromToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create test result' });
  }
});

module.exports = router;