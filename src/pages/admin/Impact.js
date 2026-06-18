import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}); }

const SDG_DETAILS = [
  { sdg:'SDG 4', title:'Quality Education', color:'#C0392B', icon:'📚', desc:'Ensuring inclusive and equitable quality education and promoting lifelong learning opportunities for all.' },
  { sdg:'SDG 5', title:'Gender Equality', color:'#F39C12', icon:'⚖️', desc:'Achieving gender equality and empowering all women and girls through digital credentialing.' },
  { sdg:'SDG 8', title:'Decent Work', color:'#1abc9c', icon:'💼', desc:'Promoting sustained, inclusive and sustainable economic growth, full and productive employment.' },
  { sdg:'SDG 9', title:'Innovation', color:'#3b82f6', icon:'🔗', desc:'Building resilient infrastructure, promoting inclusive and sustainable industrialization.' },
  { sdg:'SDG 10', title:'Reduced Inequalities', color:'#8b5cf6', icon:'🌍', desc:'Reducing inequality within and among countries through trusted digital access systems.' },
  { sdg:'SDG 17', title:'Partnerships', color:'#1a2744', icon:'🤝', desc:'Strengthening the means of implementation and revitalizing the global partnership for sustainable development.' },
];

export default function AdminImpact() {
  const [data, setData] = useState({ users:[], courses:[], credentials:[], enrollments:[] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [u,c,cr,e] = await Promise.all([
      supabase.from('credii_profiles').select('*'),
      supabase.from('credii_courses').select('*'),
      supabase.from('credii_credentials').select('*, credii_profiles(full_name,country,role), credii_courses(title,pillar)').order('issued_at',{ascending:false}),
      supabase.from('credii_enrollments').select('*')
    ]);
    setData({ users:u.data||[], courses:c.data||[], credentials:cr.data||[], enrollments:e.data||[] });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function exportReport() {
    const report = { generated:new Date().toISOString(), pilot:'Trinidad and Tobago', organisation:'Credii Foundation', summary:{ total_users:data.users.length, total_courses:data.courses.length, total_credentials:data.credentials.length, total_enrollments:data.enrollments.length, completion_rate:data.enrollments.length?Math.round(data.enrollments.filter(e=>e.progress===100).length/data.enrollments.length*100):0, blockchain_anchored:data.credentials.filter(c=>c.blockchain_hash).length }, sdg_alignment:['SDG 4','SDG 5','SDG 8','SDG 9','SDG 10','SDG 17'] };
    const blob = new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `credii-impact-report-${new Date().toISOString().split('T')[0]}.json`; a.click();
  }

  if (loading) return <div style={{color:'#9ca3af',padding:40}}>Loading impact data...</div>;

  const { users, courses, credentials, enrollments } = data;
  const completions = enrollments.filter(e=>e.progress===100);
  const completionRate = enrollments.length?Math.round(completions.length/enrollments.length*100):0;
  const onChain = credentials.filter(c=>c.blockchain_hash).length;
  const msmeUsers = users.filter(u=>u.role==='msme');
  const PILLAR_NAMES = ['Tourism & Cultural Heritage','Workforce Mobility','MSME Digital Capability','ESG & Sustainability','Governance & Public Sector','Digital Infrastructure','Systems Transformation'];
  const PILLAR_ICONS = ['🏖️','🚀','💼','🌱','🏛️','🔗','🌍'];
  const pillarStats = [1,2,3,4,5,6,7].map(p=>({pillar:p,count:credentials.filter(c=>c.credii_courses?.pillar===p).length}));
  const maxPillar = Math.max(...pillarStats.map(p=>p.count),1);

  return (
    <div>
      <div className="cf-page-header">
        <div><div className="cf-page-title">Impact Report</div><div className="cf-page-subtitle">Credii Foundation — Trinidad & Tobago Pilot · Generated {fmtDate(new Date().toISOString())}</div></div>
        <div style={{display:'flex',gap:10}}>
          <button className="cf-btn cf-btn-gold" onClick={exportReport}>📤 Export JSON</button>
          <button className="cf-btn cf-btn-navy" onClick={()=>window.print()}>🖨️ Print Report</button>
        </div>
      </div>

      <div style={{background:'linear-gradient(135deg,#1a2744,#C0392B)',borderRadius:16,padding:28,color:'#fff',marginBottom:24}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.1em'}}>Executive Summary</div>
        <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Credii Foundation Impact Dashboard</h2>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.75)',lineHeight:1.6,marginBottom:20,maxWidth:700}}>The Credii Foundation Trinidad & Tobago Pilot is building the Caribbean's first blockchain-verified digital credentialing infrastructure, aligned with 6 UN Sustainable Development Goals and the IDPAD framework.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12}}>
          {[{val:users.length,label:'Registered Users'},{val:credentials.length,label:'Credentials Issued'},{val:onChain,label:'On Blockchain'},{val:completionRate+'%',label:'Completion Rate'},{val:msmeUsers.length,label:'MSMEs Served'},{val:courses.filter(c=>c.published).length,label:'Active Courses'}].map(s=>(
            <div key={s.label} style={{background:'rgba(255,255,255,0.08)',borderRadius:10,padding:14,textAlign:'center'}}>
              <div style={{fontSize:24,fontWeight:800,color:'#F39C12'}}>{s.val}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.6)',marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cf-card" style={{marginBottom:20}}>
        <div className="cf-card-header"><span className="cf-card-title">🌍 SDG Alignment & Contribution</span></div>
        <div className="cf-card-body">
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {SDG_DETAILS.map(s=>(
              <div key={s.sdg} style={{border:`2px solid ${s.color}20`,borderRadius:12,padding:16,borderLeft:`4px solid ${s.color}`}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                  <span style={{fontSize:20}}>{s.icon}</span>
                  <div><div style={{fontSize:11,fontWeight:700,color:s.color}}>{s.sdg}</div><div style={{fontSize:13,fontWeight:700,color:'#1a2744'}}>{s.title}</div></div>
                </div>
                <p style={{fontSize:12,color:'#6b7280',lineHeight:1.5}}>{s.desc}</p>
                <div style={{marginTop:10,background:`${s.color}15`,borderRadius:6,padding:'6px 10px',fontSize:11,fontWeight:600,color:s.color}}>✓ Actively contributing</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cf-grid-2">
        <div className="cf-card">
          <div className="cf-card-header"><span className="cf-card-title">📊 Credentials by Capability Pillar</span></div>
          <div className="cf-card-body">
            <div className="cf-chart-wrap">
              {pillarStats.map(p=>(
                <div className="cf-chart-item" key={p.pillar}>
                  <div className="cf-chart-label">{PILLAR_ICONS[p.pillar-1]} P{p.pillar} {PILLAR_NAMES[p.pillar-1].split(' ')[0]}</div>
                  <div className="cf-chart-track"><div className="cf-chart-fill" style={{width:Math.round(p.count/maxPillar*100)+'%'}}/></div>
                  <div className="cf-chart-val">{p.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="cf-card">
          <div className="cf-card-header"><span className="cf-card-title">👥 Beneficiary Demographics</span></div>
          <div className="cf-card-body">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              {[{label:'Learners',val:users.filter(u=>u.role==='learner').length,icon:'🎓',color:'#1a2744'},{label:'MSMEs',val:msmeUsers.length,icon:'💼',color:'#F39C12'},{label:'Instructors',val:users.filter(u=>u.role==='instructor').length,icon:'👨‍🏫',color:'#1abc9c'},{label:'Admins',val:users.filter(u=>u.role==='admin').length,icon:'⚙️',color:'#C0392B'}].map(s=>(
                <div key={s.label} style={{background:'#f8f9fa',borderRadius:10,padding:14,textAlign:'center'}}>
                  <div style={{fontSize:24,marginBottom:4}}>{s.icon}</div>
                  <div style={{fontSize:20,fontWeight:800,color:s.color}}>{s.val}</div>
                  <div style={{fontSize:11,color:'#6b7280'}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{background:'#1a2744',borderRadius:14,padding:24,color:'#fff'}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>Grant Reporting Metrics</div>
        <div style={{fontSize:18,fontWeight:800,marginBottom:16}}>Key Performance Indicators — Funder Dashboard</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[{kpi:'Credentials Issued',target:500,actual:credentials.length},{kpi:'Learners Reached',target:300,actual:users.length},{kpi:'MSMEs Profiled',target:100,actual:msmeUsers.length},{kpi:'Completion Rate',target:70,actual:completionRate,pct:true}].map(k=>{
            const pct = Math.min(Math.round(k.actual/k.target*100),100);
            return (
              <div key={k.kpi} style={{background:'rgba(255,255,255,0.06)',borderRadius:10,padding:14}}>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',marginBottom:4}}>{k.kpi}</div>
                <div style={{fontSize:20,fontWeight:800,color:'#F39C12'}}>{k.actual}{k.pct?'%':''}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginBottom:6}}>Target: {k.target}{k.pct?'%':''}</div>
                <div style={{height:4,background:'rgba(255,255,255,0.1)',borderRadius:2}}><div style={{height:'100%',width:pct+'%',background:'#F39C12',borderRadius:2}}/></div>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginTop:4}}>{pct}% of target</div>
              </div>
            );
          })}
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="cf-btn cf-btn-gold" onClick={exportReport}>📤 Export for Funders</button>
          <button className="cf-btn" style={{background:'rgba(255,255,255,0.1)',color:'#fff'}} onClick={()=>window.print()}>🖨️ Print Report</button>
        </div>
      </div>
    </div>
  );
}