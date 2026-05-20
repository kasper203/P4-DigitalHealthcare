const express = require("express");
const argon2 = require("argon2");
const pool = require("../db");
const speakeasy = require("speakeasy");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { encryptField } = require("../encryptionHelper");
const { authenticateToken, getJwtSecret } = require("../middleware/jwtAuth");

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeUserType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "user") return "patient";
  if (normalized === "patient" || normalized === "doctor") return normalized;
  return null;
}

function normalizeSelectedRole(value) {
  return value === "user" ? "patient" : value;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    message: "Too many login attempts from this IP, please try again after 15 minutes.",
  },
});
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
      memoryCost: 12288,
      timeCost: 3,
      parallelism: 1,
    });

    const connection = await pool.getConnection();

    const encryptedName = encryptField(name);
    const encryptedCpr = encryptField(cpr);
    const encryptedDob = date_of_birth; // leave as DATE if you want date logic
    const encryptedAddress = encryptField(address);
    const encryptedGender = encryptField(gender);
    const encryptedBloodType = encryptField(blood_type);

    try {
      await connection.beginTransaction();

      const [patientResult] = await connection.execute(
        `INSERT INTO PatientInfo
        (user_id, cpr, date_of_birth, address, gender, blood_type, name, doctor_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          null,
          encryptedCpr,
          encryptedDob,
          encryptedAddress,
          encryptedGender,
          encryptedBloodType,
          encryptedName,
          null
        ]
      );

      const newUserId = patientResult.insertId;

      const multifa_secret = speakeasy.generateSecret({ length: 32 }).base32;

      await connection.execute(
        `INSERT INTO Login (user_id, username, password, type, multifa_secret)
         VALUES (?, ?, ?, ?, ?)`,
        [newUserId, cleanUsername, hashedPassword, "patient", multifa_secret]
      );

      await connection.commit();

      return res.status(201).json({
        message: "User created successfully.",
        multifa_secret: multifa_secret,
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

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password, user_type, otp_code } = req.body;

    const cleanUsername = normalizeUsername(username);

    if (!cleanUsername || !password || !user_type || !otp_code) {
      return res.status(400).json({
        message: "Username, password, user type and 2FA code are required.",
      });
    }

    const normalizedType = normalizeUserType(user_type);

    if (!normalizedType) {
      return res.status(400).json({ message: "Invalid user type." });
    }

    const [rows] = await pool.execute(
      `SELECT id, user_id, username, password, multifa_secret, type AS selected_role
       FROM Login
       WHERE username = ? AND type = ?
       LIMIT 1`,
      [cleanUsername, normalizedType]
    );

    if (rows.length === 0) {
      await sleep(2000);
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const account = rows[0];

    const passwordMatches = await argon2.verify(account.password, password);

    if (!passwordMatches) {
      await sleep(2000);
      return res.status(401).json({ message: "Login unsuccessful." });
    }

    const validOtp = speakeasy.totp.verify({
      secret: account.multifa_secret,
      encoding: "base32",
      token: String(otp_code).trim(),
      window: 2,
    });

    if (!validOtp) {
      await sleep(2000);
      return res.status(401).json({ message: "Login unsuccessful." });
    }

    const role = normalizeSelectedRole(account.selected_role);
    const token = jwt.sign(
      {
        loginId: account.id,
        userId: account.user_id,
        username: account.username,
        role,
      },
      getJwtSecret(),
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: account.id,
        user_id: account.user_id,
        username: account.username,
        user_type: role,
      },
    });


  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { accountId, user_id, currentPassword, newPassword, confirmPassword } = req.body;
    const loginId = req.auth.loginId;

    if (accountId && Number(accountId) !== Number(loginId)) {
      return res.status(403).json({ message: "You can only change your own password." });
    }

    if (user_id && Number(user_id) !== Number(req.auth.userId)) {
      return res.status(403).json({ message: "You can only change your own password." });
    }

    if (!loginId || !currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({
        message: "Password must be at least 12 characters long.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password.",
      });
    }

    const [rows] = await pool.execute(
      "SELECT id, password FROM Login WHERE id = ? LIMIT 1",
      [loginId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const account = rows[0];
    const passwordMatches = await argon2.verify(account.password, currentPassword);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    const hashedNewPassword = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    await pool.execute(
      "UPDATE Login SET password = ? WHERE id = ?",
      [hashedNewPassword, account.id]
    );

    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
