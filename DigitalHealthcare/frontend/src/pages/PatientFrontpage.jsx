import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchJournalEntries,
  fetchPatientInfoForUser,
  fetchTestresultsForUser,
} from "../services/databaseService";
import { sanitizeUserInput } from "../utils/sanitize";
import "./PatientFrontpage.css";

const PatientFrontpage = () => {
const navigate = useNavigate();
const [patientInfo, setPatientInfo] = useState(null);
const [journals, setJournals] = useState([]);
const [testresults, setTestresults] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
  const loadPatientFrontpage = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.user_id) {
        setError("Could not find patient id in session.");
        setLoading(false);
        return;
      }

      const userId = parsedUser.user_id;

      const [patientData, journalData, testData] = await Promise.all([
        fetchPatientInfoForUser(userId),
        fetchJournalEntries(userId),
        fetchTestresultsForUser(userId),
      ]);

      setPatientInfo(patientData);
      setJournals(Array.isArray(journalData) ? journalData : []);
      setTestresults(Array.isArray(testData) ? testData : []);
    } catch (loadError) {
      setError("Failed to load patient front page.");
      console.error(loadError);
    } finally {
      setLoading(false);
    }
  };

  loadPatientFrontpage();
}, []);

const handleLogout = () => {
  localStorage.removeItem("user");
  navigate("/");
};

return (
  <div className="Frontpage-container">

    <button className="home-button" onClick={() => navigate("/")}>
      Home
    </button>

    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>

    <h1>Patient Front Page</h1>

        <button onClick={() => navigate("/change-password")}>
  Change Password
</button>

    {loading && <p>Loading patient data...</p>}
    {!loading && error && <p>{error}</p>}

    {!loading && !error && (
    <>
    <div className="Frontpage-grid">

      <div className="card">
        <h2>Name</h2>
        <p>{patientInfo?.name || "N/A"}</p>
      </div>

      <div className="card">
        <h2>Personal Info</h2>
        <p>CPR: {patientInfo?.cpr || "N/A"}</p>
        <p>Blood Type: {patientInfo?.blood_type || "N/A"}</p>
      </div>

    </div>

    <div className="frontpage-section">
      <h2>Journals</h2>

      {journals.length === 0 && <p>No journals found for this patient.</p>}

      {journals.length > 0 && (
        <div className="frontpage-list">
          {journals.map((journal) => (
            <div className="card frontpage-item" key={journal.id}>
              <p className="frontpage-text">{sanitizeUserInput(journal.journal_input)}</p>
              <p className="frontpage-meta">
                Author: {sanitizeUserInput(journal.author || "Unknown")}
              </p>
              <p className="frontpage-meta">
                Date: {journal.date ? new Date(journal.date).toLocaleDateString() : "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="frontpage-section">
      <h2>Test Results</h2>

      {testresults.length === 0 && <p>No test results found for this patient.</p>}

      {testresults.length > 0 && (
        <div className="frontpage-list">
          {testresults.map((testresult) => (
            <div className="card frontpage-item" key={testresult.id}>
              <p className="frontpage-text">{sanitizeUserInput(testresult.test_result)}</p>
              <p className="frontpage-meta">
                Type: {sanitizeUserInput(testresult.test_type || "N/A")}
              </p>
              <p className="frontpage-meta">
                Author: {sanitizeUserInput(testresult.author || "Unknown")}
              </p>
              <p className="frontpage-meta">
                Date: {testresult.date ? new Date(testresult.date).toLocaleDateString() : "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
    )}

  </div>
);
};

export default PatientFrontpage;