import React from 'react';
import { useNavigate } from 'react-router-dom';

const PILLARS = [
  { num:'01', title:'Tourism & Cultural Heritage Credentials', icon:'🏖️', sdg:'SDG 8' },
  { num:'02', title:'Workforce Mobility & Skills Recognition', icon:'🚀', sdg:'SDG 4' },
  { num:'03', title:'MSME Digital Capability Credentials', icon:'💼', sdg:'SDG 9' },
  { num:'04', title:'ESG & Sustainability Credentials', icon:'🌱', sdg:'SDG 13' },
  { num:'05', title:'Governance & Public Sector Capability', icon:'🏛️', sdg:'SDG 16' },
  { num:'06', title:'Digital Public Infrastructure for Credentialing', icon:'🔗', sdg:'SDG 9' },
  { num:'07', title:'Systems Transformation & Regional Resilience', icon:'🌍', sdg:'SDG 17' },
];

const MEMBERSHIP = [
  { tier:'Tier 1', label:'Institutional', color:'#3b82f6', price:'$1,000', target:'MSMEs, NGOs, Training Institutions', benefits:['Credii standards updates','Working group participation','Early research access','"Credii Member" digital badge','Discounted pilot access'] },
  { tier:'Tier 2', label:'Sector', color:'#F39C12', price:'$5,000', target:'TVET Institutions, Universities', benefits:['All Tier 1 benefits','Priority credentialing pilots','Sector advisory councils','Co-branding opportunities','Annual sector impact report'] },
  { tier:'Tier 3', label:'Government', color:'#C0392B', price:'$15,000', target:'Ministries, National Agencies', benefits:['All Tier 2 benefits','National standards alignment','Verification system onboarding','Policy advisory sessions','Regional governance convenings'] },
  { tier:'Tier 4', label:'Strategic', color:'#1a2744', price:'$25,000', target:'Development Partners, Multilaterals', benefits:['All Tier 3 benefits','Strategic advisory seat','Co-development of regional standards','Early analytics access','Pan-Caribbean visibility'], featured:true },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{fontFamily:'Inter,sans-serif',color:'#1a2744'}}>
      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(10px)',borderBottom:'1px solid #e5e7eb'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px',height:68,display:'flex',alignItems:'center',justifyContent:'space-between',gap:24}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:38,height:38,background:'#C0392B',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:18,color:'#fff'}}>C</div>
            <span style={{fontSize:20,fontWeight:800,color:'#1a2744'}}>credii</span>
          </div>
          <div style={{display:'flex',gap:28}}>
            {['Architecture','Pillars','Membership'].map(l=><a key={l} href={`#${l.toLowerCase()}`} style={{fontSize:14,fontWeight:500,color:'#374151',textDecoration:'none'}}>{l}</a>)}
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>navigate('/login')} style={{padding:'8px 16px',borderRadius:8,border:'2px solid #1a2744',background:'transparent',color:'#1a2744',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Sign In</button>
            <button onClick={()=>navigate('/login')} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'#C0392B',color:'#fff',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Get Started →</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{background:'linear-gradient(135deg,#f8f9fa,#fff)',padding:'80px 24px'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center'}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'#e8edf5',color:'#1a2744',fontSize:12,fontWeight:600,padding:'6px 14px',borderRadius:20,marginBottom:20}}>🇹🇹 Caribbean Digital Trust Infrastructure</div>
            <h1 style={{fontSize:42,fontWeight:800,color:'#1a2744',lineHeight:1.2,marginBottom:20}}>Strengthening the Caribbean's <span style={{color:'#1a2744'}}>Capability,</span> <span style={{color:'#C0392B'}}>Credibility</span> <span style={{color:'#1a2744'}}>&amp; Access.</span></h1>
            <p style={{fontSize:16,color:'#6b7280',lineHeight:1.7,marginBottom:28}}>Credii Foundation is a Caribbean nonprofit building shared infrastructure for skills standards, digital verification, and trusted mobility pathways for youth, MSMEs, and communities across the Caribbean and its global diaspora.</p>
            <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
              <button onClick={()=>navigate('/login')} style={{padding:'10px 20px',borderRadius:8,border:'none',background:'#1a2744',color:'#fff',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Explore Our Platform →</button>
              <button onClick={()=>document.getElementById('membership').scrollIntoView({behavior:'smooth'})} style={{padding:'10px 20px',borderRadius:8,border:'2px solid #1a2744',background:'transparent',color:'#1a2744',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Become a Member</button>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {['Pan-Caribbean','Youth-Focused','MSME-Powered','SDG-Aligned','ESG-Embedded','IDPAD-Committed'].map(t=><span key={t} style={{background:'#f3f4f6',color:'#374151',fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:20}}>{t}</span>)}
            </div>
          </div>
          <div style={{background:'#1a2744',borderRadius:20,padding:28,color:'#fff',boxShadow:'0 20px 60px rgba(26,39,68,0.3)'}}>
            <div style={{fontSize:10,fontWeight:700,color:'#F39C12',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>Caribbean Nonprofit Digital Trust Authority</div>
            <h2 style={{fontSize:22,fontWeight:800,marginBottom:10}}>Building a Future-Ready Caribbean</h2>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.7)',lineHeight:1.6,marginBottom:20}}>Trusted digital infrastructure and verifiable credentials for every Caribbean citizen.</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
              {[{val:'4',label:'Architecture Layers'},{val:'7',label:'Capability Pillars'},{val:'10+',label:'SDGs Aligned'},{val:'🌍',label:'Pan-Caribbean'}].map(m=>(
                <div key={m.label} style={{background:'rgba(255,255,255,0.08)',borderRadius:10,padding:12,textAlign:'center'}}>
                  <div style={{fontSize:24,fontWeight:800,color:'#F39C12'}}>{m.val}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',marginTop:2}}>{m.label}</div>
                </div>
              ))}
            </div>
            <div>{['SDG 4','SDG 5','SDG 8','SDG 9','SDG 10','SDG 17','ESG','IDPAD'].map(s=><span key={s} style={{display:'inline-flex',alignItems:'center',padding:'2px 7px',borderRadius:4,fontSize:10,fontWeight:700,background:'rgba(255,255,255,0.1)',color:'#F39C12',margin:'2px'}}>{s}</span>)}</div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section id="pillars" style={{padding:'80px 24px',background:'#fff'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#1abc9c',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>Seven-Pillar Architecture</div>
          <h2 style={{fontSize:34,fontWeight:800,color:'#1a2744',marginBottom:14}}>Seven Capability Pillars. One Regional System.</h2>
          <p style={{fontSize:16,color:'#6b7280',lineHeight:1.7,marginBottom:48,maxWidth:700}}>Every pillar addresses a critical gap in Caribbean capability, credentialing, and digital infrastructure — grounded in Caribbean identity and global standards.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {PILLARS.map(p=>(
              <div key={p.num} style={{background:'#fff',borderRadius:12,border:'1.5px solid #e5e7eb',padding:20,transition:'all 0.2s',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#C0392B'} onMouseLeave={e=>e.currentTarget.style.borderColor='#e5e7eb'}>
                <div style={{fontSize:28,marginBottom:10}}>{p.icon}</div>
                <div style={{fontSize:11,fontWeight:700,color:'#1abc9c',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>Pillar {p.num}</div>
                <div style={{fontSize:13,fontWeight:700,color:'#1a2744',lineHeight:1.4}}>{p.title}</div>
                <span style={{display:'inline-flex',alignItems:'center',padding:'2px 7px',borderRadius:4,fontSize:10,fontWeight:700,background:'#1a2744',color:'#F39C12',marginTop:8}}>{p.sdg}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:'60px 24px',background:'#C0392B'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',gap:40,flexWrap:'wrap'}}>
          <div>
            <h2 style={{fontSize:28,fontWeight:800,color:'#fff',marginBottom:8}}>Start Your Credii Journey Today</h2>
            <p style={{fontSize:15,color:'rgba(255,255,255,0.8)'}}>Join Caribbean learners, MSMEs, and institutions building verified digital credentials.</p>
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <button onClick={()=>navigate('/login')} style={{padding:'10px 20px',borderRadius:8,border:'none',background:'#F39C12',color:'#1a2744',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>🎓 Start Learning</button>
            <button onClick={()=>document.getElementById('membership').scrollIntoView({behavior:'smooth'})} style={{padding:'10px 20px',borderRadius:8,border:'2px solid rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.15)',color:'#fff',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Become a Member</button>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP */}
      <section id="membership" style={{padding:'80px 24px',background:'#f8f9fa'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#1abc9c',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>Membership Program</div>
          <h2 style={{fontSize:34,fontWeight:800,color:'#1a2744',marginBottom:14}}>Join the Caribbean's Digital Trust Coalition.</h2>
          <p style={{fontSize:16,color:'#6b7280',lineHeight:1.7,marginBottom:48,maxWidth:700}}>Build a regional coalition of ministries, institutions, employers, and MSMEs committed to trusted, portable credentials.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {MEMBERSHIP.map(m=>(
              <div key={m.tier} style={{background:m.featured?'#1a2744':'#fff',borderRadius:14,border:m.featured?'none':'1.5px solid #e5e7eb',padding:24,display:'flex',flexDirection:'column',gap:10,position:'relative'}}>
                {m.featured && <div style={{position:'absolute',top:-12,right:16,background:'#F39C12',color:'#1a2744',fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:20}}>⭐ Most Impactful</div>}
                <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',color:m.featured?'#F39C12':m.color}}>{m.tier} — {m.label}</div>
                <div style={{fontSize:28,fontWeight:800,color:m.featured?'#fff':'#1a2744'}}>{m.price}</div>
                <div style={{fontSize:12,color:m.featured?'rgba(255,255,255,0.7)':'#6b7280'}}>USD / year</div>
                <div style={{fontSize:12,color:m.featured?'rgba(255,255,255,0.8)':'#374151',paddingTop:8,borderTop:'1px solid rgba(0,0,0,0.06)'}}>{m.target}</div>
                <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:6,flex:1}}>
                  {m.benefits.map(b=><li key={b} style={{fontSize:12,display:'flex',gap:6,color:m.featured?'rgba(255,255,255,0.9)':'#374151'}}><span style={{color:m.featured?'#F39C12':'#1abc9c'}}>✓</span>{b}</li>)}
                </ul>
                <button onClick={()=>navigate('/login')} style={{width:'100%',padding:'10px',borderRadius:8,border:'none',background:m.featured?'#C0392B':'#1a2744',color:'#fff',fontWeight:700,cursor:'pointer',fontFamily:'inherit',marginTop:'auto'}}>Join Now →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VERIFY */}
      <section style={{padding:'80px 24px',background:'#fff'}}>
        <div style={{maxWidth:600,margin:'0 auto',textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#1abc9c',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>Credential Verification</div>
          <h2 style={{fontSize:34,fontWeight:800,color:'#1a2744',marginBottom:14}}>Verify a Credii Certificate</h2>
          <p style={{fontSize:16,color:'#6b7280',lineHeight:1.7,marginBottom:28}}>Every Credii credential is blockchain-verified and publicly auditable. Enter a credential ID to instantly verify its authenticity.</p>
          <div style={{display:'flex',gap:10}}>
            <input id="verifyInput" style={{flex:1,padding:'12px 16px',border:'2px solid #e5e7eb',borderRadius:10,fontSize:14,outline:'none',fontFamily:'inherit'}} placeholder="Enter Credential ID (e.g. CREDII-TT-2026-XXXXX)"/>
            <button onClick={()=>{const v=document.getElementById('verifyInput').value.trim();if(v)window.location.href=`/verify/${v}`;}} style={{padding:'12px 20px',borderRadius:10,border:'none',background:'#C0392B',color:'#fff',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>🔍 Verify</button>
          </div>
          <p style={{fontSize:12,color:'#9ca3af',marginTop:12}}>Powered by Polygon blockchain — tamper-proof and permanently verifiable</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#0f1a2e',padding:'60px 24px 0'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 2fr',gap:60,paddingBottom:40}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <div style={{width:38,height:38,background:'#C0392B',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:18,color:'#fff'}}>C</div>
              <span style={{fontSize:20,fontWeight:800,color:'#fff'}}>credii</span>
            </div>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.6)',lineHeight:1.6,maxWidth:280,marginBottom:12}}>The Caribbean's digital credentialing, trust, and access infrastructure — aligned with SDGs, ESG, and IDPAD. Registered Non-Profit Company Limited by Guarantee, Trinidad & Tobago.</p>
            <div>{['SDG 4','SDG 5','SDG 8','SDG 9','SDG 10','SDG 17','ESG','IDPAD'].map(s=><span key={s} style={{display:'inline-flex',alignItems:'center',padding:'2px 7px',borderRadius:4,fontSize:10,fontWeight:700,background:'rgba(255,255,255,0.1)',color:'#F39C12',margin:'2px 2px 2px 0'}}>{s}</span>)}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:40}}>
            {[{heading:'Architecture',links:['Four-Layer Model','Seven Pillars','Trust Framework','Digital Infrastructure']},{heading:'Organisation',links:["Who We Are","Founder's Story","Who We Serve","Dual-Entity Model"]},{heading:'Engage',links:['Become a Member','Fund a Program','Government Partnership','Contact Us']}].map(col=>(
              <div key={col.heading}>
                <div style={{fontSize:12,fontWeight:700,color:'#F39C12',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:14}}>{col.heading}</div>
                {col.links.map(l=><div key={l} style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:8,cursor:'pointer'}} onClick={()=>navigate('/login')}>{l}</div>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{maxWidth:1200,margin:'0 auto',borderTop:'1px solid rgba(255,255,255,0.08)',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,color:'rgba(255,255,255,0.4)'}}>
          <span>© 2026 Credii Foundation. Registered Non-Profit, Trinidad & Tobago.</span>
          <span>Built with ❤️ for the Caribbean</span>
        </div>
      </footer>
    </div>
  );
}