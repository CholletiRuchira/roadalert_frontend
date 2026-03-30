import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const SEV_COLORS    = { low:'#4caf50', medium:'#ff9800', high:'#ff5722', critical:'#f44336' };
const STATUS_COLORS = { pending:'#ff9800', under_review:'#2196f3', in_progress:'#ff5722', resolved:'#4caf50', rejected:'#f44336' };

export default function AuthorityDashboard() {
  const [stats,    setStats]    = useState(null);
  const [reports,  setReports]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('overview');
  const [search,   setSearch]   = useState('');
  const [statusF,  setStatusF]  = useState('');
  const [updating, setUpdating] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([
        axios.get('/api/reports/stats'),
        axios.get('/api/reports'),
      ]);
      setStats(s.data);
      setReports(r.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const loadFiltered = useCallback(async () => {
    const params = {};
    if (search)  params.search = search;
    if (statusF) params.status = statusF;
    const { data } = await axios.get('/api/reports', { params });
    setReports(data);
  }, [search, statusF]);

  useEffect(() => { if (tab === 'reports') loadFiltered(); }, [search, statusF, tab, loadFiltered]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await axios.patch(`/api/reports/${id}/status`, { status });
      toast.success('Status updated');
      loadData();
    } catch { toast.error('Failed'); }
    finally { setUpdating(null); }
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try { await axios.delete(`/api/reports/${id}`); toast.success('Deleted'); loadData(); }
    catch { toast.error('Delete failed'); }
  };

  if (loading && !stats) return <p style={{ textAlign:'center', padding:60, color:'#888' }}>Loading...</p>;

  return (
    <div className="page-container">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ marginBottom:2 }}>Authority Dashboard</h2>
          <p style={{ color:'#666', fontSize:14 }}>Manage and resolve road hazard reports</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={loadData}>↺ Refresh</button>
      </div>

      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:12, marginBottom:20 }}>
          {[
            { label:'Total',       value:stats.total,       color:'#1565c0' },
            { label:'Pending',     value:stats.pending,     color:'#e65100' },
            { label:'In Progress', value:stats.in_progress, color:'#e85d04' },
            { label:'Resolved',    value:stats.resolved,    color:'#2e7d32' },
            { label:'Critical',    value:stats.critical,    color:'#b71c1c' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign:'center', padding:'14px 10px' }}>
              <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:'#666', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:4, marginBottom:20 }}>
        {['overview','reports'].map(t => (
          <button key={t} onClick={() => setTab(t)} className="btn"
            style={{
              background: tab===t ? '#e85d04' : '#fff',
              color: tab===t ? '#fff' : '#555',
              border: '1px solid #ddd',
              textTransform:'capitalize'
            }}>
            {t === 'overview' ? '📊 Overview' : '📋 All Reports'}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
          <div className="card">
            <h4 style={{ marginBottom:14, color:'#555' }}>Reports by Severity</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.by_severity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="severity" tick={{ fontSize:12 }}/>
                <YAxis tick={{ fontSize:12 }}/>
                <Tooltip/>
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {stats.by_severity.map((e,i) => <Cell key={i} fill={SEV_COLORS[e.severity] || '#888'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h4 style={{ marginBottom:14, color:'#555' }}>Reports by Status</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.by_status} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} innerRadius={35}>
                  {stats.by_status.map((e,i) => <Cell key={i} fill={STATUS_COLORS[e.status] || '#888'}/>)}
                </Pie>
                <Tooltip formatter={(v,n,p) => [v, p.payload.status.replace('_',' ')]}/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h4 style={{ marginBottom:14, color:'#555' }}>Hazard Types</h4>
            {stats.by_hazard.slice(0,6).map((h,i) => {
              const pct = stats.total ? Math.round((h.count/stats.total)*100) : 0;
              return (
                <div key={i} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:3 }}>
                    <span style={{ textTransform:'capitalize' }}>{h.hazard_type.replace('_',' ')}</span>
                    <span style={{ color:'#888' }}>{h.count} ({pct}%)</span>
                  </div>
                  <div style={{ height:8, background:'#eee', borderRadius:4 }}>
                    <div style={{ height:'100%', borderRadius:4, background:'#e85d04', width:pct+'%' }}/>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card">
            <h4 style={{ marginBottom:14, color:'#555' }}>Recent Reports</h4>
            {stats.recent.map(r => (
              <Link key={r.id} to={`/reports/${r.id}`}
                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #f0f0f0' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{r.title}</div>
                  <div style={{ fontSize:11, color:'#888' }}>{r.location_text}</div>
                </div>
                <span className={`badge badge-${r.severity}`}>{r.severity}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
            <input className="form-input" placeholder="Search..." style={{ flex:1, minWidth:180 }}
              value={search} onChange={e => setSearch(e.target.value)}/>
            <select className="form-input" style={{ width:160 }}
              value={statusF} onChange={e => setStatusF(e.target.value)}>
              <option value="">All Status</option>
              {['pending','under_review','in_progress','resolved','rejected'].map(s =>
                <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
          </div>

          <div style={{ overflowX:'auto', border:'1px solid #ddd', borderRadius:8 }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#f9f9f9', borderBottom:'2px solid #eee' }}>
                  {['Title','Location','Severity','Status','Date','Actions'].map(h => (
                    <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontWeight:700, color:'#666', fontSize:12, textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign:'center', padding:32, color:'#888' }}>No reports found</td></tr>
                ) : reports.map((r,i) => (
                  <tr key={r.id} style={{ borderBottom:'1px solid #f0f0f0', background: i%2===0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding:'10px 12px' }}>
                      <Link to={`/reports/${r.id}`} style={{ fontWeight:600, color:'#222' }}>{r.title}</Link>
                      <div style={{ fontSize:11, color:'#aaa' }}>{r.reporter_name}</div>
                    </td>
                    <td style={{ padding:'10px 12px', color:'#666', maxWidth:150 }}>{r.location_text}</td>
                    <td style={{ padding:'10px 12px' }}><span className={`badge badge-${r.severity}`}>{r.severity}</span></td>
                    <td style={{ padding:'10px 12px' }}>
                      <select value={r.status} disabled={updating===r.id} onChange={e => updateStatus(r.id, e.target.value)}
                        style={{ padding:'4px 8px', fontSize:12, border:'1px solid #ddd', borderRadius:4, cursor:'pointer' }}>
                        {['pending','under_review','in_progress','resolved','rejected'].map(s =>
                          <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'10px 12px', color:'#888', whiteSpace:'nowrap' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td style={{ padding:'10px 12px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <Link to={`/reports/${r.id}`} className="btn btn-ghost btn-sm">View</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteReport(r.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}