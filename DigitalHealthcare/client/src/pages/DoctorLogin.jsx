import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthSession } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    otp_code: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          user_type: "doctor",
          otp_code: formData.otp_code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || `Failed to login (Status ${res.status})`);
      }
      setMessage(data.message);

      const user = data.user || {};
      if (user.user_type === 'user') user.user_type = 'patient';
      setAuthSession(user, data.token);
      navigate("/doctor-frontpage");
    } catch (error) {
      setMessage(error.message || "Could not connect to backend.");
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/")}>Home</button>
      <h1>Doctor Login</h1>

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
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          pattern="^[A-Za-z\d@$!%*?&]{12,}$"
          onChange={handleChange}
        />

        <input
          type="text"
          name="otp_code"
          placeholder="2FA code"
          value={formData.otp_code}
          onChange={handleChange}
          inputMode="numeric"
          pattern="^[0-9]{6}$"
        />

        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default DoctorLogin;