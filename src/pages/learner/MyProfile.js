import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function MyProfile() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({ full_name:profile?.full_name||'', organisation:profile?.organisation||'', country:profile?.country||'Trinidad and Tobago', bio:profile?.bio||'', linkedin:profile?.linkedin||'', phone:profile?.phone||'' });
  const [passwords, setPasswords] = useState({ newPass:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  function set(f,v) { setForm(x=>({...x,[f]:v})); }
  function setP(f,v) { setPasswords(x=>({...x,[f]:v})); }
  function showToast(msg,type='success') { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }

  async function saveProfile() {
    if (!form.full_name.trim()) return showToast('Name is required','error');
    setSaving(true);
    const { error } = await supabase.from('credii_profiles').update(form).eq('id', profile.id);
    if (error) showToast(error.message,'error');
    else { await refreshProfile(); showToast('Profile updated!'); }
    setSaving(false);
  }

  async function changePassword() {
    if (passwords.newPass.length<6) return showToast('Password must be at least 6 characters','error');
    if (passwords.newPass!==passwords.confirm) return showToast('Passwords do not match','error');
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.newPass });
    if (error) showToast(error.message,'error');
    else { showToast('Password updated!'); setPasswords({newPass:'',confirm:''}); }
    setSaving(false);
  }

  const initials = profile?.full_name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'??';

  return (
    <div style={{maxWidth:700}}>
      {toast && <div className={`cf-toast cf-toast-${toast.type}`}>{toast.msg}</div>}
      <div className="cf-page-header"><div><div className="cf-page-title">My Profile</div><div className="cf-page-subtitle">Manage your Credii digital identity</div></div></div>

      <div style={{background:'linear-gradient(135deg,#1a2744,#C0392B)',borderRadius:16,padding:28,color:'#fff',marginBottom:24,display:'flex',alignItems:'center',gap:20}}>
        <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:800,border:'3px solid rgba(255,255,255,0.3)',flexShrink:0}}>{initials}</div>
        <div>
          <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>{profile?.full_name}</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,0.7)',marginBottom:8}}>{profile?.email}</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <span className="cf-badge" style={{background:'rgba(255,255,255,0.15)',color:'#fff',fontSize:11}}>🇹🇹 {profile?.country||'Trinidad and Tobago'}</span>
            <span className="cf-badge" style={{background:'rgba(243,156,18,0.3)',color:'#F39C12',fontSize:11}}>🎓 {profile?.role||'Learner'}</span>
          </div>
        </div>
      </div>

      <div className="cf-card" style={{marginBottom:20}}>
        <div className="cf-card-header"><span className="cf-card-title">Edit Profile</span></div>
        <div className="cf-card-body">
          <div className="cf-form-row">
            <div className="cf-form-group"><label>Full Name *</label><input value={form.full_name} onChange={e=>set('full_name',e.target.value)} placeholder="Your full name"/></div>
            <div className="cf-form-group"><label>Organisation</label><input value={form.organisation} onChange={e=>set('organisation',e.target.value)} placeholder="Company or institution"/></div>
          </div>
          <div className="cf-form-row">
            <div className="cf-form-group"><label>Country</label><select value={form.country} onChange={e=>set('country',e.target.value)}><option>Trinidad and Tobago</option><option>Jamaica</option><option>Barbados</option><option>Guyana</option><option>Bahamas</option><option>Saint Lucia</option><option>Other Caribbean</option><option>Diaspora</option></select></div>
            <div className="cf-form-group"><label>Phone</label><input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+1 (868) 000-0000"/></div>
          </div>
          <div className="cf-form-group"><label>LinkedIn URL</label><input value={form.linkedin} onChange={e=>set('linkedin',e.target.value)} placeholder="https://linkedin.com/in/yourname"/></div>
          <div className="cf-form-group"><label>Bio</label><textarea rows={3} value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Tell us about yourself..."/></div>
          <button className="cf-btn cf-btn-primary" onClick={saveProfile} disabled={saving}>{saving?'Saving...':'💾 Save Profile'}</button>
        </div>
      </div>

      <div className="cf-card" style={{marginBottom:20}}>
        <div className="cf-card-header"><span className="cf-card-title">🔐 Change Password</span></div>
        <div className="cf-card-body">
          <div className="cf-form-row">
            <div className="cf-form-group"><label>New Password</label><input type="password" value={passwords.newPass} onChange={e=>setP('newPass',e.target.value)} placeholder="Min. 6 characters"/></div>
            <div className="cf-form-group"><label>Confirm Password</label><input type="password" value={passwords.confirm} onChange={e=>setP('confirm',e.target.value)} placeholder="Repeat new password"/></div>
          </div>
          <button className="cf-btn cf-btn-navy" onClick={changePassword} disabled={saving}>{saving?'Updating...':'🔐 Update Password'}</button>
        </div>
      </div>

      <div className="cf-card">
        <div className="cf-card-header"><span className="cf-card-title">🔒 Privacy & Data Rights</span></div>
        <div className="cf-card-body">
          {[{icon:'🔒',title:'You own your data',desc:'Your credentials and profile data belong to you. Credii Foundation acts as a trusted custodian, not an owner.',bg:'#f5f3ff',color:'#5b21b6'},{icon:'🔗',title:'Blockchain-anchored identity',desc:'Your credentials are permanently recorded on the Polygon blockchain — tamper-proof and independently verifiable.',bg:'#f0fdf4',color:'#065f46'},{icon:'🌍',title:'Portable credentials',desc:'Your Credii credentials can be shared with employers, funders, and institutions anywhere via a simple verification link.',bg:'#eff6ff',color:'#1e40af'}].map(item=>(
            <div key={item.title} style={{display:'flex',gap:12,padding:14,background:item.bg,borderRadius:10,marginBottom:10}}>
              <span style={{fontSize:20}}>{item.icon}</span>
              <div><div style={{fontWeight:700,fontSize:13,color:item.color,marginBottom:3}}>{item.title}</div><div style={{fontSize:12,color:'#374151',lineHeight:1.5}}>{item.desc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}