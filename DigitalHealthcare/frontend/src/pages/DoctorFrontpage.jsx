import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchDoctorPatients } from "../services/databaseService";
import "./DoctorFrontpage.css";

const DoctorFrontpage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
              </div>
            ))}
          </div>
        )}

        {!loading && !error && patients.length === 0 && (
          <p>No patients assigned.</p>
        )}

      </div>

    </div>
  );
};

export default DoctorFrontpage;