const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/user/:userId', async (req, res) => {
  const userId = Number(req.params.userId);

  if (!userId) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  const sql = `
    SELECT
      p.cpr,
      p.date_of_birth,
      p.address,
      p.gender,
      p.blood_type,
      p.name,
      d.name AS doctor_name
    FROM PatientInfo p
    LEFT JOIN DoctorInfo d ON d.doctor_id = p.doctor_id
    WHERE p.user_id = ?
    LIMIT 1
  `;

  try {
    const [rows] = await db.execute(sql, [userId]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database query failed' });
  }
});

// Get all patients for a specific doctor
router.get('/doctor/:doctorId', async (req, res) => {
  const doctorId = Number(req.params.doctorId);

  if (!doctorId) {
    return res.status(400).json({ error: 'Invalid doctorId' });
  }

  const sql = `
    SELECT user_id, name, cpr, date_of_birth, address, gender, blood_type, doctor_id
    FROM PatientInfo
    WHERE doctor_id = ?
    ORDER BY name ASC
  `;

  try {
    const [rows] = await db.execute(sql, [doctorId]);
    return res.json(rows || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database query failed' });
  }
});

// Assign a patient to a doctor
router.post('/assign', async (req, res) => {
  const { patientCpr, doctorId } = req.body;

  if (!patientCpr || !doctorId) {
    return res.status(400).json({ error: 'patientCpr and doctorId are required' });
  }

  const normalizedCpr = String(patientCpr).trim();

  if (!normalizedCpr) {
    return res.status(400).json({ error: 'patientCpr is required' });
  }

  const sql = `
    UPDATE PatientInfo
    SET doctor_id = ?
    WHERE cpr = ?
  `;

  try {
    const [result] = await db.execute(sql, [doctorId, normalizedCpr]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    return res.json({ message: 'Patient assigned to doctor successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database query failed' });
  }
});

// Remove a patient from a doctor
router.post('/unassign', async (req, res) => {
  const { patientUserId, doctorId } = req.body;

  if (!patientUserId || !doctorId) {
    return res.status(400).json({ error: 'patientUserId and doctorId are required' });
  }

  const sql = `
    UPDATE PatientInfo
    SET doctor_id = NULL
    WHERE user_id = ? AND doctor_id = ?
  `;

  try {
    const [result] = await db.execute(sql, [patientUserId, doctorId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Patient not found for this doctor' });
    }

    return res.json({ message: 'Patient removed from doctor successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database query failed' });
  }
});

module.exports = router;
