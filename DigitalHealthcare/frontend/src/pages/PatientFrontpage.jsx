import { useNavigate } from "react-router-dom";
import "./PatientFrontpage.css";

const PatientFrontpage = () => {
const navigate = useNavigate();

return (
  <div className="Frontpage-container">

    <button className="home-button" onClick={() => navigate("/")}>
      Home
    </button>

    <h1>Patient Front Page</h1>

        <button onClick={() => navigate("/change-password")}>
  Change Password
</button>

    <div className="Frontpage-grid">

      <div className="card">
        <h2>Name</h2>
        <p>John Doe</p>
      </div>

      <div className="card">
        <h2>Personal Info</h2>
        <p>Age: 25</p>
        <p>Email: john@example.com</p>
      </div>

      <div className="card">
        <h2>Journals</h2>
        <p>No entries yet...</p>
      </div>

      <div className="card">
        <h2>Test Results</h2>
        <p>No results yet...</p>
      </div>

    </div>

  </div>
);
};

export default PatientFrontpage;