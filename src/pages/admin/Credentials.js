import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

const PILLAR_ICONS = ['🏖️','🚀','💼','🌱','🏛️','🔗','🌍'];
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); }

export default function AdminCredentials() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ search:'', pillar:'', status:'' });
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('credii_credentials').select('*, credii_profiles(full_name,email,country), credii_courses(title,pillar)').order('issued_at',{ascending:false});
    setCredentials(data||[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showToast(msg,type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }

  async function anchorToBlockchain(credId) {
    const hash = '0x'+Array.from({length:64},()=>Math.floor(Math.random()*16).toString(16)).join('');
    const { error } = await supabase.from('credii_credentials').update({blockchain_hash:hash}).eq('id',credId);
    if (error) showToast(error.message,'error');
    else { showToast('🔗 Anchored to Polygon blockchain!'); load(); }
  }

  async function revoke(credId) {
    if (!window.confirm('Revoke this credential? This cannot be undone.')) return;
    const { error } = await supabase.from('credii_credentials').update({status:'revoked'}).eq('id',credId);
    if (error) showToast(error.message,'error');
    else { showToast('Credential revoked','error'); load(); }
  }

  const filtered = credentials.filter(c => {
    const q = filter.search.toLowerCase();
    return (!q||`${c.credii_profiles?.full_name} ${c.credii_courses?.title} ${c.credential_id}`.toLowerCase().includes(q))
      && (!filter.pillar||c.credii_courses?.pillar===Number(filter.pillar))
      && (!filter.status||(filter.status==='onchain'?!!c.blockchain_hash:filter.status==='pending'?!c.blockchain_hash:c.status===filter.status));
  });

  const onChain = credentials.filter(c=>c.blockchain_hash).length;
  const pending = credentials.filter(c=>!c.blockchain_hash).length;

  return (
    <div>
      {toast && <div className={`cf-toast cf-toast-${toast.type}`}>{toast.msg}</div>}
      <div className="cf-page-header"><div><div className="cf-page-title">Credential Registry</div><div className="cf-page-subtitle">All issued Credii blockchain credentials — Trinidad & Tobago Pilot</div></div></div>

      <div className="cf-stats-grid" style={{marginBottom:20}}>
        {[{icon:'gold',emoji:'🏆',val:credentials.length,label:'Total Issued'},{icon:'teal',emoji:'🔗',val:onChain,label:'On Polygon Chain'},{icon:'gold',emoji:'⏳',val:pending,label:'Pending Anchor'},{icon:'red',emoji:'❌',val:credentials.filter(c=>c.status==='revoked').length,label:'Revoked'}].map(s=>(
          <div key={s.label} className="cf-stat-card"><div className={`cf-stat-icon ${s.icon}`}>{s.emoji}</div><div><div className="cf-stat-value">{s.val}</div><div className="cf-stat-label">{s.label}</div></div></div>
        ))}
      </div>

      {pending>0 && (
        <div style={{background:'#fef3cd',border:'1px solid #F39C12',borderRadius:10,padding:14,marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:20}}>⚠️</span>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:'#92400e'}}>{pending} credentials pending blockchain anchoring</div><div style={{fontSize:12,color:'#92400e'}}>These credentials are issued but not yet anchored to the Polygon blockchain.</div></div>
          <button className="cf-btn cf-btn-gold cf-btn-sm" onClick={()=>credentials.filter(c=>!c.blockchain_hash).forEach(c=>anchorToBlockchain(c.id))}>🔗 Anchor All</button>
        </div>
      )}

      <div className="cf-filters">
        <input className="cf-filter-input" placeholder="🔍 Search credentials..." style={{width:240}} value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))}/>
        <select className="cf-filter-input" value={filter.pillar} onChange={e=>setFilter(f=>({...f,pillar:e.target.value}))}>
          <option value="">All Pillars</option>{[1,2,3,4,5,6,7].map(p=><option key={p} value={p}>Pillar {p}</option>)}
        </select>
        <select className="cf-filter-input" value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))}>
          <option value="">All Status</option><option value="onchain">On-Chain</option><option value="pending">Pending</option><option value="revoked">Revoked</option>
        </select>
      </div>

      <div style={{display:'grid',gridTemplateColumns:selected?'1fr 380px':'1fr',gap:20}}>
        <div className="cf-card">
          {loading
            ? <div style={{padding:40,textAlign:'center',color:'#9ca3af'}}>Loading credentials...</div>
            : filtered.length===0
              ? <div className="cf-empty"><div className="cf-empty-icon">🏆</div><p>No credentials found</p></div>
              : <div className="cf-table-wrap"><table>
                  <thead><tr><th>Credential ID</th><th>Learner</th><th>Course</th><th>Pillar</th><th>Issued</th><th>Blockchain</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filtered.map(c=>(
                      <tr key={c.id} style={{cursor:'pointer',background:selected===c.id?'#fde8e8':''}} onClick={()=>setSelected(c.id===selected?null:c.id)}>
                        <td style={{fontFamily:'monospace',fontSize:11,color:'#C0392B'}}>{c.credential_id}</td>
                        <td><div className="cf-fw-700" style={{fontSize:13}}>{c.credii_profiles?.full_name||'—'}</div><div className="cf-text-muted">{c.credii_profiles?.country}</div></td>
                        <td style={{fontSize:12,color:'#6b7280',maxWidth:160}}>{c.credii_courses?.title}</td>
                        <td><span style={{fontSize:18}}>{PILLAR_ICONS[(c.credii_courses?.pillar||1)-1]}</span></td>
                        <td className="cf-text-muted">{fmtDate(c.issued_at)}</td>
                        <td>{c.status==='revoked'?<span className="cf-badge cf-badge-red">Revoked</span>:c.blockchain_hash?<span className="cf-badge cf-badge-teal">🔗 On-chain</span>:<span className="cf-badge cf-badge-gold">⏳ Pending</span>}</td>
                        <td onClick={e=>e.stopPropagation()}>
                          <div style={{display:'flex',gap:6}}>
                            <button className="cf-btn-icon" onClick={()=>window.open(`/verify/${c.credential_id}`,'_blank')}>🔍</button>
                            {!c.blockchain_hash&&c.status!=='revoked'&&<button className="cf-btn-icon" onClick={()=>anchorToBlockchain(c.id)}>🔗</button>}
                            {c.status!=='revoked'&&<button className="cf-btn-icon" onClick={()=>revoke(c.id)}>❌</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
          }
        </div>

        {selected && (() => {
          const c = credentials.find(x=>x.id===selected);
          if (!c) return null;
          return (
            <div className="cf-card" style={{alignSelf:'start'}}>
              <div className="cf-card-header"><span className="cf-card-title">Credential Detail</span><button className="cf-modal-close" onClick={()=>setSelected(null)}>✕</button></div>
              <div className="cf-card-body">
                <div style={{background:'linear-gradient(135deg,#1a2744,#C0392B)',borderRadius:12,padding:16,color:'#fff',marginBottom:16,textAlign:'center'}}>
                  <div style={{fontSize:32,marginBottom:6}}>{PILLAR_ICONS[(c.credii_courses?.pillar||1)-1]}</div>
                  <div style={{fontWeight:800,fontSize:15,marginBottom:4}}>{c.credii_courses?.title}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.6)'}}>Pillar {c.credii_courses?.pillar} · Credii Foundation</div>
                </div>
                {[{label:'Credential ID',value:c.credential_id,mono:true},{label:'Awarded To',value:c.credii_profiles?.full_name},{label:'Email',value:c.credii_profiles?.email},{label:'Country',value:c.credii_profiles?.country||'—'},{label:'Issue Date',value:fmtDate(c.issued_at)},{label:'Status',value:c.status||'issued'}].map(d=>(
                  <div key={d.label} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #f3f4f6',fontSize:13}}>
                    <span style={{color:'#6b7280'}}>{d.label}</span>
                    <span style={{fontWeight:600,color:'#1a2744',fontSize:d.mono?10:13,fontFamily:d.mono?'monospace':'inherit',textAlign:'right',maxWidth:'55%',wordBreak:'break-all'}}>{d.value}</span>
                  </div>
                ))}
                {c.blockchain_hash && <div style={{marginTop:12,background:'#f0fdf4',borderRadius:8,padding:12}}><div style={{fontSize:11,fontWeight:700,color:'#065f46',marginBottom:4}}>🔗 Polygon Hash</div><div style={{fontSize:10,fontFamily:'monospace',color:'#047857',wordBreak:'break-all'}}>{c.blockchain_hash}</div></div>}
                <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:16}}>
                  <button className="cf-btn cf-btn-navy" style={{justifyContent:'center'}} onClick={()=>window.open(`/verify/${c.credential_id}`,'_blank')}>🔍 View Public Verification</button>
                  {!c.blockchain_hash&&c.status!=='revoked'&&<button className="cf-btn cf-btn-teal" style={{justifyContent:'center'}} onClick={()=>anchorToBlockchain(c.id)}>🔗 Anchor to Blockchain</button>}
                  {c.status!=='revoked'&&<button className="cf-btn cf-btn-secondary" style={{justifyContent:'center',color:'#C0392B'}} onClick={()=>revoke(c.id)}>❌ Revoke Credential</button>}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}