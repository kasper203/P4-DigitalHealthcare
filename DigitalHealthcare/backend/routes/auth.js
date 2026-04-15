const express = require("express");
const argon2 = require("argon2");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const pool = require("../db");

const router = express.Router();

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      password,
      confirmPassword,
    } = req.body;

    const cleanUsername = normalizeUsername(username);

    if (
      !cleanUsername ||
      !password ||
      !confirmPassword
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
      "SELECT id FROM Login WHERE brugernavn = ? LIMIT 1",
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
        `INSERT INTO Patientinfo
         (user_id, cpr, foedselsdag, adresse, koen, blodtype, navn, laege_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [null, null, null, null, null, null, null, null]
      );

      const newUserId = patientResult.insertId;

      await connection.execute(
        `INSERT INTO Login (user_id, brugernavn, password, type, two_factor_enabled)
         VALUES (?, ?, ?, ?, ?)`,
        [newUserId, cleanUsername, hashedPassword, "user", false]
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

/* =========================
   2FA SETUP (QR CODE)
========================= */
router.post("/2fa/setup", async (req, res) => {
  try {
    const { user_id } = req.body;

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `HealthcareApp (${user_id})`,
    });

    await pool.execute(
      "UPDATE Login SET two_factor_secret = ? WHERE user_id = ?",
      [secret.base32, user_id]
    );

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return res.json({
      message: "Scan QR code with Google Authenticator",
      qrCode,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "2FA setup failed" });
  }
});

/* =========================
   2FA VERIFY (ENABLE)
========================= */
router.post("/2fa/verify", async (req, res) => {
  try {
    const { user_id, token } = req.body;

    const [rows] = await pool.execute(
      "SELECT two_factor_secret FROM Login WHERE user_id = ?",
      [user_id]
    );

    const secret = rows[0]?.two_factor_secret;

    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid code" });
    }

    await pool.execute(
      "UPDATE Login SET two_factor_enabled = TRUE WHERE user_id = ?",
      [user_id]
    );

    return res.json({ message: "2FA enabled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});

/* =========================
   LOGIN WITH 2FA
========================= */
router.post("/login", async (req, res) => {
  try {
    const { username, password, user_type, token } = req.body;

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
      `SELECT id, user_id, brugernavn, password, type, two_factor_enabled, two_factor_secret
       FROM Login
       WHERE brugernavn = ? AND type = ?
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

    /* 🔐 2FA CHECK */
    if (account.two_factor_enabled) {
      if (!token) {
        return res.status(206).json({
          message: "2FA required",
          requires2FA: true,
          user_id: account.user_id,
        });
      }

      const verified = speakeasy.totp.verify({
        secret: account.two_factor_secret,
        encoding: "base32",
        token,
        window: 1,
      });

      if (!verified) {
        return res.status(401).json({ message: "Invalid 2FA code." });
      }
    }

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: account.id,
        user_id: account.user_id,
        username: account.brugernavn,
        user_type: account.type,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;