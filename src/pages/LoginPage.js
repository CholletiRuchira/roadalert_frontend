import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back, ' + user.name + '!');
      navigate(user.role === 'authority' ? '/authority' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', padding:'40px 16px' }}>
      <div className="card" style={{ width:'100%', maxWidth:400 }}>
        <h2 style={{ marginBottom:6, fontSize:22 }}>Welcome Back</h2>
        <p style={{ color:'#666', fontSize:14, marginBottom:20 }}>Sign in to your RoadAlert account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email:e.target.value})} required/>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password:e.target.value})} required/>
          </div>
          <button type="submit" className="btn btn-primary"
            style={{ width:'100%', justifyContent:'center', padding:11, marginTop:4 }}
            disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop:16, padding:12, background:'#f9f9f9', borderRadius:6, border:'1px solid #eee' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#999', textTransform:'uppercase', marginBottom:4 }}>Default Authority Account</div>
          <div style={{ fontSize:13, color:'#555' }}>Email: authority@roadalert.gov</div>
          <div style={{ fontSize:13, color:'#555' }}>Password: Admin@1234</div>
        </div>

        <p style={{ textAlign:'center', marginTop:14, fontSize:13, color:'#666' }}>
          New user? <Link to="/register" style={{ color:'#e85d04', fontWeight:600 }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}