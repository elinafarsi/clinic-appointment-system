import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import Login from './pages/auth/LoginPage';
import Register from './pages/auth/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboardPage';
import DoctorDashboard from './pages/doctor/DoctorDashboardPage';
import DoctorProfile from './pages/doctor/DoctorProfilePage';
import PatientProfile from './pages/patient/PatientProfilePage';
import DoctorAppointments from './pages/doctor/DoctorAppointmentsPage';
import DoctorsList from './pages/patient/DoctorsListPage';
import AppointmentSelectionPage from './pages/patient/AppointmentSelectionPage';
import PatientMyAppointments from './pages/patient/PatientMyAppointmentsPage';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-profile"
          element={
            <ProtectedRoute>
              <DoctorProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient-profile"
          element={
            <ProtectedRoute>
              <PatientProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-appointments"
          element={
            <ProtectedRoute>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctors-list"
          element={
            <ProtectedRoute>
              <DoctorsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/:doctorId"
          element={
            <ProtectedRoute>
              <AppointmentSelectionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient-appointments"
          element={
            <ProtectedRoute>
              <PatientMyAppointments />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
