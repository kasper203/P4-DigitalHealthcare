import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchPatientInfoForUser,
  fetchJournalEntries,
  fetchTestresultsForUser,
} from "../services/databaseService";
import { sanitizeUserInput } from "../utils/sanitize";
import "./PatientInfo.css";

const PatientInfo = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [patientInfo, setPatientInfo] = useState(null);
  const [journals, setJournals] = useState([]);
  const [testresults, setTestresults] = useState([]);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPatientInfo = async () => {
      try {
        // If patientId is provided via URL params, use it; otherwise use logged-in user's id
        let userId;
        if (patientId) {
          userId = Number(patientId);
        } else {
          const storedUser = localStorage.getItem("user");
          if (!storedUser) {
            setError("You must be logged in to view patient information.");
            setLoading(false);
            return;
          }

          const parsedUser = JSON.parse(storedUser);
          if (!parsedUser?.user_id) {
            setError("Could not find patient id in session.");
            setLoading(false);
            return;
          }
          userId = parsedUser.user_id;
        }

        setCurrentPatientId(userId);
        const data = await fetchPatientInfoForUser(userId);
        setPatientInfo(data);

        const journalData = await fetchJournalEntries(userId);
        setJournals(Array.isArray(journalData) ? journalData : []);

        const testresultData = await fetchTestresultsForUser(userId);
        setTestresults(Array.isArray(testresultData) ? testresultData : []);
      } catch (err) {
        setError("Failed to load patient information.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPatientInfo();
  }, [patientId]);

  const fields = [
    { label: "Name", value: patientInfo?.name },
    { label: "CPR", value: patientInfo?.cpr },
    {
      label: "Date of Birth",
      value: patientInfo?.date_of_birth
        ? new Date(patientInfo.date_of_birth).toLocaleDateString()
        : null,
    },
    { label: "Address", value: patientInfo?.address },
    { label: "Gender", value: patientInfo?.gender },
    { label: "Blood Type", value: patientInfo?.blood_type },
    { label: "Doctor", value: patientInfo?.doctor_name },
  ];

  return (
    <div className="PatientInfo-container">
      <button className="home-button" onClick={() => navigate("/")}>
        Home
      </button>

      {patientId && (
        <button className="back-button" onClick={() => navigate(-1)}>
          Back
        </button>
      )}

      <h1>Patient Information</h1>

      {loading && <p>Loading patient information...</p>}
      {!loading && error && <p>{error}</p>}

      {!loading && !error && patientInfo && (
        <>
          <div className="PatientInfo-grid">
            {fields.map((field) => (
              <div key={field.label} className="card info-item">
                <h2>{field.label}</h2>
                <p>{field.value ?? "N/A"}</p>
              </div>
            ))}
          </div>

          <div className="journal-section">
            <div className="journal-section-header">
              <h2>Journals</h2>
              {currentPatientId && (
                <button
                  type="button"
                  onClick={() => navigate(`/create-journal/${currentPatientId}`)}
                >
                  Create New Journal
                </button>
              )}
            </div>

            {journals.length === 0 && <p>No journals found for this patient.</p>}

            {journals.length > 0 && (
              <div className="journal-list">
                {journals.map((journal) => (
                  <div className="card journal-item" key={journal.id}>
                    <p className="journal-text">{sanitizeUserInput(journal.journal_input)}</p>
                    <p className="journal-meta">
                      Author: {sanitizeUserInput(journal.author || "Unknown")}
                    </p>
                    <p className="journal-meta">
                      Date: {journal.date ? new Date(journal.date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="journal-section">
            <div className="journal-section-header">
              <h2>Test Results</h2>
              {currentPatientId && (
                <button
                  type="button"
                  onClick={() => navigate(`/create-test-result/${currentPatientId}`)}
                >
                  Create New Test Result
                </button>
              )}
            </div>

            {testresults.length === 0 && <p>No test results found for this patient.</p>}

            {testresults.length > 0 && (
              <div className="journal-list">
                {testresults.map((testresult) => (
                  <div className="card journal-item" key={testresult.id}>
                    <p className="journal-text">{sanitizeUserInput(testresult.test_result)}</p>
                    <p className="journal-meta">
                      Type: {sanitizeUserInput(testresult.test_type || "N/A")}
                    </p>
                    <p className="journal-meta">
                      Author: {sanitizeUserInput(testresult.author || "Unknown")}
                    </p>
                    <p className="journal-meta">
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

export default PatientInfo;