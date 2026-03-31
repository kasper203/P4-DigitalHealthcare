const express = require("express");
const argon2 = require("argon2");
const pool = require("../db");

const router = express.Router();

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

router.post("/register", async (req, res) => {
  try {
    const {
      username,
      password,
      confirmPassword,
      name,
      cpr,
      date_of_birth,
      address,
      gender,
      blood_type,
    } = req.body;

    const cleanUsername = normalizeUsername(username);

    if (
      !cleanUsername ||
      !password ||
      !confirmPassword ||
      !name ||
      !cpr ||
      !date_of_birth ||
      !address ||
      !gender ||
      !blood_type
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    if (password.length < 12) {
      return res.status(400).json({
        message: "Password must be at least 12 characters long.",
      });
    }

    const [existingUser] = await pool.execute(
      "SELECT id FROM Login WHERE username = ? LIMIT 1",
      [cleanUsername]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [patientResult] = await connection.execute(
        `INSERT INTO PatientInfo
         (user_id, cpr, date_of_birth, address, gender, blood_type, name, doctor_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [null, cpr, date_of_birth, address, gender, blood_type, fullName, null]
      );

      const newUserId = patientResult.insertId;

      await connection.execute(
        "UPDATE PatientInfo SET user_id = ? WHERE id = ?",
        [newUserId, newUserId]
      );

      await connection.execute(
        `INSERT INTO Login (user_id, username, password, user_type)
         VALUES (?, ?, ?, ?)`,
        [newUserId, cleanUsername, hashedPassword, "user"]
      );

      await connection.commit();

      return res.status(201).json({
        message: "User created successfully.",
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password, user_type } = req.body;

    const cleanUsername = normalizeUsername(username);

    if (!cleanUsername || !password || !user_type) {
      return res.status(400).json({
        message: "Username, password and user type are required.",
      });
    }

    if (user_type !== "user" && user_type !== "doctor") {
      return res.status(400).json({ message: "Invalid user type." });
    }

    const [rows] = await pool.execute(
      `SELECT id, user_id, username, password, user_type
       FROM Login
       WHERE username = ? AND user_type = ?
       LIMIT 1`,
      [cleanUsername, user_type]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const account = rows[0];

    const passwordMatches = await argon2.verify(account.password, password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: account.id,
        user_id: account.user_id,
        username: account.username,
        user_type: account.user_type,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
