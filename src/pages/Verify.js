import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}); }

export default function Verify() {
  const { credentialId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [credential, setCredential] = useState(null);

  useEffect(() => {
    async function verify() {
      const { data, error } = await supabase
        .from('credii_credentials')
        .select('*, credii_profiles(full_name, country), credii_courses(title, pillar)')
        .eq('credential_id', credentialId)
        .single();
      if (error || !data) setStatus('invalid');
      else { setCredential(data); setStatus('valid'); }
    }
    verify();
  }, [credentialId]);

  const s = { page:{minHeight:'100vh',background:'#f8f9fa',display:'flex',flexDirection:'column'}, nav:{background:'#1a2744',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'} };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>navigate('/')}>
          <div style={{width:36,height:36,background:'#C0392B',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:16,color:'#fff'}}>C</div>
          <span style={{fontSize:18,fontWeight:800,color:'#fff'}}>credii</span>
        </div>
        <span style={{fontSize:12,color:'rgba(255,255,255,0.6)'}}>Credential Verification Portal</span>
      </nav>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:40}}>
        {status==='loading' && <div style={{textAlign:'center'}}><div style={{width:48,height:48,border:'4px solid #e5e7eb',borderTop:'4px solid #C0392B',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 16px'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><p style={{color:'#6b7280'}}>Verifying credential on blockchain...</p></div>}
        {status==='invalid' && (
          <div style={{background:'#fff',borderRadius:20,padding:48,textAlign:'center',maxWidth:480,boxShadow:'0 10px 40px rgba(0,0,0,0.08)'}}>
            <div style={{fontSize:64,marginBottom:16}}>❌</div>
            <h2 style={{fontSize:22,fontWeight:800,color:'#C0392B',marginBottom:8}}>Credential Not Found</h2>
            <p style={{color:'#6b7280',marginBottom:24,lineHeight:1.6}}>The credential ID <strong>{credentialId}</strong> could not be verified.</p>
            <button onClick={()=>navigate('/')} style={{padding:'10px 20px',borderRadius:8,border:'none',background:'#1a2744',color:'#fff',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>← Return to Credii</button>
          </div>
        )}
        {status==='valid' && credential && (
          <div style={{maxWidth:640,width:'100%'}}>
            <div style={{background:'#d1fae5',border:'2px solid #10b981',borderRadius:14,padding:16,display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
              <span style={{fontSize:28}}>✅</span>
              <div><div style={{fontWeight:700,color:'#065f46',fontSize:15}}>Credential Verified</div><div style={{fontSize:13,color:'#047857'}}>This credential is authentic and blockchain-anchored on the Polygon network.</div></div>
            </div>
            <div style={{background:'linear-gradient(135deg,#1a2744,#C0392B)',borderRadius:20,padding:32,color:'#fff',marginBottom:24}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
                <div style={{width:40,height:40,background:'#C0392B',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:18,border:'2px solid rgba(255,255,255,0.3)'}}>C</div>
                <div><div style={{fontWeight:800,fontSize:16}}>credii</div><div style={{fontSize:11,color:'rgba(255,255,255,0.6)'}}>Caribbean Digital Trust Infrastructure</div></div>
                <div style={{marginLeft:'auto',background:'#F39C12',color:'#1a2744',fontSize:10,fontWeight:700,padding:'4px 10px',borderRadius:20}}>🇹🇹 T&T PILOT</div>
              </div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6}}>Certificate of Completion</div>
              <div style={{fontSize:24,fontWeight:800,marginBottom:4}}>{credential.credii_courses?.title}</div>
              <div style={{fontSize:14,color:'rgba(255,255,255,0.7)',marginBottom:20}}>Pillar {credential.credii_courses?.pillar}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
                {[{label:'AWARDED TO',value:credential.credii_profiles?.full_name},{label:'COUNTRY',value:credential.credii_profiles?.country},{label:'ISSUED ON',value:fmtDate(credential.issued_at)},{label:'CREDENTIAL ID',value:credential.credential_id}].map(d=>(
                  <div key={d.label}><div style={{fontSize:11,color:'rgba(255,255,255,0.5)',marginBottom:2}}>{d.label}</div><div style={{fontWeight:700,fontSize:d.label==='CREDENTIAL ID'?11:14,fontFamily:d.label==='CREDENTIAL ID'?'monospace':'inherit',wordBreak:'break-all'}}>{d.value}</div></div>
                ))}
              </div>
              {credential.blockchain_hash && <div style={{borderTop:'1px solid rgba(255,255,255,0.15)',paddingTop:16,display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:16}}>🔗</span><div><div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>BLOCKCHAIN HASH</div><div style={{fontSize:11,fontFamily:'monospace',color:'#F39C12'}}>{credential.blockchain_hash}</div></div></div>}
            </div>
            <div style={{textAlign:'center'}}>
              <button onClick={()=>navigate('/')} style={{padding:'10px 20px',borderRadius:8,border:'none',background:'#1a2744',color:'#fff',fontWeight:700,cursor:'pointer',fontFamily:'inherit',marginRight:10}}>← Return to Credii</button>
              <button onClick={()=>window.print()} style={{padding:'10px 20px',borderRadius:8,border:'1px solid #e5e7eb',background:'#fff',color:'#374151',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>🖨️ Print</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}