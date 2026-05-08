import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/databaseService";

const PatientLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
      const data = await loginUser({
        username: formData.username,
        password: formData.password,
        user_type: "user",
      });
      setMessage(data.message);

      const user = data.user || {}
      if (user.user_type === 'user') user.user_type = 'patient'
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/patient-frontpage");
    } catch (error) {
      setMessage(error.message || "Could not connect to backend.");
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/")}>Home</button>
      <h1>Patient Login</h1>

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

        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default PatientLogin;