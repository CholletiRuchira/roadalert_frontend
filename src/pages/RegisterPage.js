import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name:'', email:'', password:'', confirm:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6)       return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', padding:'40px 16px' }}>
      <div className="card" style={{ width:'100%', maxWidth:400 }}>
        <h2 style={{ marginBottom:6, fontSize:22 }}>Create Account</h2>
        <p style={{ color:'#666', fontSize:14, marginBottom:20 }}>Join as a civilian reporter</p>

        <form onSubmit={handleSubmit}>
          {[
            { label:'Full Name',        key:'name',    type:'text',     ph:'John Doe' },
            { label:'Email Address',    key:'email',   type:'email',    ph:'you@example.com' },
            { label:'Password',         key:'password',type:'password', ph:'Min 6 characters' },
            { label:'Confirm Password', key:'confirm', type:'password', ph:'Re-enter password' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input className="form-input" type={f.type} placeholder={f.ph} required
                value={form[f.key]} onChange={e => setForm({...form, [f.key]:e.target.value})}/>
            </div>
          ))}
          <button type="submit" className="btn btn-primary"
            style={{ width:'100%', justifyContent:'center', padding:11, marginTop:4 }}
            disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:14, fontSize:13, color:'#666' }}>
          Already have an account? <Link to="/login" style={{ color:'#e85d04', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}