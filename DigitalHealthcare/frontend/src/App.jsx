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
import DoctorFrontpage from "./pages/DoctorFrontpage";
import ChangePassword from "./pages/ChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";
import AccessDenied from "./pages/AccessDenied";

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
    <Route path="/patient-frontpage" element={
      <ProtectedRoute requiredRole="patient">
        <PatientFrontpage />
      </ProtectedRoute>
    } />
    <Route path="/PatientInfo" element={<PatientInfo />} />
    <Route path="/patient-info/:patientId" element={<PatientInfo />} />
    <Route path="/create-journal/:patientId" element={
      <ProtectedRoute requiredRole="doctor">
        <CreateJournal />
      </ProtectedRoute>
    } />
    <Route path="/create-test-result/:patientId" element={
      <ProtectedRoute requiredRole="doctor">
        <CreateTestResult />
      </ProtectedRoute>
    } />
    <Route path="/doctor-frontpage" element={
      <ProtectedRoute requiredRole="doctor">
        <DoctorFrontpage />
      </ProtectedRoute>
    } />
    <Route path="/change-password" element={<ChangePassword />} />
    <Route path="/403" element={<AccessDenied />} />
  </Routes>
);
}

export default App;