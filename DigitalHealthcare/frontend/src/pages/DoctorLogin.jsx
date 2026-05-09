import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/databaseService";

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
      const response = await fetch(`${API_URL}/auth/login`, {
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
      setMessage(data.message);

      const user = data.user || {}
      // normalize possible backend variants
      if (user.user_type === 'user') user.user_type = 'patient'
      localStorage.setItem("user", JSON.stringify(user));
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
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <input
          type="text"
          name="otp_code"
          placeholder="2FA code"
          value={formData.otp_code}
          onChange={handleChange}
          inputMode="numeric"
          pattern="[0-9]*"
        />

        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default DoctorLogin;