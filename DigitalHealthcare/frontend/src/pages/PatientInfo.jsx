import { useNavigate } from "react-router-dom";
import "./PatientInfo.css";

const PatientInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="PatientInfo-container">

      <button className="home-button" onClick={() => navigate("/")}>
        Home
      </button>

      <h1>Patient Information</h1>

      <div className="PatientInfo-grid">

        <div className="card">
          <h2>Doctor Name</h2>
          <p>Dr. Smith</p>
        </div>

        <div className="card">
          <h2>Patient Journals</h2>
          <p>No journals available...</p>
        </div>

        <div className="card">
          <h2>Test Results</h2>
          <p>No test results...</p>
        </div>

        <div className="card">
          <h2>Create New Journal</h2>

          <form className="journal-form">
            <textarea placeholder="Write new journal entry..." />
            <button type="submit">Submit</button>
          </form>

        </div>

      </div>

    </div>
  );
};

export default PatientInfo;