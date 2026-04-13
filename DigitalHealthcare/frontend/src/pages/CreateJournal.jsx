import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createJournalEntry } from "../services/databaseService";
import "./CreateJournal.css";

const CreateJournal = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [journalText, setJournalText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const normalizedText = journalText.trim();
    const normalizedPatientId = Number(patientId);

    if (!normalizedPatientId) {
      setMessage("Invalid patient id.");
      return;
    }

    if (!normalizedText) {
      setMessage("Journal text cannot be empty.");
      return;
    }

    setSubmitting(true);

    try {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      const author = parsedUser?.username || "Unknown";

      await createJournalEntry(normalizedPatientId, normalizedText, author);

      navigate(`/patient-info/${normalizedPatientId}`);
    } catch (error) {
      setMessage(error.message || "Failed to save journal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-journal-container">
      <button className="home-button" onClick={() => navigate("/")}>
        Home
      </button>

      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>

      <h1>Create Journal</h1>

      <form className="create-journal-form" onSubmit={handleSubmit}>
        <label htmlFor="journal-input">Journal Text</label>
        <textarea
          id="journal-input"
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          placeholder="Write the journal entry here..."
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Journal"}
        </button>
      </form>

      {message && <p className="create-journal-message">{message}</p>}
    </div>
  );
};

export default CreateJournal;
