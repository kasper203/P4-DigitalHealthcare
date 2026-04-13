import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerPatient } from "../services/databaseService";
import "./CreatePatient.css";

const CreatePatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
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
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      if (formData.password.length < 12) {
        throw new Error("Password must be at least 12 characters long.");
      }

      await registerPatient({
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        name: formData.name,
        cpr: formData.cpr,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        gender: formData.gender,
        blood_type: formData.blood_type,
      });

      setMessage("Patient created successfully! Redirecting to home...");
      setFormData({
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

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-patient-container">
      <h1>Create Patient</h1>

      <button className="home-button" onClick={() => navigate("/")}>
        Home
      </button>

      <form className="patient-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-column">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="gender"
              placeholder="Gender (M/F/Other)"
              value={formData.gender}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="blood_type"
              placeholder="Blood Type (e.g., A+, O-)"
              value={formData.blood_type}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password (min 12 chars)"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-column">
            <input
              type="text"
              name="cpr"
              placeholder="CPR"
              value={formData.cpr}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="date_of_birth"
              placeholder="Date of Birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="submit-container">
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Patient"}
          </button>
        </div>
      </form>

      {message && (
        <p
          style={{
            color: message.includes("success") ? "green" : "red",
            marginTop: "1rem",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default CreatePatient;