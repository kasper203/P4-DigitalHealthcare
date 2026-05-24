import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/databaseService";
import { QRCodeCanvas } from "qrcode.react";
import Button from "../components/Button";

const API_URL = import.meta.env.VITE_API_URL;

const CreateUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    cpr: "",
    date_of_birth: "",
    address: "",
    gender: "",
    blood_type: "",
  });

  const [message, setMessage] = useState("");
  const [multifaSecret, setMultifaSecret] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const { password, confirmPassword } = formData;
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!password || password.length < 12) {
      setMessage("Password must be at least 12 characters long.");
      return;
    }

    try {
      const data = await registerUser(formData);
      setMessage(data.message);
      setMultifaSecret(data.multifa_secret);
      const url = `otpauth://totp/Sundhed?secret=${data.multifa_secret}`;
      setOtpauthUrl(url);
    } catch (error) {
      setMessage(error.message || "Could not connect to backend.");
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/")}>Home</button>
      <h1>Create User</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          pattern="^[A-Za-z0-9_]{3,20}$"
          onChange={handleChange}
        />

        <input
          type="text"
          name="name"
          placeholder="Full name"
          value={formData.name}
          pattern="^[A-Za-zÀ-ÿ\s\-]{2,50}$"
          onChange={handleChange}
        />

        <input
          type="text"
          name="cpr"
          placeholder="CPR"
          value={formData.cpr}
          pattern="^\d{6}-?\d{4}$"         
          onChange={handleChange}
        />

        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          pattern="^[A-Za-z0-9\s\-]{2,100}$"
          onChange={handleChange}
        />

        <input
          type="text"
          name="gender"
          placeholder="Gender"
          value={formData.gender}
          pattern="^[a-zA-Z]+$"
          onChange={handleChange}
        />

        <input
          type="text"
          name="blood_type"
          placeholder="Blood type"
          value={formData.blood_type}
          pattern="^(A|B|AB|O)[+-]$"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          pattern="^[A-Za-z\\d@$!%*?&]{12,}$"
          onChange={handleChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          pattern="^[A-Za-z\\d@$!%*?&]{12,}$"
          onChange={handleChange}
        />
        <br />
        <button type="submit">Create Account</button>
      </form>

      {message && <p>{message}</p>}

      {otpauthUrl && (
        <div>
          <h2>Scan this QR code with Google Authenticator</h2>
          <QRCodeCanvas value={otpauthUrl} size={256} />
          <p>Secret: {multifaSecret}</p>
        </div>
      )}

      <Button text="Patient Login" path="/patient-login" />

    </div>
  );
};

export default CreateUser;