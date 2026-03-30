import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const SEVERITIES  = ['low','medium','high','critical'];
const HAZARD_TYPES = [
  { value:'pothole',      label:'Pothole' },
  { value:'crack',        label:'Road Crack' },
  { value:'flooding',     label:'Road Flooding' },
  { value:'debris',       label:'Debris / Obstruction' },
  { value:'missing_sign', label:'Missing / Damaged Sign' },
  { value:'other',        label:'Other' },
];

export default function SubmitReport() {
  const navigate = useNavigate();
  const fileRef  = useRef();
  const [form, setForm] = useState({
    title:'', description:'', location_text:'',
    latitude:'', longitude:'', severity:'medium', hazard_type:'pothole'
  });
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image');
    setImage(file);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
        toast.success('Location captured!');
      },
      () => toast.error('Could not get location')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())         return toast.error('Title is required');
    if (!form.location_text.trim()) return toast.error('Location is required');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => v && fd.append(k,v));
      if (image) fd.append('image', image);
      await axios.post('/api/reports', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      toast.success('Report submitted!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth:680 }}>
      <h2 style={{ marginBottom:6 }}>Report a Road Hazard</h2>
      <p style={{ color:'#666', marginBottom:20 }}>Provide details to help authorities respond faster.</p>

      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

        <div className="card">
          <h4 style={{ marginBottom:14, color:'#555' }}>Hazard Details</h4>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" placeholder="e.g. Large pothole on MG Road"
              value={form.title} onChange={e => setForm({...form, title:e.target.value})} required/>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} placeholder="Describe the damage..."
              value={form.description} onChange={e => setForm({...form, description:e.target.value})}
              style={{ resize:'vertical' }}/>
          </div>
          <div className="form-group">
            <label className="form-label">Hazard Type *</label>
            <select className="form-input" value={form.hazard_type}
              onChange={e => setForm({...form, hazard_type:e.target.value})}>
              {HAZARD_TYPES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>
          </div>
        </div>

        <div className="card">
          <h4 style={{ marginBottom:14, color:'#555' }}>Severity *</h4>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {SEVERITIES.map(s => (
              <label key={s} style={{
                display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
                border: `2px solid ${form.severity===s ? '#e85d04' : '#ddd'}`,
                borderRadius:6, cursor:'pointer',
                background: form.severity===s ? '#fff5f0' : '#fff',
                fontWeight:600, fontSize:14, textTransform:'capitalize'
              }}>
                <input type="radio" name="severity" value={s}
                  checked={form.severity===s}
                  onChange={e => setForm({...form, severity:e.target.value})}
                  style={{ accentColor:'#e85d04' }}/>
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="card">
          <h4 style={{ marginBottom:14, color:'#555' }}>Location</h4>
          <div className="form-group">
            <label className="form-label">Location Description *</label>
            <input className="form-input" placeholder="e.g. MG Road, near Inorbit Mall, Hyderabad"
              value={form.location_text} onChange={e => setForm({...form, location_text:e.target.value})} required/>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <div className="form-group" style={{ flex:1 }}>
              <label className="form-label">Latitude</label>
              <input className="form-input" type="number" step="any" placeholder="17.3850"
                value={form.latitude} onChange={e => setForm({...form, latitude:e.target.value})}/>
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label className="form-label">Longitude</label>
              <input className="form-input" type="number" step="any" placeholder="78.4867"
                value={form.longitude} onChange={e => setForm({...form, longitude:e.target.value})}/>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={getLocation}>
            📍 Use My GPS Location
          </button>
        </div>

        <div className="card">
          <h4 style={{ marginBottom:14, color:'#555' }}>Photo</h4>
          {preview ? (
            <div style={{ position:'relative' }}>
              <img src={preview} alt="Preview"
                style={{ width:'100%', maxHeight:250, objectFit:'cover', borderRadius:6 }}/>
              <button type="button" onClick={() => { setImage(null); setPreview(null); }}
                style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', width:28, height:28, color:'#fff', cursor:'pointer', fontSize:16 }}>
                ×
              </button>
            </div>
          ) : (
            <div onClick={() => fileRef.current.click()}
              style={{ border:'2px dashed #ccc', borderRadius:8, padding:'32px', textAlign:'center', cursor:'pointer', color:'#888' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📷</div>
              <div style={{ fontSize:14 }}>Click to upload photo</div>
              <div style={{ fontSize:12, color:'#aaa', marginTop:4 }}>PNG, JPG up to 10MB</div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
                onChange={e => handleImage(e.target.files[0])}/>
            </div>
          )}
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
}