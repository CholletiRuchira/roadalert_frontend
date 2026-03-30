import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="page-container">
      <div style={{ textAlign:'center', padding:'40px 0 30px' }}>
        <h1 style={{ fontSize:32, marginBottom:12 }}>
          Report Damaged Roads, <span style={{ color:'#e85d04' }}>Save Lives</span>
        </h1>
        <p style={{ color:'#666', fontSize:16, marginBottom:24 }}>
          Snap a photo, mark the location, rate the severity. Authorities get notified instantly.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ fontSize:15, padding:'10px 24px' }}>
            Report a Hazard
          </Link>
          <Link to="/login" className="btn btn-ghost" style={{ fontSize:15, padding:'10px 24px' }}>
            Authority Login
          </Link>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginTop:20 }}>
        {[
          { icon:'📸', title:'Photo Evidence',      desc:'Upload photos as visual proof of road damage.' },
          { icon:'⚠️', title:'Severity Rating',     desc:'Rate from Low to Critical so repairs are prioritized.' },
          { icon:'📊', title:'Authority Dashboard', desc:'Real-time data and tools for government officials.' },
          { icon:'✅', title:'Track Progress',      desc:'Follow your report from Pending to Resolved.' },
        ].map((f,i) => (
          <div key={i} className="card">
            <div style={{ fontSize:28, marginBottom:8 }}>{f.icon}</div>
            <h3 style={{ fontSize:16, marginBottom:6 }}>{f.title}</h3>
            <p style={{ fontSize:13, color:'#666', lineHeight:1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}