import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const PILLAR_ICONS = ['🏖️','🚀','💼','🌱','🏛️','🔗','🌍'];
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}); }

export default function MyCredentials() {
  const { profile } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase.from('credii_credentials').select('*, credii_courses(title,pillar,description)').eq('learner_id', profile.id).order('issued_at',{ascending:false});
    setCredentials(data||[]);
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  function copy(text) { navigator.clipboard.writeText(text); }

  return (
    <div>
      <div className="cf-page-header">
        <div><div className="cf-page-title">My Credentials</div><div className="cf-page-subtitle">Your blockchain-verified Caribbean digital credential portfolio</div></div>
      </div>

      <div className="cf-stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:24}}>
        <div className="cf-stat-card"><div className="cf-stat-icon gold">🏆</div><div><div className="cf-stat-value">{credentials.length}</div><div className="cf-stat-label">Total Credentials</div></div></div>
        <div className="cf-stat-card"><div className="cf-stat-icon teal">🔗</div><div><div className="cf-stat-value">{credentials.filter(c=>c.blockchain_hash).length}</div><div className="cf-stat-label">On-Chain Verified</div></div></div>
        <div className="cf-stat-card"><div className="cf-stat-icon navy">🌍</div><div><div className="cf-stat-value">{[...new Set(credentials.map(c=>c.credii_courses?.pillar))].length}</div><div className="cf-stat-label">Pillars Covered</div></div></div>
      </div>

      {loading
        ? <div style={{color:'#9ca3af',padding:40,textAlign:'center'}}>Loading credentials...</div>
        : credentials.length===0
          ? <div className="cf-empty"><div className="cf-empty-icon">🏆</div><p>No credentials yet</p><p style={{fontSize:13,color:'#9ca3af',marginBottom:16}}>Complete a course to earn your first blockchain-verified Credii credential</p><button className="cf-btn cf-btn-primary" onClick={()=>window.location.href='/learn/courses'}>Browse Courses</button></div>
          : <div style={{display:'grid',gridTemplateColumns:selected?'1fr 400px':'1fr',gap:20}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16,alignContent:'start'}}>
                {credentials.map(c=>(
                  <div key={c.id} className="cf-credential-card" style={{cursor:'pointer',outline:selected?.id===c.id?'3px solid #F39C12':'none'}} onClick={()=>setSelected(c)}>
                    <div style={{position:'relative',zIndex:1}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{width:32,height:32,background:'#C0392B',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,border:'2px solid rgba(255,255,255,0.3)'}}>C</div>
                          <div><div style={{fontWeight:800,fontSize:13}}>credii</div><div style={{fontSize:9,color:'rgba(255,255,255,0.5)'}}>CARIBBEAN DIGITAL TRUST</div></div>
                        </div>
                        <div style={{fontSize:24}}>{PILLAR_ICONS[(c.credii_courses?.pillar||1)-1]}</div>
                      </div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Certificate of Completion</div>
                      <div style={{fontSize:16,fontWeight:800,marginBottom:4,lineHeight:1.3}}>{c.credii_courses?.title}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',marginBottom:16}}>Pillar {c.credii_courses?.pillar} · Caribbean Digital Trust Infrastructure</div>
                      <div style={{background:'rgba(255,255,255,0.08)',borderRadius:8,padding:10,marginBottom:12}}>
                        <div style={{fontSize:9,color:'rgba(255,255,255,0.5)',marginBottom:2}}>AWARDED TO</div>
                        <div style={{fontWeight:700,fontSize:14}}>{profile?.full_name}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,0.6)'}}>{profile?.country||'Trinidad and Tobago'}</div>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'rgba(255,255,255,0.6)',marginBottom:12}}>
                        <span>📅 {fmtDate(c.issued_at)}</span>
                        <span>{c.blockchain_hash?'🔗 On-chain':'⏳ Pending'}</span>
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        <button className="cf-btn cf-btn-sm cf-btn-gold" style={{flex:1,justifyContent:'center'}} onClick={e=>{e.stopPropagation();window.open(`/verify/${c.credential_id}`,'_blank');}}>🔍 Verify</button>
                        <button className="cf-btn cf-btn-sm" style={{background:'rgba(255,255,255,0.15)',color:'#fff',flex:1,justifyContent:'center'}} onClick={e=>{e.stopPropagation();copy(`${window.location.origin}/verify/${c.credential_id}`);}}>📋 Copy Link</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selected && (
                <div className="cf-card" style={{alignSelf:'start',position:'sticky',top:20}}>
                  <div className="cf-card-header"><span className="cf-card-title">Credential Details</span><button className="cf-modal-close" onClick={()=>setSelected(null)}>✕</button></div>
                  <div className="cf-card-body">
                    <div style={{background:'linear-gradient(135deg,#1a2744,#C0392B)',borderRadius:12,padding:16,color:'#fff',marginBottom:20,textAlign:'center'}}>
                      <div style={{fontSize:36,marginBottom:8}}>{PILLAR_ICONS[(selected.credii_courses?.pillar||1)-1]}</div>
                      <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>{selected.credii_courses?.title}</div>
                      <div style={{fontSize:12,color:'rgba(255,255,255,0.7)'}}>Pillar {selected.credii_courses?.pillar}</div>
                    </div>
                    {[{label:'Credential ID',value:selected.credential_id,mono:true},{label:'Awarded To',value:profile?.full_name},{label:'Country',value:profile?.country||'Trinidad and Tobago'},{label:'Issue Date',value:fmtDate(selected.issued_at)},{label:'Status',value:selected.status||'Issued'},{label:'Blockchain',value:selected.blockchain_hash?'✅ Anchored on Polygon':'⏳ Pending confirmation'},{label:'Issuing Authority',value:'Credii Foundation, T&T'}].map(d=>(
                      <div key={d.label} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f3f4f6',fontSize:13}}>
                        <span style={{color:'#6b7280'}}>{d.label}</span>
                        <span style={{fontWeight:600,color:'#1a2744',textAlign:'right',maxWidth:'55%',fontSize:d.mono?11:13,fontFamily:d.mono?'monospace':'inherit',wordBreak:'break-all'}}>{d.value}</span>
                      </div>
                    ))}
                    <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:16}}>
                      <button className="cf-btn cf-btn-primary" style={{justifyContent:'center'}} onClick={()=>window.open(`/verify/${selected.credential_id}`,'_blank')}>🔍 Verify Public Link</button>
                      <button className="cf-btn cf-btn-secondary" style={{justifyContent:'center'}} onClick={()=>copy(`${window.location.origin}/verify/${selected.credential_id}`)}>📋 Copy Verification Link</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
      }
    </div>
  );
}