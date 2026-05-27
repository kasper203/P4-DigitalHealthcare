import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchJournalEntries,
  fetchPatientInfoForUser,
  fetchTestresultsForUser,
  fetchAllDoctors,
  switchPatientDoctor,
} from "../services/databaseService";
import { clearAuthSession, getStoredUser } from "../utils/auth";
import { sanitizeUserInput } from "../utils/sanitize";
import "./PatientFrontpage.css";

const PatientFrontpage = () => {
const navigate = useNavigate();
const [patientInfo, setPatientInfo] = useState(null);
const [journals, setJournals] = useState([]);
const [testresults, setTestresults] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [doctors, setDoctors] = useState([]);
const [selectedDoctorId, setSelectedDoctorId] = useState("");
const [actionMessage, setActionMessage] = useState("");

useEffect(() => {
  const loadPatientFrontpage = async () => {
    try {
      const parsedUser = getStoredUser();
      if (!parsedUser) {
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }

      if (!parsedUser?.user_id) {
        setError("Could not find patient id in session.");
        setLoading(false);
        return;
      }

      const userId = parsedUser.user_id;

      const [patientData, journalData, testData, doctorsData] = await Promise.all([
        fetchPatientInfoForUser(userId),
        fetchJournalEntries(userId),
        fetchTestresultsForUser(userId),
        fetchAllDoctors(),
      ]);

      setPatientInfo(patientData);
      setJournals(Array.isArray(journalData) ? journalData : []);
      setTestresults(Array.isArray(testData) ? testData : []);
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      setSelectedDoctorId(patientData?.doctor_id || "");
    } catch (loadError) {
      setError(loadError?.message || "Failed to load patient front page.");
      console.error(loadError);
    } finally {
      setLoading(false);
    }
  };

  loadPatientFrontpage();
}, []);

const handleLogout = () => {
  clearAuthSession();
  navigate("/");
};

return (
  <div className="Frontpage-container">

    <div className="page-controls">
      <button className="home-button" onClick={() => navigate("/")}>Home</button>
    </div>

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
      <h2>Change Doctor</h2>

      <p>Current doctor: {patientInfo?.doctor_name || 'Not assigned'}</p>

      <label htmlFor="doctor-select">Select new doctor:</label>
      <select
        id="doctor-select"
        value={selectedDoctorId}
        onChange={(e) => setSelectedDoctorId(e.target.value)}
      >
        <option value="">-- Choose doctor --</option>
        {doctors.map((doc) => (
          <option key={doc.doctor_id} value={doc.doctor_id}>
            {doc.name}
          </option>
        ))}
      </select>

      <button
        onClick={async () => {
          if (!selectedDoctorId) {
            setActionMessage('Please select a doctor first.');
            return;
          }

          const confirmMsg = `Confirm switch to ${doctors.find(d => String(d.doctor_id) === String(selectedDoctorId))?.name || 'the selected doctor'}?`;
          if (!window.confirm(confirmMsg)) return;

          try {
            setActionMessage('Switching doctor...');
            await switchPatientDoctor(patientInfo.user_id, selectedDoctorId);
            const storedUser = getStoredUser();
            const updated = await fetchPatientInfoForUser(storedUser.user_id);
            setPatientInfo(updated);
            setActionMessage('Doctor switched successfully.');
          } catch (err) {
            console.error(err);
            setActionMessage(err.message || 'Failed to switch doctor.');
          }
        }}
      >
        Confirm Doctor Change
      </button>

      {actionMessage && <p>{actionMessage}</p>}
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