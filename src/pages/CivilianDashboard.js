import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function CivilianDashboard() {
  const { user }  = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('');

  // ── Feature 3 state ──────────────────────────────────────────────────────
  const [editModal,   setEditModal]   = useState(false);
  const [editId,      setEditId]      = useState(null);
  const [editTitle,   setEditTitle]   = useState('');
  const [editDesc,    setEditDesc]    = useState('');
  const [saving,      setSaving]      = useState(false);

  const loadReports = () => {
  axios.get('/api/reports').then(r => { setReports(r.data); setLoading(false); });
  };

  useEffect(() => { loadReports(); }, []);

  const filtered = reports.filter(r => {
    const ms = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.location_text.toLowerCase().includes(search.toLowerCase());
    const mf = !filter || r.status === filter;
    return ms && mf;
  });

  const counts = {
    total:    reports.length,
    pending:  reports.filter(r => r.status === 'pending').length,
    active:   reports.filter(r => ['under_review','in_progress'].includes(r.status)).length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  function openEdit(e, r) {
    e.preventDefault();
    e.stopPropagation();
    setEditId(r.id);
    setEditTitle(r.title);
    setEditDesc(r.description || '');
    setEditModal(true);
  }

  async function saveEdit() {
    if (!editTitle.trim()) return toast.error('Title cannot be empty');
    setSaving(true);
    try {
      await axios.patch('/api/reports/' + editId, {
        title: editTitle.trim(),
        description: editDesc.trim(),
      });
      toast.success('Report updated!');
      setEditModal(false);
      loadReports();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  }

  async function deleteReport(e, id) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    try {
      await axios.delete('/api/reports/' + id + '/civilian');
      toast.success('Report deleted');
      loadReports();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  }

  return (
    <div className="page-container">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ marginBottom:2 }}>My Reports</h2>
          <p style={{ color:'#666', fontSize:14 }}>Welcome, {user.name}</p>
        </div>
        <Link to="/submit" className="btn btn-primary">+ Report Hazard</Link>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:20 }}>
        {[
          { label:'Total',       value:counts.total,    color:'#222' },
          { label:'Pending',     value:counts.pending,  color:'#e65100' },
          { label:'In Progress', value:counts.active,   color:'#1565c0' },
          { label:'Resolved',    value:counts.resolved, color:'#2e7d32' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:'center', padding:'14px 10px' }}>
            <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#666', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input className="form-input" placeholder="Search reports..." style={{ flex:1, minWidth:180 }}
          value={search} onChange={e => setSearch(e.target.value)}/>
        <select className="form-input" style={{ width:160 }}
          value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <p style={{ textAlign:'center', color:'#888', padding:40 }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:40 }}>
          <p style={{ color:'#888', marginBottom:12 }}>
            {reports.length === 0 ? 'No reports yet.' : 'No reports match your search.'}
          </p>
          {reports.length === 0 && <Link to="/submit" className="btn btn-primary">+ Report Hazard</Link>}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(r => (
            <Link key={r.id} to={`/reports/${r.id}`} style={{ textDecoration:'none', color:'inherit' }}>
              <div className="card" style={{ display:'flex', gap:14, alignItems:'flex-start', cursor:'pointer' }}>
                {r.image_url && (
                  <img src={`${API}${r.image_url}`} alt="report"
                    style={{ width:72, height:72, objectFit:'cover', borderRadius:6, flexShrink:0 }}/>
                )}
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:6, marginBottom:4 }}>
                    <strong style={{ fontSize:15 }}>{r.title}</strong>
                    <div style={{ display:'flex', gap:6 }}>
                      <span className={`badge badge-${r.severity}`}>{r.severity}</span>
                      <span className={`badge badge-${r.status}`}>{r.status.replace('_',' ')}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:13, color:'#666', marginBottom:4 }}>📍 {r.location_text}</div>
                  <div style={{ fontSize:12, color:'#aaa', marginBottom: r.status === 'pending' ? 10 : 0 }}>
                    {r.hazard_type.replace('_',' ')} • {new Date(r.created_at).toLocaleDateString()}
                  </div>

                  {r.status === 'pending' && (
                    <div style={{ display:'flex', gap:8, paddingTop:10, borderTop:'1px solid #f0f0f0' }}>
                      <button onClick={e => openEdit(e, r)} style={{
                        display:'inline-flex', alignItems:'center', gap:5,
                        padding:'5px 12px', fontSize:12, fontWeight:600,
                        background:'#fff', border:'1px solid #ddd', borderRadius:6,
                        cursor:'pointer', color:'#444'
                      }}>✏️ Edit</button>
                      <button onClick={e => deleteReport(e, r.id)} style={{
                        display:'inline-flex', alignItems:'center', gap:5,
                        padding:'5px 12px', fontSize:12, fontWeight:600,
                        background:'#fff0f0', border:'1px solid #fcc', borderRadius:6,
                        cursor:'pointer', color:'#c00'
                      }}>🗑️ Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {editModal && (
        <div onClick={e => { if (e.target === e.currentTarget) setEditModal(false); }} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
          zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16
        }}>
          <div style={{
            background:'#fff', borderRadius:14, padding:28, width:'100%', maxWidth:480,
            boxShadow:'0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginBottom:6, fontSize:16 }}>✏️ Edit Report</h3>
            <p style={{ fontSize:12, color:'#888', marginBottom:18 }}>
              You can only edit reports that haven't been reviewed yet.
            </p>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={editTitle}
                onChange={e => setEditTitle(e.target.value)} placeholder="Report title"/>
            </div>
            <div className="form-group" style={{ marginTop:12 }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                placeholder="Description..." style={{ resize:'vertical' }}/>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              <button onClick={() => setEditModal(false)} style={{
                padding:'8px 18px', borderRadius:7, border:'1px solid #ddd',
                background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600
              }}>Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : '✓ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}