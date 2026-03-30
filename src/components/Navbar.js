import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Road<span>Alert</span></Link>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        {user ? (
          <>
            <span style={{ fontSize:13, color:'#666' }}>Hi, {user.name}</span>
            {user.role === 'civilian' && <>
              <Link to="/dashboard" className="btn btn-ghost btn-sm">My Reports</Link>
              <Link to="/submit"    className="btn btn-primary btn-sm">+ Report</Link>
            </>}
            {user.role === 'authority' &&
              <Link to="/authority" className="btn btn-ghost btn-sm">Dashboard</Link>}
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"    className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}