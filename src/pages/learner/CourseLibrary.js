import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const PILLAR_ICONS = ['🏖️','🚀','💼','🌱','🏛️','🔗','🌍'];
const PILLAR_NAMES = ['Tourism & Cultural Heritage','Workforce Mobility','MSME Digital Capability','ESG & Sustainability','Governance & Public Sector','Digital Infrastructure','Systems Transformation'];

export default function CourseLibrary() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ search:'', pillar:'', level:'' });
  const [enrolling, setEnrolling] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const [c, e] = await Promise.all([
      supabase.from('credii_courses').select('*').eq('published', true).order('created_at',{ascending:false}),
      supabase.from('credii_enrollments').select('course_id, progress').eq('learner_id', profile.id)
    ]);
    setCourses(c.data||[]);
    setEnrollments(e.data||[]);
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  function showToast(msg, type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }

  async function enroll(courseId) {
    setEnrolling(courseId);
    const already = enrollments.find(e=>e.course_id===courseId);
    if (already) { navigate(`/learn/courses/${courseId}`); setEnrolling(null); return; }
    const { error } = await supabase.from('credii_enrollments').insert({ learner_id:profile.id, course_id:courseId, progress:0, enrolled_at:new Date().toISOString() });
    if (error) showToast(error.message,'error');
    else { showToast('Enrolled successfully!'); load(); navigate(`/learn/courses/${courseId}`); }
    setEnrolling(null);
  }

  const filtered = courses.filter(c => {
    const q = filter.search.toLowerCase();
    return (!q || c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
      && (!filter.pillar || c.pillar===Number(filter.pillar))
      && (!filter.level || c.level===filter.level);
  });

  const isEnrolled = id => enrollments.some(e=>e.course_id===id);
  const getProgress = id => enrollments.find(e=>e.course_id===id)?.progress||0;

  return (
    <div>
      {toast && <div className={`cf-toast cf-toast-${toast.type}`}>{toast.msg}</div>}
      <div className="cf-page-header">
        <div><div className="cf-page-title">Course Library</div><div className="cf-page-subtitle">Explore microcredentials across all 7 Caribbean capability pillars</div></div>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        <button className={`cf-btn cf-btn-sm ${!filter.pillar?'cf-btn-navy':'cf-btn-secondary'}`} onClick={()=>setFilter(f=>({...f,pillar:''}))}>All Pillars</button>
        {PILLAR_NAMES.map((name,i)=>(
          <button key={i} className={`cf-btn cf-btn-sm ${filter.pillar===String(i+1)?'cf-btn-primary':'cf-btn-secondary'}`} onClick={()=>setFilter(f=>({...f,pillar:String(i+1)}))}>
            {PILLAR_ICONS[i]} {name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="cf-filters">
        <input className="cf-filter-input" placeholder="🔍 Search courses..." style={{width:240}} value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))}/>
        <select className="cf-filter-input" value={filter.level} onChange={e=>setFilter(f=>({...f,level:e.target.value}))}>
          <option value="">All Levels</option>
          <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
        </select>
        <span style={{fontSize:13,color:'#9ca3af',marginLeft:'auto'}}>{filtered.length} courses found</span>
      </div>

      {loading
        ? <div style={{color:'#9ca3af',padding:40,textAlign:'center'}}>Loading courses...</div>
        : filtered.length===0
          ? <div className="cf-empty"><div className="cf-empty-icon">📚</div><p>No courses found</p></div>
          : <div className="cf-course-grid">
              {filtered.map(c=>{
                const enrolled = isEnrolled(c.id);
                const progress = getProgress(c.id);
                return (
                  <div key={c.id} className="cf-course-card">
                    <div className="cf-course-card-img">{PILLAR_ICONS[(c.pillar||1)-1]}</div>
                    <div className="cf-course-card-body">
                      <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>
                        <span className="cf-badge cf-badge-navy" style={{fontSize:10}}>Pillar {c.pillar}</span>
                        <span className="cf-badge cf-badge-gray" style={{fontSize:10}}>{c.level||'Beginner'}</span>
                        {c.sdg_tags?.map(s=><span key={s} className="cf-sdg-tag">{s}</span>)}
                      </div>
                      <div className="cf-course-card-title">{c.title}</div>
                      <div className="cf-course-card-desc">{c.description?.slice(0,100)}...</div>
                      {enrolled && <div style={{marginTop:8}}>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#6b7280',marginBottom:4}}><span>Progress</span><span style={{fontWeight:700,color:'#C0392B'}}>{progress}%</span></div>
                        <div className="cf-progress"><div className="cf-progress-fill" style={{width:progress+'%'}}/></div>
                      </div>}
                    </div>
                    <div className="cf-course-card-footer">
                      <div><div style={{fontSize:12,color:'#6b7280'}}>⏱ {c.duration_hours||2}h</div><div style={{fontSize:11,color:'#9ca3af'}}>🏆 Blockchain cert</div></div>
                      <button className={`cf-btn cf-btn-sm ${enrolled?'cf-btn-teal':'cf-btn-primary'}`} onClick={()=>enroll(c.id)} disabled={enrolling===c.id}>
                        {enrolling===c.id?'...':enrolled?'▶ Continue':'+ Enroll'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
      }
    </div>
  );
}