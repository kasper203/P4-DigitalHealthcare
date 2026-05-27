const express = require('express');
const db = require('../db');
const router = express.Router();
const { encryptField, decryptField } = require("../encryptionHelper");
const { authenticateToken, canAccessUserRecord } = require("../middleware/jwtAuth");

router.use(authenticateToken);

router.get('/user/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  if (!canAccessUserRecord(req, userId)) {
    return res.status(403).json({ error: 'You do not have access to this patient.' });
  }

  try {
    const [patientRows] = await db.execute('SELECT doctor_id FROM PatientInfo WHERE user_id = ? LIMIT 1', [userId]);
    if (!patientRows.length) return res.status(404).json({ error: 'Patient not found' });
    const patient = patientRows[0];
    const authRole = String(req.auth?.role || '').toLowerCase();
    if (authRole === 'doctor' && Number(req.auth.userId) !== Number(patient.doctor_id)) {
      return res.status(403).json({ error: 'You do not have access to this patient.' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database query failed' });
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
  if (String(req.auth?.role || '').toLowerCase() !== 'doctor') {
    return res.status(403).json({ error: 'Only doctors can create journal entries.' });
  }

  const userId = Number(req.body.user_id);
  const journalInput = String(req.body.journal_input || '').trim();
  const authorFromToken = String(req.auth?.username || req.auth?.userId || '').trim();

  const MAX_JOURNAL_LENGTH = 2000;

  if (!userId) {
    return res.status(400).json({ error: 'Invalid user_id' });
  }

  try {
    const [patientRows] = await db.execute('SELECT doctor_id FROM PatientInfo WHERE user_id = ? LIMIT 1', [userId]);
    if (!patientRows.length) return res.status(404).json({ error: 'Patient not found' });
    const patient = patientRows[0];
    const authRole = String(req.auth?.role || '').toLowerCase();
    if (authRole === 'doctor' && Number(req.auth.userId) !== Number(patient.doctor_id)) {
      return res.status(403).json({ error: 'You do not have access to create entries for this patient.' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database query failed' });
  }

  if (!journalInput) {
    return res.status(400).json({ error: 'journal_input is required' });
  }

  if (journalInput.length > MAX_JOURNAL_LENGTH) {
    return res.status(400).json({ error: `journal_input must be at most ${MAX_JOURNAL_LENGTH} characters` });
  }

  if (!authorFromToken) {
    return res.status(400).json({ error: 'Author not available from token' });
  }

  const encryptedJournalInput = encryptField(journalInput);
  const encryptedAuthor = encryptField(authorFromToken);

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
      author: authorFromToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

module.exports = router;