import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const PatientLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, user_type: "user" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("Login successful!");
      setForm({ username: "", password: "" });
      navigate("/patient-frontpage");
    } catch (err) {
      setError("Unable to connect to the backend.");
    }
  };

  return (
    <div className="create-user-container">
      <button className="home-button" onClick={() => navigate("/")}>Home</button>

      <h1>Patient Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
        />
        <br />
        <br />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <br />
        <br />
        <button type="submit">Login</button>
      </form>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default PatientLogin;