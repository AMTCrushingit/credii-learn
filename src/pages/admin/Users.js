import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); }

export default function AdminUsers() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ search:'', role:'', country:'' });
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [u,c,e] = await Promise.all([
      supabase.from('credii_profiles').select('*').order('created_at',{ascending:false}),
      supabase.from('credii_credentials').select('learner_id, credential_id, issued_at, credii_courses(title,pillar)'),
      supabase.from('credii_enrollments').select('learner_id, progress, course_id')
    ]);
    setUsers(u.data||[]); setCredentials(c.data||[]); setEnrollments(e.data||[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg,type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }

  async function changeRole(userId, newRole) {
    if (userId===profile?.id) return showToast("You can't change your own role",'error');
    const { error } = await supabase.from('credii_profiles').update({role:newRole}).eq('id',userId);
    if (error) showToast(error.message,'error');
    else { showToast(`Role updated to ${newRole}`); load(); }
  }

  const filtered = users.filter(u => {
    const q = filter.search.toLowerCase();
    return (!q||`${u.full_name} ${u.email} ${u.organisation||''}`.toLowerCase().includes(q))
      && (!filter.role||u.role===filter.role)
      && (!filter.country||u.country===filter.country);
  });

  const countries = [...new Set(users.map(u=>u.country).filter(Boolean))];
  const userCreds = id => credentials.filter(c=>c.learner_id===id);
  const userEnrolls = id => enrollments.filter(e=>e.learner_id===id);
  const initials = name => name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'??';
  const selectedUser = selected ? users.find(u=>u.id===selected) : null;

  return (
    <div>
      {toast && <div className={`cf-toast cf-toast-${toast.type}`}>{toast.msg}</div>}
      <div className="cf-page-header"><div><div className="cf-page-title">User Management</div><div className="cf-page-subtitle">{users.length} registered users on the Credii platform</div></div></div>

      <div className="cf-stats-grid" style={{marginBottom:20}}>
        {[{label:'Total Users',val:users.length,icon:'navy',emoji:'👥'},{label:'Learners',val:users.filter(u=>u.role==='learner').length,icon:'teal',emoji:'🎓'},{label:'MSMEs',val:users.filter(u=>u.role==='msme').length,icon:'gold',emoji:'💼'},{label:'Admins/Instructors',val:users.filter(u=>['admin','instructor'].includes(u.role)).length,icon:'red',emoji:'⚙️'}].map(s=>(
          <div key={s.label} className="cf-stat-card"><div className={`cf-stat-icon ${s.icon}`}>{s.emoji}</div><div><div className="cf-stat-value">{s.val}</div><div className="cf-stat-label">{s.label}</div></div></div>
        ))}
      </div>

      <div className="cf-filters">
        <input className="cf-filter-input" placeholder="🔍 Search users..." style={{width:220}} value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))}/>
        <select className="cf-filter-input" value={filter.role} onChange={e=>setFilter(f=>({...f,role:e.target.value}))}>
          <option value="">All Roles</option><option value="learner">Learner</option><option value="msme">MSME</option><option value="instructor">Instructor</option><option value="admin">Admin</option>
        </select>
        <select className="cf-filter-input" value={filter.country} onChange={e=>setFilter(f=>({...f,country:e.target.value}))}>
          <option value="">All Countries</option>
          {countries.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={{display:'grid',gridTemplateColumns:selected?'1fr 360px':'1fr',gap:20}}>
        <div className="cf-card">
          {loading
            ? <div style={{padding:40,textAlign:'center',color:'#9ca3af'}}>Loading users...</div>
            : filtered.length===0
              ? <div className="cf-empty"><div className="cf-empty-icon">👥</div><p>No users found</p></div>
              : <div className="cf-table-wrap"><table>
                  <thead><tr><th>User</th><th>Role</th><th>Country</th><th>Credentials</th><th>Enrolled</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filtered.map(u=>(
                      <tr key={u.id} style={{cursor:'pointer',background:selected===u.id?'#fde8e8':''}} onClick={()=>setSelected(u.id===selected?null:u.id)}>
                        <td><div style={{display:'flex',alignItems:'center',gap:10}}><span className="cf-avatar-sm">{initials(u.full_name)}</span><div><div className="cf-fw-700" style={{fontSize:13}}>{u.full_name}</div><div className="cf-text-muted">{u.email}</div></div></div></td>
                        <td><span className={`cf-badge ${u.role==='admin'?'cf-badge-red':u.role==='instructor'?'cf-badge-gold':u.role==='msme'?'cf-badge-teal':'cf-badge-navy'}`}>{u.role}</span></td>
                        <td style={{fontSize:13}}>🇹🇹 {u.country||'—'}</td>
                        <td className="cf-fw-700 cf-text-red">{userCreds(u.id).length}</td>
                        <td style={{fontSize:13}}>{userEnrolls(u.id).length}</td>
                        <td className="cf-text-muted">{fmtDate(u.created_at)}</td>
                        <td onClick={e=>e.stopPropagation()}>
                          <select className="cf-filter-input" style={{fontSize:11,padding:'3px 6px'}} value={u.role} onChange={e=>changeRole(u.id,e.target.value)} disabled={u.id===profile?.id}>
                            <option value="learner">Learner</option><option value="msme">MSME</option><option value="instructor">Instructor</option><option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
          }
        </div>

        {selectedUser && (
          <div className="cf-card" style={{alignSelf:'start'}}>
            <div className="cf-card-header">
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span className="cf-avatar-sm" style={{width:36,height:36,fontSize:13}}>{initials(selectedUser.full_name)}</span>
                <div><div style={{fontWeight:700,fontSize:14}}>{selectedUser.full_name}</div><div style={{fontSize:11,color:'#6b7280'}}>{selectedUser.email}</div></div>
              </div>
              <button className="cf-modal-close" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className="cf-card-body">
              <div style={{background:'linear-gradient(135deg,#1a2744,#C0392B)',borderRadius:12,padding:16,color:'#fff',marginBottom:16,textAlign:'center'}}>
                <div style={{fontSize:32,fontWeight:800}}>{userCreds(selectedUser.id).length}</div>
                <div style={{fontSize:12,opacity:0.8}}>Credentials Earned</div>
                <div style={{fontSize:11,opacity:0.6,marginTop:4}}>{userEnrolls(selectedUser.id).length} courses enrolled</div>
              </div>
              {[{label:'Role',value:selectedUser.role},{label:'Country',value:selectedUser.country||'—'},{label:'Organisation',value:selectedUser.organisation||'—'},{label:'Joined',value:fmtDate(selectedUser.created_at)}].map(d=>(
                <div key={d.label} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #f3f4f6',fontSize:13}}>
                  <span style={{color:'#6b7280'}}>{d.label}</span><span style={{fontWeight:600,color:'#1a2744'}}>{d.value}</span>
                </div>
              ))}
              {userCreds(selectedUser.id).length>0 && (
                <div style={{marginTop:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#1a2744',marginBottom:10}}>🏆 Credentials</div>
                  {userCreds(selectedUser.id).map(c=>(
                    <div key={c.credential_id} style={{background:'#f8f9fa',borderRadius:8,padding:10,marginBottom:6}}>
                      <div style={{fontSize:12,fontWeight:600,color:'#1a2744'}}>{c.credii_courses?.title}</div>
                      <div style={{fontSize:11,color:'#9ca3af'}}>Pillar {c.credii_courses?.pillar}</div>
                    </div>
                  ))}
                </div>
              )}
              {selectedUser.id!==profile?.id && (
                <div style={{marginTop:16,borderTop:'1px solid #f3f4f6',paddingTop:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10}}>Change Role</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {['learner','msme','instructor','admin'].map(role=>(
                      <button key={role} className={`cf-btn cf-btn-sm ${selectedUser.role===role?'cf-btn-primary':'cf-btn-secondary'}`} onClick={()=>changeRole(selectedUser.id,role)} style={{textTransform:'capitalize'}}>{role}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}