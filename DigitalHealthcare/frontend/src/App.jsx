import './App.css'
import Button from './components/Button';
import { Routes, Route } from "react-router-dom";
import CreateUser from "./pages/CreateUser";
import DoctorLogin from "./pages/DoctorLogin";
import PatientLogin from "./pages/PatientLogin";
import PatientFrontpage from "./pages/PatientFrontpage";
import PatientInfo from "./pages/PatientInfo";
import CreateJournal from "./pages/CreateJournal";
import CreateTestResult from "./pages/CreateTestResult";
import CreatePatient from "./pages/CreatePatient";
import DoctorFrontpage from "./pages/DoctorFrontpage";
import ChangePassword from "./pages/ChangePassword";

function App() {
return (
  <Routes>
    <Route path="/" element={
      <div className="App">
        <h1>Digital Healthcare</h1>

        <div className="Login-buttons-group">
          <Button text="Patient Login" path="/patient-login" />
          <Button text="Create User" path="/create-user" />
          <Button text="Doctor Login" path="/doctor-login" />
        </div>
      </div>
    } />

    <Route path="/create-user" element={<CreateUser />} />
    <Route path="/doctor-login" element={<DoctorLogin />} />
    <Route path="/patient-login" element={<PatientLogin />} />
    <Route path="/patient-frontpage" element={<PatientFrontpage />} />
    <Route path="/PatientInfo" element={<PatientInfo />} />
    <Route path="/patient-info/:patientId" element={<PatientInfo />} />
    <Route path="/create-journal/:patientId" element={<CreateJournal />} />
    <Route path="/create-test-result/:patientId" element={<CreateTestResult />} />
    <Route path="/create-patient" element={<CreatePatient />} />
    <Route path="/doctor-frontpage" element={<DoctorFrontpage />} />
    <Route path="/change-password" element={<ChangePassword />} />
  </Routes>
);
}

export default App;