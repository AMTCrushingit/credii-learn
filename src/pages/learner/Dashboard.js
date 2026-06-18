import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const PILLAR_ICONS = ['🏖️','🚀','💼','🌱','🏛️','🔗','🌍'];
const PILLAR_NAMES = ['Tourism & Cultural Heritage','Workforce Mobility','MSME Digital Capability','ESG & Sustainability','Governance & Public Sector','Digital Infrastructure','Systems Transformation'];
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); }

export default function LearnerDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ enrollments:[], credentials:[], courses:[] });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const [en, cr, co] = await Promise.all([
      supabase.from('credii_enrollments').select('*, credii_courses(*)').eq('learner_id', profile.id),
      supabase.from('credii_credentials').select('*, credii_courses(title,pillar)').eq('learner_id', profile.id),
      supabase.from('credii_courses').select('*').eq('published', true).limit(3)
    ]);
    setData({ enrollments:en.data||[], credentials:cr.data||[], courses:co.data||[] });
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{color:'#9ca3af',padding:40}}>Loading your dashboard...</div>;
  const { enrollments, credentials, courses } = data;
  const inProgress = enrollments.filter(e=>e.progress<100);
  const completed = enrollments.filter(e=>e.progress===100);

  return (
    <div>
      <div style={{background:'linear-gradient(135deg,#1a2744,#C0392B)',borderRadius:16,padding:28,color:'#fff',marginBottom:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-20,right:-20,width:100,height:100,borderRadius:'50%',background:'rgba(255,255,255,0.05)'}}/>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.6)',marginBottom:6}}>🇹🇹 Trinidad & Tobago Pilot</div>
        <h1 style={{fontSize:24,fontWeight:800,marginBottom:6}}>Welcome back, {profile?.full_name?.split(' ')[0]}! 👋</h1>
        <p style={{fontSize:14,color:'rgba(255,255,255,0.75)',marginBottom:16}}>Continue building your Caribbean digital credential portfolio.</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="cf-btn cf-btn-gold" onClick={()=>navigate('/learn/courses')}>📚 Browse Courses</button>
          <button className="cf-btn" style={{background:'rgba(255,255,255,0.15)',color:'#fff',border:'2px solid rgba(255,255,255,0.3)'}} onClick={()=>navigate('/learn/credentials')}>🏆 My Credentials</button>
        </div>
      </div>

      <div className="cf-stats-grid">
        {[
          {icon:'navy',emoji:'📚',val:enrollments.length,label:'Enrolled Courses',sub:`${inProgress.length} in progress`},
          {icon:'green',emoji:'✅',val:completed.length,label:'Completed',sub:`${Math.round(completed.length/Math.max(enrollments.length,1)*100)}% completion rate`},
          {icon:'gold',emoji:'🏆',val:credentials.length,label:'Credentials Earned',sub:'Blockchain verified'},
          {icon:'teal',emoji:'🔗',val:credentials.filter(c=>c.blockchain_hash).length,label:'On-Chain Certs',sub:'Polygon network'},
        ].map(s=>(
          <div key={s.label} className="cf-stat-card">
            <div className={`cf-stat-icon ${s.icon}`}>{s.emoji}</div>
            <div><div className="cf-stat-value">{s.val}</div><div className="cf-stat-label">{s.label}</div><div className="cf-stat-change">{s.sub}</div></div>
          </div>
        ))}
      </div>

      <div className="cf-grid-2">
        <div className="cf-card">
          <div className="cf-card-header"><span className="cf-card-title">📚 In Progress</span><button className="cf-btn cf-btn-sm cf-btn-secondary" onClick={()=>navigate('/learn/courses')}>Browse More</button></div>
          {inProgress.length===0
            ? <div className="cf-empty"><div className="cf-empty-icon">📚</div><p>No courses in progress</p><button className="cf-btn cf-btn-primary" onClick={()=>navigate('/learn/courses')}>Start Learning</button></div>
            : inProgress.map(e=>(
              <div key={e.id} style={{padding:'14px 20px',borderBottom:'1px solid #f3f4f6',cursor:'pointer'}} onClick={()=>navigate(`/learn/courses/${e.course_id}`)}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <div style={{fontWeight:700,fontSize:13,color:'#1a2744'}}>{e.credii_courses?.title}</div>
                  <span style={{fontSize:12,fontWeight:700,color:'#C0392B'}}>{e.progress||0}%</span>
                </div>
                <div className="cf-progress"><div className="cf-progress-fill" style={{width:(e.progress||0)+'%'}}/></div>
                <div style={{fontSize:11,color:'#9ca3af',marginTop:4}}>Pillar {e.credii_courses?.pillar} · {PILLAR_NAMES[(e.credii_courses?.pillar||1)-1]}</div>
              </div>
            ))
          }
        </div>

        <div className="cf-card">
          <div className="cf-card-header"><span className="cf-card-title">🏆 Recent Credentials</span><button className="cf-btn cf-btn-sm cf-btn-secondary" onClick={()=>navigate('/learn/credentials')}>View All</button></div>
          {credentials.length===0
            ? <div className="cf-empty"><div className="cf-empty-icon">🏆</div><p>No credentials yet</p><p style={{fontSize:13}}>Complete a course to earn your first blockchain credential</p></div>
            : credentials.slice(0,4).map(c=>(
              <div key={c.id} style={{padding:'14px 20px',borderBottom:'1px solid #f3f4f6',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:40,height:40,background:'linear-gradient(135deg,#1a2744,#C0392B)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🏆</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,color:'#1a2744'}}>{c.credii_courses?.title}</div>
                  <div style={{fontSize:11,color:'#9ca3af'}}>Issued {fmtDate(c.issued_at)} · {c.blockchain_hash?'🔗 On-chain':'⏳ Pending'}</div>
                </div>
                <button className="cf-btn cf-btn-sm cf-btn-secondary" onClick={()=>window.open(`/verify/${c.credential_id}`)}>Verify</button>
              </div>
            ))
          }
        </div>
      </div>

      <div className="cf-card">
        <div className="cf-card-header"><span className="cf-card-title">✨ Recommended Courses</span><button className="cf-btn cf-btn-sm cf-btn-secondary" onClick={()=>navigate('/learn/courses')}>View All</button></div>
        {courses.length===0
          ? <div className="cf-empty"><div className="cf-empty-icon">📚</div><p>No courses available yet</p></div>
          : <div className="cf-course-grid" style={{padding:20}}>
              {courses.map(c=>(
                <div key={c.id} className="cf-course-card" onClick={()=>navigate(`/learn/courses/${c.id}`)}>
                  <div className="cf-course-card-img">{PILLAR_ICONS[(c.pillar||1)-1]}</div>
                  <div className="cf-course-card-body">
                    <div style={{marginBottom:6}}><span className="cf-badge cf-badge-navy" style={{fontSize:10}}>Pillar {c.pillar}</span></div>
                    <div className="cf-course-card-title">{c.title}</div>
                    <div className="cf-course-card-desc">{c.description?.slice(0,80)}...</div>
                  </div>
                  <div className="cf-course-card-footer">
                    <span style={{fontSize:12,color:'#6b7280'}}>⏱ {c.duration_hours||2}h · {c.level||'Beginner'}</span>
                    <button className="cf-btn cf-btn-sm cf-btn-primary">Enroll</button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      <div style={{background:'#1a2744',borderRadius:14,padding:20,color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
        <div><div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:4}}>YOUR SDG CONTRIBUTION</div><div style={{fontSize:16,fontWeight:700}}>Every credential you earn contributes to Caribbean development goals</div></div>
        <div>{['SDG 4','SDG 5','SDG 8','SDG 9','SDG 10'].map(s=><span key={s} className="cf-sdg-tag">{s}</span>)}</div>
      </div>
    </div>
  );
}