import { useNavigate } from "react-router-dom";
import "./CreatePatient.css";

const CreatePatient = () => {
    const navigate = useNavigate();

  return (
    <div className="create-patient-container">

      <h1>Create Patient</h1>

          <button className="home-button" onClick={() => navigate("/")}>
        Home
      </button>

      <form className="patient-form">

        <div className="form-grid">

          <div className="form-column">
            <input type="text" placeholder="Name" />
            <input type="number" placeholder="Age" />
            <input type="text" placeholder="Gender" />
            <input type="text" placeholder="Blood Type" />
            <input type="password" placeholder="Password" />
          </div>

          
          <div className="form-column">
            <input type="text" placeholder="CPR" />
            <input type="date" placeholder="Date of Birth" />
            <input type="text" placeholder="Address" />
            <input type="text" placeholder="Phone" />
            <input type="text" placeholder="Username" />
          </div>

        </div>

        <div className="submit-container">
          <button type="submit">Submit</button>
        </div>

      </form>

    </div>
  );
};

export default CreatePatient;