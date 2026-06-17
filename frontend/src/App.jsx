import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import Login from './pages/auth/LoginPage';
import Register from './pages/auth/RegisterPage'; // اضافه کن
import PatientDashboard from './pages/patient/PatientDashboardPage'; // مسیری که داشبوردت هست
import DoctorDashboard from './pages/doctor/DoctorDashboardPage';
import DoctorProfile from './pages/doctor/DoctorProfilePage';
import PatientProfile from './pages/patient/PatientProfilePage';
import DoctorAppointments from './pages/doctor/DoctorAppointmentsPage';
import DoctorsList from './pages/patient/DoctorsListPage';
import AppointmentSelectionPage from './pages/patient/AppointmentSelectionPage';
import PatientMyAppointments from './pages/patient/PatientMyAppointmentsPage'



import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/patient-dashboard" element={<PatientDashboard />} /> 
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} /> 
        <Route path="/doctor-profile" element={<DoctorProfile />} /> 
        <Route path="/patient-profile" element={<PatientProfile />} />
        <Route path="/doctor-appointments" element={<DoctorAppointments />} /> 
        <Route path="/doctors-list" element={<DoctorsList />} /> 
        <Route path="/doctor/:doctorId" element={<AppointmentSelectionPage />} />
        <Route path="/patient-appointments" element={<PatientMyAppointments />} /> 


      </Routes>
    </Router>
  );
}

export default App;
