import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { changePassword } from "../services/databaseService";
import { getStoredUser } from "../utils/auth";
import "./ChangePassword.css";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const parsedUser = getStoredUser();
    if (!parsedUser) {
      setMessage("Error: You must be logged in to change your password.");
      return;
    }

    if (!parsedUser?.id) {
      setMessage("Error: Could not find login id in session.");
      return;
    }

    setUserId(parsedUser.id);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (!userId) {
        throw new Error("User ID not found.");
      }

      if (!formData.currentPassword) {
        throw new Error("Current password is required.");
      }

      if (!formData.newPassword) {
        throw new Error("New password is required.");
      }

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("New passwords do not match.");
      }

      if (formData.newPassword.length < 14) {
        throw new Error("Password must be at least 14 characters long.");
      }

      if (formData.currentPassword === formData.newPassword) {
        throw new Error("New password must be different from current password.");
      }

      await changePassword(
        userId,
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      setMessage("Password changed successfully! Redirecting...");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="change-password-container">
        <h1>Change Password</h1>
        <p className="error">{message}</p>
        <div className="page-controls">
          <button onClick={() => navigate("/")} className="back-button">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="change-password-container">
      <h1>Change Password</h1>

      <div className="page-controls">
        <button className="back-button" onClick={() => navigate(-1)}>Back</button>
      </div>

      <form onSubmit={handleSubmit} className="change-password-form">
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            pattern="^[A-Za-z\\d@$!%*?&]{14,}$"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            pattern="^[A-Za-z\d@$!%*?&]{14,}$"
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>

      {message && (
        <p className={message.startsWith("Error") ? "error" : "success"}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ChangePassword;
