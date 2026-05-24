import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTestresultEntry } from "../services/databaseService";
import { getStoredUser } from "../utils/auth";
import "./CreateTestResult.css";

const CreateTestResult = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [testType, setTestType] = useState("");
  const [testResultText, setTestResultText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const normalizedPatientId = Number(patientId);
    const normalizedType = testType.trim();
    const normalizedResult = testResultText.trim();

    if (!normalizedPatientId) {
      setMessage("Invalid patient id.");
      return;
    }

    if (!normalizedType) {
      setMessage("Test type cannot be empty.");
      return;
    }

    if (!normalizedResult) {
      setMessage("Test result text cannot be empty.");
      return;
    }

    setSubmitting(true);

    try {
      const parsedUser = getStoredUser();
      const author = parsedUser?.username || "Unknown";

      await createTestresultEntry(normalizedPatientId, normalizedResult, normalizedType, author);
      navigate(`/patient-info/${normalizedPatientId}`);
    } catch (error) {
      setMessage(error.message || "Failed to save test result.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-testresult-container">
      <div className="page-controls">
        <button className="home-button" onClick={() => navigate("/")}>Home</button>
        <button className="back-button" onClick={() => navigate(-1)}>Back</button>
      </div>

      <h1>Create Test Result</h1>

      <form className="create-testresult-form" onSubmit={handleSubmit}>
        <label htmlFor="test-type-input">Test Type</label>
        <input
          id="test-type-input"
          type="text"
          value={testType}
          onChange={(e) => setTestType(e.target.value)}
          placeholder="Write the test type here..."
          required
        />

        <label htmlFor="test-result-input">Test Result</label>
        <textarea
          id="test-result-input"
          value={testResultText}
          onChange={(e) => setTestResultText(e.target.value)}
          placeholder="Write the test result here..."
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Test Result"}
        </button>
      </form>

      {message && <p className="create-testresult-message">{message}</p>}
    </div>
  );
};

export default CreateTestResult;
