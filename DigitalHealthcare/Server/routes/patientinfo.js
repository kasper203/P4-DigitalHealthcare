const express = require('express');
const db = require('../db');
const router = express.Router();
const { decryptField } = require('../encryptionHelper');
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
    SELECT p.user_id, p.cpr, p.date_of_birth, p.address, p.gender, p.blood_type, p.name, p.doctor_id, d.name AS doctor_name
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

    const patient = rows[0];

    // If the requester is a doctor, only allow access to patients assigned to that doctor
    const authRole = String(req.auth?.role || '').toLowerCase();
    if (authRole === 'doctor' && Number(req.auth.userId) !== Number(patient.doctor_id)) {
      return res.status(403).json({ error: 'You do not have access to this patient.' });
    }

    const safePatient = {
      ...patient,
      user_id: patient.user_id,
      cpr: decryptField(patient.cpr),
      address: decryptField(patient.address),
      gender: decryptField(patient.gender),
      blood_type: decryptField(patient.blood_type),
      name: decryptField(patient.name),
    };

    return res.json(safePatient);
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

  if (String(req.auth?.role || '').toLowerCase() !== 'doctor' || Number(req.auth.userId) !== doctorId) {
    return res.status(403).json({ error: 'You do not have access to this doctor list.' });
  }

  const sql = `
    SELECT user_id, name, cpr, date_of_birth, address, gender, blood_type, doctor_id
    FROM PatientInfo
    WHERE doctor_id = ?
  `;

  try {
    const [rows] = await db.execute(sql, [doctorId]);

    const decryptedRows = rows.map((row) => ({
      ...row,
      name: decryptField(row.name),
      cpr: decryptField(row.cpr),
      address: decryptField(row.address),
      gender: decryptField(row.gender),
      blood_type: decryptField(row.blood_type),
    }));

    decryptedRows.sort((a, b) => a.name.localeCompare(b.name));

    return res.json(decryptedRows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database query failed' });
  }
});

router.get('/doctors', async (req, res) => {
  try {
    const sql = `
      SELECT doctor_id, name
      FROM DoctorInfo
      ORDER BY name ASC
    `;

    const [rows] = await db.execute(sql);

    const doctors = rows.map((row) => ({
      ...row,
      name: decryptField(row.name),
    }));

    return res.json(doctors);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database query failed' });
  }
});

// Assign a patient to a doctor by user_id
router.post('/assign', async (req, res) => {
  const { patientUserId, doctorId } = req.body;

  if (!patientUserId || !doctorId) {
    return res.status(400).json({ error: 'patientUserId and doctorId are required' });
  }

  const userId = Number(patientUserId);
  if (!userId) {
    return res.status(400).json({ error: 'patientUserId must be a valid number' });
  }

  const authRole = String(req.auth?.role || '').toLowerCase();
  if (Number(req.auth.userId) !== userId) {
    return res.status(403).json({ error: 'You do not have access to update this patient.' });
  }

  const sql = `
    UPDATE PatientInfo
    SET doctor_id = ?
    WHERE user_id = ?
  `;

  try {
    const [result] = await db.execute(sql, [doctorId, userId]);

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

  if (String(req.auth?.role || '').toLowerCase() !== 'doctor' || Number(req.auth.userId) !== Number(doctorId)) {
    return res.status(403).json({ error: 'You do not have access to update this patient.' });
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