const express = require("express");
const argon2 = require("argon2");
const pool = require("../db");

const router = express.Router();

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeUserType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "user") return "patient";
  if (normalized === "patient" || normalized === "doctor") return normalized;
  return null;
}

function alternatePatientValue(value) {
  if (value === "patient") return "user";
  if (value === "user") return "patient";
  return value;
}

function isUnknownColumnError(error) {
  return error && error.code === "ER_BAD_FIELD_ERROR";
}

// Simple heuristic to detect if a string looks like an Argon2 hash (error handling)
function looksLikeArgon2Hash(value) {
  return typeof value === "string" && value.startsWith("$argon2");
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
        [null, cpr, date_of_birth, address, gender, blood_type, name, null]
      );

      const newUserId = patientResult.insertId;

      try {
        await connection.execute(
          `INSERT INTO Login (user_id, username, password, type)
           VALUES (?, ?, ?, ?)`,
          [newUserId, cleanUsername, hashedPassword, "patient"]
        );
      } catch (err) {
        if (isUnknownColumnError(err)) {
          await connection.execute(
            `INSERT INTO Login (user_id, username, password, user_type)
             VALUES (?, ?, ?, ?)`,
            [newUserId, cleanUsername, hashedPassword, "user"]
          );
        } else {
          throw err;
        }
      }

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

    const normalizedType = normalizeUserType(user_type);

    if (!normalizedType) {
      return res.status(400).json({ message: "Invalid user type." });
    }

    let rows;
    let roleColumn = "type";
    let roleValue = normalizedType;

    try {
      [rows] = await pool.execute(
        `SELECT id, user_id, username, password, type AS selected_role
         FROM Login
         WHERE username = ? AND type = ?
         LIMIT 1`,
        [cleanUsername, roleValue]
      );
    } catch (error) {
      if (!isUnknownColumnError(error)) {
        throw error;
      }

      roleColumn = "user_type";
      roleValue = alternatePatientValue(normalizedType);

      [rows] = await pool.execute(
        `SELECT id, user_id, username, password, user_type AS selected_role
         FROM Login
         WHERE username = ? AND user_type = ?
         LIMIT 1`,
        [cleanUsername, roleValue]
      );
    }

    if (rows.length === 0 && roleValue === "patient") {
      const alternate = alternatePatientValue(roleValue);
      [rows] = await pool.execute(
        `SELECT id, user_id, username, password, ${roleColumn} AS selected_role
         FROM Login
         WHERE username = ? AND ${roleColumn} = ?
         LIMIT 1`,
        [cleanUsername, alternate]
      );
    }

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const account = rows[0];

    let passwordMatches = false;

    if (looksLikeArgon2Hash(account.password)) {
      passwordMatches = await argon2.verify(account.password, password);
    } else {
      // Support legacy plaintext seed data and transparently upgrade on success.
      passwordMatches = account.password === password;

      if (passwordMatches) {
        const upgradedHash = await argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: 19456,
          timeCost: 2,
          parallelism: 1,
        });

        await pool.execute(
          "UPDATE Login SET password = ? WHERE id = ?",
          [upgradedHash, account.id]
        );
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: account.id,
        user_id: account.user_id,
        username: account.username,
        user_type: account.selected_role === "user" ? "patient" : account.selected_role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

router.post("/change-password", async (req, res) => {
  try {
    const { accountId, user_id, currentPassword, newPassword, confirmPassword } = req.body;
    const loginId = accountId || user_id;

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
    let passwordMatches = false;

    if (looksLikeArgon2Hash(account.password)) {
      passwordMatches = await argon2.verify(account.password, currentPassword);
    } else {
      passwordMatches = account.password === currentPassword;
    }

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
