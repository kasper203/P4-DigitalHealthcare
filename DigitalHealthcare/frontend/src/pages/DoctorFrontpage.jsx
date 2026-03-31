import { useNavigate } from "react-router-dom";
import "./DoctorFrontpage.css";

const DoctorFrontpage = () => {
  const navigate = useNavigate();

  const patients = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Michael Brown" },
    { id: 4, name: "Anna White" },
    { id: 5, name: "Chris Green" },
    { id: 6, name: "Emma Black" },
  ];

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

        <div className="patient-list">
          {patients.map((patient) => (
            <div key={patient.id} className="patient-item">
              {patient.name}
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default DoctorFrontpage;