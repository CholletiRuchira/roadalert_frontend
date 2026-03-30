import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STATUS_OPTIONS = ['pending','under_review','in_progress','resolved','rejected'];

export default function ReportDetail() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report,      setReport]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [updating,    setUpdating]    = useState(false);
  const [newStatus,   setNewStatus]   = useState('');
  const [actionNotes, setActionNotes] = useState('');

  useEffect(() => {
    axios.get('/api/reports/' + id)
      .then(r => { setReport(r.data); setNewStatus(r.data.status); setLoading(false); })
      .catch(() => { toast.error('Report not found'); navigate(-1); });
  }, [id, navigate]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await axios.patch('/api/reports/' + id + '/status', { status:newStatus, action_notes:actionNotes });
      toast.success('Report updated!');
      const r = await axios.get('/api/reports/' + id);
      setReport(r.data);
      setActionNotes('');
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  if (loading) return <p style={{ textAlign:'center', padding:60, color:'#888' }}>Loading...</p>;

  return (
    <div className="page-container" style={{ maxWidth:800 }}>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom:16 }} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div style={{ marginBottom:16 }}>
        <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
          <span className={`badge badge-${report.severity}`}>{report.severity}</span>
          <span className={`badge badge-${report.status}`}>{report.status.replace('_',' ')}</span>
          <span style={{ fontSize:12, color:'#888' }}>{report.hazard_type.replace('_',' ')}</span>
        </div>
        <h2>{report.title}</h2>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {report.image_url && (
            <img src={`${API}${report.image_url}`} alt="Hazard"
              style={{ width:'100%', maxHeight:280, objectFit:'cover', borderRadius:8 }}/>
          )}

          <div className="card">
            <h4 style={{ marginBottom:12, color:'#555' }}>Report Info</h4>
            {[
              { label:'Location',    val: report.location_text },
              { label:'Reported by', val: report.reporter_name || 'Anonymous' },
              { label:'Submitted',   val: new Date(report.created_at).toLocaleString() },
              ...(report.latitude ? [{ label:'GPS', val: report.latitude + ', ' + report.longitude }] : []),
            ].map((item,i) => (
              <div key={i} style={{ marginBottom:10 }}>
                <div style={{ fontSize:11, color:'#aaa', textTransform:'uppercase', marginBottom:2 }}>{item.label}</div>
                <div style={{ fontSize:14 }}>{item.val}</div>
              </div>
            ))}
          </div>

          {report.description && (
            <div className="card">
              <h4 style={{ marginBottom:8, color:'#555' }}>Description</h4>
              <p style={{ fontSize:14, color:'#555', lineHeight:1.6 }}>{report.description}</p>
            </div>
          )}

          {report.action_notes && (
            <div className="card" style={{ borderColor:'#90caf9', background:'#e3f2fd' }}>
              <h4 style={{ marginBottom:8, color:'#1565c0' }}>Authority Notes</h4>
              <p style={{ fontSize:14, color:'#1565c0' }}>{report.action_notes}</p>
            </div>
          )}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {user.role === 'authority' && (
            <div className="card" style={{ borderColor:'#ffcc80' }}>
              <h4 style={{ marginBottom:12, color:'#e65100' }}>Update Status</h4>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
                {STATUS_OPTIONS.map(s => (
                  <label key={s} style={{
                    display:'flex', alignItems:'center', gap:6, padding:'6px 12px',
                    border:`2px solid ${newStatus===s ? '#e85d04' : '#ddd'}`,
                    borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:600,
                    background: newStatus===s ? '#fff5f0' : '#fff',
                    textTransform:'capitalize'
                  }}>
                    <input type="radio" name="new_status" value={s}
                      checked={newStatus===s} onChange={() => setNewStatus(s)}
                      style={{ accentColor:'#e85d04' }}/>
                    {s.replace('_',' ')}
                  </label>
                ))}
              </div>
              <div className="form-group" style={{ marginBottom:12 }}>
                <label className="form-label">Action Notes</label>
                <textarea className="form-input" rows={3} placeholder="Describe the action taken..."
                  value={actionNotes} onChange={e => setActionNotes(e.target.value)}
                  style={{ resize:'vertical' }}/>
              </div>
              <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}
                onClick={handleUpdate} disabled={updating}>
                {updating ? 'Updating...' : 'Update Report'}
              </button>
            </div>
          )}

          {report.activity?.length > 0 && (
            <div className="card">
              <h4 style={{ marginBottom:14, color:'#555' }}>Activity Log</h4>
              {report.activity.map((log,i) => (
                <div key={log.id} style={{ display:'flex', gap:10, marginBottom:14, paddingBottom:14, borderBottom: i < report.activity.length-1 ? '1px solid #f0f0f0' : 'none' }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#e85d04', flexShrink:0, marginTop:4 }}/>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, textTransform:'capitalize' }}>{log.action.replace('_',' ')}</div>
                    <div style={{ fontSize:12, color:'#888' }}>by {log.actor_name}</div>
                    {log.notes && <div style={{ fontSize:12, color:'#aaa', marginTop:2, fontStyle:'italic' }}>{log.notes}</div>}
                    <div style={{ fontSize:11, color:'#bbb', marginTop:2 }}>{new Date(log.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}