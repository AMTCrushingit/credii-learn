import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';

const PILLAR_ICONS = ['🏖️','🚀','💼','🌱','🏛️','🔗','🌍'];

export default function CoursePage() {
  const { profile } = useAuth();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const [c, e, m] = await Promise.all([
      supabase.from('credii_courses').select('*').eq('id', courseId).single(),
      supabase.from('credii_enrollments').select('*').eq('learner_id', profile.id).eq('course_id', courseId).single(),
      supabase.from('credii_modules').select('*').eq('course_id', courseId).order('order_num')
    ]);
    setCourse(c.data);
    setEnrollment(e.data);
    setModules(m.data?.length ? m.data : [
      {id:'m1',title:'Introduction & Overview',duration_mins:20,type:'video',completed:false,order_num:1},
      {id:'m2',title:'Core Concepts & Frameworks',duration_mins:35,type:'reading',completed:false,order_num:2},
      {id:'m3',title:'Caribbean Context & Case Studies',duration_mins:30,type:'video',completed:false,order_num:3},
      {id:'m4',title:'Practical Application',duration_mins:45,type:'activity',completed:false,order_num:4},
      {id:'m5',title:'Assessment & Certification',duration_mins:25,type:'quiz',completed:false,order_num:5},
    ]);
    setLoading(false);
  }, [profile, courseId]);

  useEffect(() => { load(); }, [load]);

  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }
  const typeIcon = t => ({video:'🎥',reading:'📖',activity:'✏️',quiz:'🧠'}[t]||'📄');

  async function markComplete(moduleId) {
    const updated = modules.map(m=>m.id===moduleId?{...m,completed:true}:m);
    setModules(updated);
    const progress = Math.round(updated.filter(m=>m.completed).length/updated.length*100);
    if (enrollment) {
      await supabase.from('credii_enrollments').update({progress}).eq('id',enrollment.id);
      setEnrollment(e=>({...e,progress}));
    }
    if (progress===100) await issueCredential();
    else showToast('Module completed! Keep going 🚀');
  }

  async function issueCredential() {
    setCompleting(true);
    const credentialId = `CREDII-TT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2,8).toUpperCase()}`;
    const { error } = await supabase.from('credii_credentials').insert({ learner_id:profile.id, course_id:courseId, credential_id:credentialId, issued_at:new Date().toISOString(), status:'issued' });
    if (!error) { showToast('🏆 Congratulations! Credential issued and being anchored to blockchain!'); setTimeout(()=>navigate('/learn/credentials'),2000); }
    setCompleting(false);
  }

  if (loading) return <div style={{color:'#9ca3af',padding:40}}>Loading course...</div>;
  if (!course) return <div style={{color:'#C0392B',padding:40}}>Course not found.</div>;

  const progress = enrollment?.progress||0;

  return (
    <div>
      {toast && <div className={`cf-toast cf-toast-${toast.type}`}>{toast.msg}</div>}
      <button className="cf-btn cf-btn-secondary cf-btn-sm" style={{marginBottom:20}} onClick={()=>navigate('/learn/courses')}>← Back to Library</button>

      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:24,alignItems:'start'}}>
        <div>
          <div style={{background:'linear-gradient(135deg,#1a2744,#C0392B)',borderRadius:16,padding:28,color:'#fff',marginBottom:20}}>
            <div style={{display:'flex',gap:10,marginBottom:12,flexWrap:'wrap'}}>
              <span className="cf-badge" style={{background:'rgba(255,255,255,0.15)',color:'#fff',fontSize:11}}>Pillar {course.pillar}</span>
              <span className="cf-badge" style={{background:'rgba(255,255,255,0.15)',color:'#fff',fontSize:11}}>{course.level||'Beginner'}</span>
              {course.sdg_tags?.map(s=><span key={s} className="cf-sdg-tag">{s}</span>)}
            </div>
            <div style={{fontSize:36,marginBottom:8}}>{PILLAR_ICONS[(course.pillar||1)-1]}</div>
            <h1 style={{fontSize:22,fontWeight:800,marginBottom:8}}>{course.title}</h1>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.75)',lineHeight:1.6,marginBottom:16}}>{course.description}</p>
            <div style={{display:'flex',gap:20,fontSize:13,color:'rgba(255,255,255,0.7)'}}>
              <span>⏱ {course.duration_hours||2} hours</span>
              <span>📚 {modules.length} modules</span>
              <span>🏆 Blockchain certificate</span>
            </div>
          </div>

          <div className="cf-card">
            <div className="cf-card-header">
              <span className="cf-card-title">{typeIcon(modules[activeModule]?.type)} {modules[activeModule]?.title}</span>
              <span className="cf-badge cf-badge-gray">{modules[activeModule]?.duration_mins} min</span>
            </div>
            <div className="cf-card-body">
              <div style={{background:'#f8f9fa',borderRadius:12,padding:24,minHeight:280,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',marginBottom:20}}>
                <div style={{fontSize:48,marginBottom:16}}>{typeIcon(modules[activeModule]?.type)}</div>
                <div style={{fontSize:18,fontWeight:700,color:'#1a2744',marginBottom:8}}>{modules[activeModule]?.title}</div>
                <div style={{fontSize:14,color:'#6b7280',maxWidth:400,lineHeight:1.6,marginBottom:20}}>This module covers key concepts related to {course.title} within the Caribbean context.</div>
                <div style={{background:'#e8edf5',borderRadius:8,padding:12,fontSize:12,color:'#1a2744',maxWidth:400}}>📌 <strong>Caribbean Context:</strong> All content is grounded in Caribbean identity, regional standards, and aligned with SDG frameworks relevant to Trinidad & Tobago and the wider Caribbean.</div>
              </div>
              {!modules[activeModule]?.completed
                ? <button className="cf-btn cf-btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={()=>markComplete(modules[activeModule].id)} disabled={completing}>
                    {completing?'Processing...':modules[activeModule]?.type==='quiz'?'🧠 Submit Assessment':'✅ Mark as Complete'}
                  </button>
                : <div style={{background:'#d1fae5',borderRadius:10,padding:14,textAlign:'center',color:'#065f46',fontWeight:600}}>
                    ✅ Module Completed!
                    {activeModule<modules.length-1 && <button className="cf-btn cf-btn-teal cf-btn-sm" style={{marginLeft:12}} onClick={()=>setActiveModule(i=>i+1)}>Next Module →</button>}
                  </div>
              }
            </div>
          </div>
        </div>

        <div>
          <div className="cf-card" style={{marginBottom:16}}>
            <div className="cf-card-header"><span className="cf-card-title">Your Progress</span></div>
            <div className="cf-card-body">
              <div style={{textAlign:'center',marginBottom:16}}>
                <div style={{fontSize:36,fontWeight:800,color:'#C0392B'}}>{progress}%</div>
                <div style={{fontSize:13,color:'#6b7280'}}>Complete</div>
              </div>
              <div className="cf-progress" style={{height:10,marginBottom:12}}><div className="cf-progress-fill" style={{width:progress+'%'}}/></div>
              <div style={{fontSize:12,color:'#6b7280',textAlign:'center'}}>{modules.filter(m=>m.completed).length} of {modules.length} modules completed</div>
              {progress===100 && <div style={{background:'linear-gradient(135deg,#1a2744,#C0392B)',borderRadius:10,padding:14,color:'#fff',textAlign:'center',marginTop:12}}><div style={{fontSize:24,marginBottom:4}}>🏆</div><div style={{fontWeight:700,fontSize:13}}>Credential Issued!</div></div>}
            </div>
          </div>

          <div className="cf-card">
            <div className="cf-card-header"><span className="cf-card-title">Course Modules</span></div>
            {modules.map((m,i)=>(
              <div key={m.id} style={{padding:'12px 16px',borderBottom:'1px solid #f3f4f6',cursor:'pointer',background:activeModule===i?'#fde8e8':'transparent',display:'flex',alignItems:'center',gap:10}} onClick={()=>setActiveModule(i)}>
                <div style={{width:28,height:28,borderRadius:'50%',flexShrink:0,background:m.completed?'#d1fae5':activeModule===i?'#C0392B':'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:m.completed?'#065f46':activeModule===i?'#fff':'#9ca3af',fontWeight:700}}>
                  {m.completed?'✓':i+1}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:activeModule===i?'#C0392B':'#1a2744'}}>{m.title}</div>
                  <div style={{fontSize:11,color:'#9ca3af'}}>{typeIcon(m.type)} {m.duration_mins} min</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}