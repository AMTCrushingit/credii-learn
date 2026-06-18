import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); }

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ users:[], courses:[], credentials:[], enrollments:[] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [u,c,cr,e] = await Promise.all([
      supabase.from('credii_profiles').select('*'),
      supabase.from('credii_courses').select('*'),
      supabase.from('credii_credentials').select('*, credii_profiles(full_name), credii_courses(title,pillar)').order('issued_at',{ascending:false}),
      supabase.from('credii_enrollments').select('*')
    ]);
    setData({ users:u.data||[], courses:c.data||[], credentials:cr.data||[], enrollments:e.data||[] });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{color:'#9ca3af',padding:40}}>Loading admin dashboard...</div>;

  const { users, courses, credentials, enrollments } = data;
  const published = courses.filter(c=>c.published);
  const onChain = credentials.filter(c=>c.blockchain_hash);
  const completions = enrollments.filter(e=>e.progress===100);
  const PILLAR_NAMES = ['Tourism','Workforce','MSME','ESG','Governance','Digital Infra','Systems'];
  const pillarStats = [1,2,3,4,5,6,7].map(p=>({ pillar:p, name:PILLAR_NAMES[p-1], count:credentials.filter(c=>c.credii_courses?.pillar===p).length }));
  const maxPillar = Math.max(...pillarStats.map(p=>p.count),1);

  return (
    <div>
      <div className="cf-page-header">
        <div><div className="cf-page-title">Admin Dashboard</div><div className="cf-page-subtitle">Credii Foundation — Trinidad & Tobago Pilot Overview</div></div>
        <div style={{display:'flex',gap:10}}>
          <button className="cf-btn cf-btn-primary" onClick={()=>navigate('/admin/courses')}>+ Add Course</button>
          <button className="cf-btn cf-btn-navy" onClick={()=>navigate('/admin/impact')}>📊 Impact Report</button>
        </div>
      </div>

      <div className="cf-stats-grid">
        {[{icon:'navy',emoji:'👥',val:users.length,label:'Registered Users',sub:`${users.filter(u=>u.role==='learner').length} learners`},
          {icon:'red',emoji:'📚',val:published.length,label:'Published Courses',sub:`${courses.length-published.length} drafts`},
          {icon:'gold',emoji:'🏆',val:credentials.length,label:'Credentials Issued',sub:`${onChain.length} on-chain`},
          {icon:'teal',emoji:'✅',val:completions.length,label:'Course Completions',sub:`${enrollments.length} total enrollments`}
        ].map(s=>(
          <div key={s.label} className="cf-stat-card">
            <div className={`cf-stat-icon ${s.icon}`}>{s.emoji}</div>
            <div><div className="cf-stat-value">{s.val}</div><div className="cf-stat-label">{s.label}</div><div className="cf-stat-change">{s.sub}</div></div>
          </div>
        ))}
      </div>

      <div className="cf-grid-2">
        <div className="cf-card">
          <div className="cf-card-header"><span className="cf-card-title">🏆 Recent Credentials</span><button className="cf-btn cf-btn-sm cf-btn-secondary" onClick={()=>navigate('/admin/credentials')}>View All</button></div>
          {credentials.length===0
            ? <div className="cf-empty"><div className="cf-empty-icon">🏆</div><p>No credentials issued yet</p></div>
            : <div className="cf-table-wrap"><table><thead><tr><th>Learner</th><th>Course</th><th>Issued</th><th>Status</th></tr></thead><tbody>
                {credentials.slice(0,6).map(c=>(
                  <tr key={c.id}>
                    <td className="cf-fw-700" style={{fontSize:13}}>{c.credii_profiles?.full_name||'—'}</td>
                    <td style={{fontSize:12,color:'#6b7280'}}>{c.credii_courses?.title?.slice(0,25)}...</td>
                    <td className="cf-text-muted">{fmtDate(c.issued_at)}</td>
                    <td><span className={`cf-badge ${c.blockchain_hash?'cf-badge-teal':'cf-badge-gold'}`}>{c.blockchain_hash?'On-chain':'Pending'}</span></td>
                  </tr>
                ))}
              </tbody></table></div>
          }
        </div>

        <div className="cf-card">
          <div className="cf-card-header"><span className="cf-card-title">📊 Credentials by Pillar</span></div>
          <div className="cf-card-body">
            <div className="cf-chart-wrap">
              {pillarStats.map(p=>(
                <div className="cf-chart-item" key={p.pillar}>
                  <div className="cf-chart-label">P{p.pillar} {p.name}</div>
                  <div className="cf-chart-track"><div className="cf-chart-fill" style={{width:Math.round(p.count/maxPillar*100)+'%'}}/></div>
                  <div className="cf-chart-val">{p.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{background:'#1a2744',borderRadius:14,padding:24,color:'#fff'}}>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.1em'}}>SDG Impact Summary — T&T Pilot</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:16}}>
          {[{sdg:'SDG 4',label:'Quality Education',val:credentials.length,unit:'credentials'},{sdg:'SDG 5',label:'Gender Equality',val:users.filter(u=>u.role==='msme').length,unit:'MSMEs'},{sdg:'SDG 8',label:'Decent Work',val:completions.length,unit:'completions'},{sdg:'SDG 9',label:'Innovation',val:onChain.length,unit:'on-chain'}].map(s=>(
            <div key={s.sdg} style={{background:'rgba(255,255,255,0.06)',borderRadius:10,padding:14,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#F39C12',fontWeight:700,marginBottom:4}}>{s.sdg}</div>
              <div style={{fontSize:22,fontWeight:800,color:'#fff'}}>{s.val}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>{s.label}</div>
            </div>
          ))}
        </div>
        <button className="cf-btn cf-btn-gold" onClick={()=>navigate('/admin/impact')}>📊 View Full Impact Report →</button>
      </div>
    </div>
  );
}