import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email:'', password:'', fullName:'', role:'learner', country:'Trinidad and Tobago', confirmPassword:'' });

  function set(f,v) { setForm(x=>({...x,[f]:v})); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password);
      if (error) { setError(error.message); setLoading(false); }
      else navigate('/learn');
    } else if (mode === 'signup') {
      if (!form.fullName.trim()) { setError('Full name is required'); setLoading(false); return; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
      const { error } = await signUp(form.email, form.password, form.fullName, form.role, form.country);
      if (error) { setError(error.message); setLoading(false); }
      else { setMode('login'); setLoading(false); setSuccess(`✅ Account created! Welcome, ${form.fullName.split(' ')[0]}! Please sign in.`); }
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, { redirectTo: window.location.origin });
      if (error) setError(error.message);
      else setSuccess('📧 Reset email sent! Check your inbox.');
      setLoading(false);
    }
  }

  const styles = {
    page: { minHeight:'100vh', display:'flex', background:'linear-gradient(135deg, #1a2744 0%, #C0392B 100%)' },
    left: { width:'45%', padding:'60px 48px', display:'flex', flexDirection:'column', justifyContent:'center', color:'#fff' },
    right: { flex:1, background:'#f8f9fa', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' },
    card: { background:'#fff', borderRadius:20, padding:40, width:'100%', maxWidth:460, boxShadow:'0 10px 40px rgba(0,0,0,0.08)' },
    title: { fontSize:24, fontWeight:800, color:'#1a2744', marginBottom:6 },
    sub: { fontSize:14, color:'#6b7280', marginBottom:24 },
    group: { display:'flex', flexDirection:'column', gap:5, marginBottom:14 },
    label: { fontSize:13, fontWeight:600, color:'#1a2744' },
    input: { padding:'10px 12px', border:'1.5px solid #e5e7eb', borderRadius:8, fontSize:14, outline:'none', fontFamily:'inherit' },
    pwWrap: { position:'relative', display:'flex', alignItems:'center' },
    pwToggle: { position:'absolute', right:10, background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#9ca3af' },
    btn: { width:'100%', padding:'11px', background:'#C0392B', color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:700, cursor:'pointer', marginTop:4, fontFamily:'inherit' },
    success: { background:'#d1fae5', color:'#065f46', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:14, fontWeight:500 },
    error: { background:'#fde8e8', color:'#C0392B', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:14 },
    switch: { textAlign:'center', marginTop:20, fontSize:14, color:'#6b7280' },
    switchBtn: { background:'none', border:'none', color:'#C0392B', fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:'inherit' },
    note: { marginTop:20, padding:'12px 14px', background:'#fde8e8', borderRadius:8, fontSize:12, color:'#C0392B', lineHeight:1.5 },
    forgot: { background:'none', border:'none', color:'#C0392B', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', float:'right', marginBottom:8 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:32}}>
          <div style={{width:44,height:44,background:'#C0392B',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:18,color:'#fff',border:'2px solid rgba(255,255,255,0.3)'}}>C</div>
          <span style={{fontSize:24,fontWeight:800,letterSpacing:-0.5}}>credii</span>
        </div>
        <h1 style={{fontSize:34,fontWeight:800,lineHeight:1.2,marginBottom:14}}>Your Caribbean<br/><span style={{color:'#F39C12'}}>Digital Credential</span><br/>Starts Here.</h1>
        <p style={{fontSize:15,color:'rgba(255,255,255,0.75)',lineHeight:1.7,marginBottom:28}}>Join thousands of Caribbean learners, MSMEs, and institutions building verified, blockchain-anchored credentials.</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
          {[{val:'🇹🇹',label:'T&T Pilot'},{val:'7',label:'Capability Pillars'},{val:'4',label:'Architecture Layers'},{val:'🔗',label:'Blockchain Verified'}].map(s=>(
            <div key={s.label} style={{background:'rgba(255,255,255,0.1)',borderRadius:10,padding:12,textAlign:'center'}}>
              <div style={{fontSize:20,fontWeight:800,color:'#F39C12'}}>{s.val}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div>{['SDG 4','SDG 5','SDG 8','SDG 9','SDG 10','ESG','IDPAD'].map(s=><span key={s} style={{display:'inline-flex',alignItems:'center',padding:'2px 7px',borderRadius:4,fontSize:10,fontWeight:700,background:'#1a2744',color:'#F39C12',margin:'2px'}}>{s}</span>)}</div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <button style={{background:'none',border:'none',color:'#9ca3af',fontSize:13,cursor:'pointer',padding:0,marginBottom:20,fontFamily:'inherit'}} onClick={() => navigate('/')}>← Back to Home</button>
          <h2 style={styles.title}>{mode==='login'?'Welcome back':mode==='signup'?'Create your account':'Reset Password'}</h2>
          <p style={styles.sub}>{mode==='login'?'Sign in to your Credii account':mode==='signup'?'Join the Caribbean Digital Trust Coalition':'Enter your email to receive a reset link'}</p>
          {success && <div style={styles.success}>{success}</div>}
          <form onSubmit={handleSubmit} autoComplete="on">
            {mode==='signup' && <>
              <div style={styles.group}><label style={styles.label}>Full Name *</label><input style={styles.input} value={form.fullName} onChange={e=>set('fullName',e.target.value)} placeholder="Your full name" autoComplete="name" required/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div style={styles.group}><label style={styles.label}>Country</label><select style={styles.input} value={form.country} onChange={e=>set('country',e.target.value)}><option>Trinidad and Tobago</option><option>Jamaica</option><option>Barbados</option><option>Guyana</option><option>Bahamas</option><option>Saint Lucia</option><option>Other Caribbean</option><option>Diaspora</option></select></div>
                <div style={styles.group}><label style={styles.label}>I am a...</label><select style={styles.input} value={form.role} onChange={e=>set('role',e.target.value)}><option value="learner">Learner</option><option value="msme">MSME Owner</option><option value="instructor">Instructor</option><option value="admin">Administrator</option></select></div>
              </div>
            </>}
            <div style={styles.group}><label style={styles.label}>Email Address *</label><input style={styles.input} type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com" autoComplete="email" required/></div>
            {mode!=='forgot' && <>
              <div style={styles.group}>
                <label style={styles.label}>Password *</label>
                <div style={styles.pwWrap}>
                  <input style={{...styles.input,width:'100%',paddingRight:40}} type={showPassword?'text':'password'} value={form.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" autoComplete={mode==='login'?'current-password':'new-password'} required/>
                  <button type="button" style={styles.pwToggle} onClick={()=>setShowPassword(s=>!s)}>{showPassword?'🙈':'👁️'}</button>
                </div>
              </div>
              {mode==='login' && <button type="button" style={styles.forgot} onClick={()=>{setMode('forgot');setError('');setSuccess('');}}>Forgot password?</button>}
            </>}
            {mode==='signup' && <div style={styles.group}><label style={styles.label}>Confirm Password *</label><input style={styles.input} type="password" value={form.confirmPassword} onChange={e=>set('confirmPassword',e.target.value)} placeholder="Repeat password" autoComplete="new-password" required/></div>}
            {error && <div style={styles.error}>{error}</div>}
            <button style={styles.btn} type="submit" disabled={loading}>{loading?'Please wait...':mode==='login'?'Sign In →':mode==='signup'?'Create Account →':'Send Reset Email'}</button>
          </form>
          <div style={styles.switch}>
            {mode==='login' && <span>Don't have an account? <button style={styles.switchBtn} onClick={()=>{setMode('signup');setError('');setSuccess('');}}>Sign up free</button></span>}
            {mode==='signup' && <span>Already have an account? <button style={styles.switchBtn} onClick={()=>{setMode('login');setError('');setSuccess('');}}>Sign in</button></span>}
            {mode==='forgot' && <span>Remember it? <button style={styles.switchBtn} onClick={()=>{setMode('login');setError('');setSuccess('');}}>Sign in</button></span>}
          </div>
          {mode!=='forgot' && <div style={styles.note}>🔒 <strong>Privacy:</strong> Your credentials and data belong to you. Blockchain-anchored and tamper-proof.</div>}
        </div>
      </div>
    </div>
  );
}