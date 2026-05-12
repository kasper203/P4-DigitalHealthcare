const express = require('express');
const db = require('../db'); // mysql pool
const router = express.Router();
const { encryptField, decryptField } = require("../encryptionHelper");

router.get('/user/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  const sql = `
  SELECT id, user_id, journal_input, date, author
  FROM Journal
  WHERE user_id = ?
  ORDER BY date DESC
`;

const [rows] = await db.execute(sql, [userId]);

const decryptedRows = rows.map((row) => ({
  ...row,
  journal_input: decryptField(row.journal_input),
  author: decryptField(row.author),
}));

res.json(decryptedRows);
});

router.post('/', async (req, res) => {
  const userId = Number(req.body.user_id);
  const journalInput = String(req.body.journal_input || '').trim();
  const author = String(req.body.author || '').trim();

  if (!userId) {
    return res.status(400).json({ error: 'Invalid user_id' });
  }

  if (!journalInput) {
    return res.status(400).json({ error: 'journal_input is required' });
  }

  if (!author) {
    return res.status(400).json({ error: 'author is required' });
  }

  const encryptedJournalInput = encryptField(journalInput);
  const encryptedAuthor = encryptField(author);

  const sql = `
    INSERT INTO Journal (user_id, journal_input, date, author)
    VALUES (?, ?, CURDATE(), ?)
  `;


  
  try {
      const [result] = await db.execute(sql, [
      userId,
      encryptedJournalInput,
      encryptedAuthor
    ]);

    res.status(201).json({
      id: result.insertId,
      user_id: userId,
      journal_input: journalInput,
      author
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

module.exports = router;