import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchDoctorPatients, assignPatientToDoctor, unassignPatientFromDoctor } from "../services/databaseService";
import "./DoctorFrontpage.css";

const DoctorFrontpage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patientCprToAssign, setPatientCprToAssign] = useState("");
  const [assignMessage, setAssignMessage] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [removingPatientId, setRemovingPatientId] = useState(null);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          setError("You must be logged in to view patients.");
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser?.user_id) {
          setError("Could not find doctor id in session.");
          setLoading(false);
          return;
        }

        const patientsData = await fetchDoctorPatients(parsedUser.user_id);
        setPatients(patientsData);
      } catch (err) {
        setError("Failed to load patients.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const handlePatientClick = (patientUserId) => {
    navigate(`/patient-info/${patientUserId}`);
  };

  const handleAssignPatient = async (e) => {
    e.preventDefault();
    setAssignMessage("");
    setAssigning(true);

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("Not logged in");
      }

      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.user_id) {
        throw new Error("Could not find doctor id");
      }

      const normalizedCpr = patientCprToAssign.trim();
      if (!normalizedCpr) {
        throw new Error("Please enter a valid CPR number");
      }

      await assignPatientToDoctor(normalizedCpr, parsedUser.user_id);

      setAssignMessage("Patient assigned successfully!");
      setPatientCprToAssign("");

      // Reload patients list
      const patientsData = await fetchDoctorPatients(parsedUser.user_id);
      setPatients(patientsData);

      setTimeout(() => {
        setAssignMessage("");
      }, 3000);
    } catch (error) {
      setAssignMessage(`Error: ${error.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemovePatient = async (e, patientUserId) => {
    e.stopPropagation();
    setAssignMessage("");
    setRemovingPatientId(patientUserId);

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("Not logged in");
      }

      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.user_id) {
        throw new Error("Could not find doctor id");
      }

      await unassignPatientFromDoctor(patientUserId, parsedUser.user_id);

      const patientsData = await fetchDoctorPatients(parsedUser.user_id);
      setPatients(patientsData);
      setAssignMessage("Patient removed from your list.");

      setTimeout(() => {
        setAssignMessage("");
      }, 3000);
    } catch (removeError) {
      setAssignMessage(`Error: ${removeError.message}`);
    } finally {
      setRemovingPatientId(null);
    }
  };

  return (
    <div className="doctor-container">

      <h1>Doctor Front Page</h1>

        <button className="home-button" onClick={() => navigate("/")}>
        Home
        </button>

    <button onClick={() => navigate("/change-password")}>
  Change Password
</button>

      <div className="patient-box">
        <h2>Patients</h2>

        {loading && <p>Loading patients...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && patients.length > 0 && (
          <div className="patient-list">
            {patients.map((patient) => (
              <div
                key={patient.user_id}
                className="patient-item"
                onClick={() => handlePatientClick(patient.user_id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePatientClick(patient.user_id);
                }}
              >
                <p className="patient-name">{patient.name}</p>
                <p className="patient-cpr">{patient.cpr}</p>
                <button
                  type="button"
                  className="remove-patient-button"
                  onClick={(e) => handleRemovePatient(e, patient.user_id)}
                  disabled={removingPatientId === patient.user_id}
                >
                  {removingPatientId === patient.user_id ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && patients.length === 0 && (
          <p>No patients assigned.</p>
        )}

      </div>

      <div className="assign-patient-box">
        <h2>Assign Patient to You</h2>
        <form onSubmit={handleAssignPatient}>
          <input
            type="text"
            placeholder="Enter Patient CPR"
            value={patientCprToAssign}
            onChange={(e) => setPatientCprToAssign(e.target.value)}
            required
          />
          <button type="submit" disabled={assigning}>
            {assigning ? "Assigning..." : "Assign Patient"}
          </button>
        </form>
        {assignMessage && (
          <p
            style={{
              color: assignMessage.includes("Error") ? "red" : "green",
              marginTop: "0.5rem",
            }}
          >
            {assignMessage}
          </p>
        )}
      </div>

    </div>
  );
};

export default DoctorFrontpage;