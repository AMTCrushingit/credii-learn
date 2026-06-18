import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const PILLAR_NAMES = ['Tourism & Cultural Heritage Credentials','Workforce Mobility & Skills Recognition','MSME Digital Capability Credentials','ESG & Sustainability Credentials','Governance & Public Sector Capability','Digital Public Infrastructure for Credentialing','Systems Transformation & Regional Resilience'];
const PILLAR_ICONS = ['🏖️','🚀','💼','🌱','🏛️','🔗','🌍'];
const SDG_OPTIONS = ['SDG 4','SDG 5','SDG 8','SDG 9','SDG 10','SDG 13','SDG 16','SDG 17'];
const EMPTY = { title:'', description:'', pillar:1, level:'Beginner', duration_hours:2, published:false, sdg_tags:[], objectives:'', target_audience:'' };

export default function AdminCourses() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState({ search:'', pillar:'', published:'' });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('credii_courses').select('*').order('created_at',{ascending:false});
    setCourses(data||[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function set(f,v) { setForm(x=>({...x,[f]:v})); }
  function showToast(msg,type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }
  function openAdd() { setForm({...EMPTY,created_by:profile?.id}); setModal('add'); }
  function openEdit(c) { setForm({...c}); setModal(c); }
  function toggleSDG(sdg) { setForm(f=>({...f,sdg_tags:f.sdg_tags?.includes(sdg)?f.sdg_tags.filter(s=>s!==sdg):[...(f.sdg_tags||[]),sdg]})); }

  async function save() {
    if (!form.title) return showToast('Course title is required','error');
    setSaving(true);
    const payload = {...form, pillar:Number(form.pillar), duration_hours:Number(form.duration_hours)};
    if (modal==='add') {
      const { error } = await supabase.from('credii_courses').insert(payload);
      if (error) showToast(error.message,'error'); else showToast('Course created!');
    } else {
      const { error } = await supabase.from('credii_courses').update(payload).eq('id',modal.id);
      if (error) showToast(error.message,'error'); else showToast('Course updated!');
    }
    setSaving(false); setModal(null); load();
  }

  async function togglePublish(course) {
    await supabase.from('credii_courses').update({published:!course.published}).eq('id',course.id);
    showToast(course.published?'Course unpublished':'Course published!'); load();
  }

  async function del(id) {
    if (!window.confirm('Delete this course?')) return;
    await supabase.from('credii_courses').delete().eq('id',id);
    showToast('Course deleted','error'); load();
  }

  const filtered = courses.filter(c => {
    const q = filter.search.toLowerCase();
    return (!q||c.title.toLowerCase().includes(q))
      && (!filter.pillar||c.pillar===Number(filter.pillar))
      && (!filter.published||(filter.published==='published'?c.published:!c.published));
  });

  return (
    <div>
      {toast && <div className={`cf-toast cf-toast-${toast.type}`}>{toast.msg}</div>}
      <div className="cf-page-header">
        <div><div className="cf-page-title">Course Management</div><div className="cf-page-subtitle">Create and manage microcredential courses across all 7 pillars</div></div>
        <button className="cf-btn cf-btn-primary" onClick={openAdd}>+ Create Course</button>
      </div>

      <div className="cf-filters">
        <input className="cf-filter-input" placeholder="🔍 Search courses..." style={{width:220}} value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))}/>
        <select className="cf-filter-input" value={filter.pillar} onChange={e=>setFilter(f=>({...f,pillar:e.target.value}))}>
          <option value="">All Pillars</option>
          {PILLAR_NAMES.map((n,i)=><option key={i} value={i+1}>Pillar {i+1} — {n.split(' ').slice(0,2).join(' ')}</option>)}
        </select>
        <select className="cf-filter-input" value={filter.published} onChange={e=>setFilter(f=>({...f,published:e.target.value}))}>
          <option value="">All Status</option><option value="published">Published</option><option value="draft">Draft</option>
        </select>
      </div>

      <div className="cf-card">
        {loading
          ? <div style={{padding:40,textAlign:'center',color:'#9ca3af'}}>Loading courses...</div>
          : filtered.length===0
            ? <div className="cf-empty"><div className="cf-empty-icon">📚</div><p>No courses found</p><button className="cf-btn cf-btn-primary" onClick={openAdd}>Create First Course</button></div>
            : <div className="cf-table-wrap"><table>
                <thead><tr><th>Course</th><th>Pillar</th><th>Level</th><th>Duration</th><th>SDGs</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(c=>(
                    <tr key={c.id}>
                      <td><div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:20}}>{PILLAR_ICONS[(c.pillar||1)-1]}</span><div><div className="cf-fw-700" style={{fontSize:13}}>{c.title}</div><div className="cf-text-muted">{c.description?.slice(0,40)}...</div></div></div></td>
                      <td><span className="cf-badge cf-badge-navy" style={{fontSize:10}}>Pillar {c.pillar}</span></td>
                      <td><span className="cf-badge cf-badge-gray" style={{fontSize:10}}>{c.level}</span></td>
                      <td className="cf-text-muted">⏱ {c.duration_hours}h</td>
                      <td>{c.sdg_tags?.map(s=><span key={s} className="cf-sdg-tag" style={{marginRight:2}}>{s}</span>)}</td>
                      <td><span className={`cf-badge ${c.published?'cf-badge-teal':'cf-badge-gold'}`}>{c.published?'✅ Published':'📝 Draft'}</span></td>
                      <td><div style={{display:'flex',gap:6}}>
                        <button className="cf-btn-icon" onClick={()=>openEdit(c)}>✏️</button>
                        <button className="cf-btn-icon" onClick={()=>togglePublish(c)}>{c.published?'🔒':'🚀'}</button>
                        <button className="cf-btn-icon" onClick={()=>del(c.id)}>🗑️</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
        }
      </div>

      {modal && (
        <div className="cf-modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}>
          <div className="cf-modal">
            <div className="cf-modal-header"><h2>{modal==='add'?'Create Course':'Edit Course'}</h2><button className="cf-modal-close" onClick={()=>setModal(null)}>✕</button></div>
            <div className="cf-modal-body">
              <div className="cf-form-group"><label>Course Title *</label><input value={form.title||''} onChange={e=>set('title',e.target.value)} placeholder="e.g. Introduction to Caribbean Tourism Standards"/></div>
              <div className="cf-form-group"><label>Description</label><textarea rows={3} value={form.description||''} onChange={e=>set('description',e.target.value)} placeholder="Course description..."/></div>
              <div className="cf-form-row">
                <div className="cf-form-group"><label>Capability Pillar *</label><select value={form.pillar||1} onChange={e=>set('pillar',e.target.value)}>{PILLAR_NAMES.map((n,i)=><option key={i} value={i+1}>Pillar {i+1} — {n}</option>)}</select></div>
                <div className="cf-form-group"><label>Level</label><select value={form.level||'Beginner'} onChange={e=>set('level',e.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
              </div>
              <div className="cf-form-row">
                <div className="cf-form-group"><label>Duration (hours)</label><input type="number" min="1" value={form.duration_hours||2} onChange={e=>set('duration_hours',e.target.value)}/></div>
                <div className="cf-form-group"><label>Target Audience</label><input value={form.target_audience||''} onChange={e=>set('target_audience',e.target.value)} placeholder="e.g. Youth, MSMEs, Public Sector"/></div>
              </div>
              <div className="cf-form-group"><label>Learning Objectives</label><textarea rows={2} value={form.objectives||''} onChange={e=>set('objectives',e.target.value)} placeholder="What will learners achieve?"/></div>
              <div className="cf-form-group">
                <label>SDG Alignment</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:4}}>
                  {SDG_OPTIONS.map(sdg=><button key={sdg} type="button" className={`cf-btn cf-btn-sm ${form.sdg_tags?.includes(sdg)?'cf-btn-navy':'cf-btn-secondary'}`} onClick={()=>toggleSDG(sdg)}>{sdg}</button>)}
                </div>
              </div>
              <div className="cf-form-group"><label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}><input type="checkbox" checked={form.published||false} onChange={e=>set('published',e.target.checked)}/>Publish immediately (visible to learners)</label></div>
            </div>
            <div className="cf-modal-footer">
              <button className="cf-btn cf-btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
              <button className="cf-btn cf-btn-primary" onClick={save} disabled={saving}>{saving?'Saving...':'Save Course'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}