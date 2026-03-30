import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import LandingPage   from './pages/LandingPage';
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import CivilianDash  from './pages/CivilianDashboard';
import SubmitReport  from './pages/SubmitReport';
import AuthorityDash from './pages/AuthorityDashboard';
import ReportDetail  from './pages/ReportDetail';
import Navbar        from './components/Navbar';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#7a8a9e' }}>
      Loading…
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'authority' ? '/authority' : '/dashboard'} />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={user ? <Navigate to={user.role === 'authority' ? '/authority' : '/dashboard'} /> : <LoginPage />} />
        <Route path="/register"  element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute role="civilian"><CivilianDash /></PrivateRoute>} />
        <Route path="/submit"    element={<PrivateRoute role="civilian"><SubmitReport /></PrivateRoute>} />
        <Route path="/authority" element={<PrivateRoute role="authority"><AuthorityDash /></PrivateRoute>} />
        <Route path="/reports/:id" element={<PrivateRoute><ReportDetail /></PrivateRoute>} />
        <Route path="*"          element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111418',
              color: '#e8edf5',
              border: '1px solid #1e2530',
              fontFamily: 'DM Sans, sans-serif'
            },
            success: { iconTheme: { primary:'#22c55e', secondary:'#111418' } },
            error:   { iconTheme: { primary:'#ef4444', secondary:'#111418' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}