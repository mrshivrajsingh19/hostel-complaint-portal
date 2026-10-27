import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import NewComplaint from './pages/student/NewComplaint';
import ComplaintDetail from './pages/student/ComplaintDetail';
import WardenDashboard from './pages/warden/WardenDashboard';
import AllComplaints from './pages/warden/AllComplaints';
import ManageComplaint from './pages/warden/ManageComplaint';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/login" element={user ? <Navigate to={user.role === 'warden' ? '/warden' : '/student'} replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'warden' ? '/warden' : '/student'} replace /> : <Register />} />

        {/* Student routes */}
        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/new" element={<ProtectedRoute role="student"><NewComplaint /></ProtectedRoute>} />
        <Route path="/student/complaint/:id" element={<ProtectedRoute role="student"><ComplaintDetail /></ProtectedRoute>} />

        {/* Warden routes */}
        <Route path="/warden" element={<ProtectedRoute role="warden"><WardenDashboard /></ProtectedRoute>} />
        <Route path="/warden/complaints" element={<ProtectedRoute role="warden"><AllComplaints /></ProtectedRoute>} />
        <Route path="/warden/complaint/:id" element={<ProtectedRoute role="warden"><ManageComplaint /></ProtectedRoute>} />

        {/* Root redirect */}
        <Route path="/" element={
          user
            ? <Navigate to={user.role === 'warden' ? '/warden' : '/student'} replace />
            : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
