import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  async function handleSignOut() { await signOut(); navigate('/login'); }

  return (
    <div className={`cf-layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="cf-sidebar cf-sidebar-admin">
        <div className="cf-sidebar-header">
          <div className="cf-logo">
            <div className="cf-logo-icon">C</div>
            {!collapsed && <span className="cf-logo-text">credii <span style={{fontSize:10,background:'#F39C12',color:'#1a2744',padding:'1px 6px',borderRadius:4,marginLeft:4}}>ADMIN</span></span>}
          </div>
          <button className="cf-collapse-btn" onClick={() => setCollapsed(c => !c)}>{collapsed ? '→' : '←'}</button>
        </div>
        <div className="cf-sidebar-user">
          <div className="cf-avatar cf-avatar-gold">{initials}</div>
          {!collapsed && <div className="cf-user-info"><div className="cf-user-name">{profile?.full_name || 'Admin'}</div><div className="cf-user-role">⚙️ {profile?.role === 'admin' ? 'Administrator' : 'Instructor'}</div></div>}
        </div>
        <nav className="cf-nav">
          {!collapsed && <div className="cf-nav-section">Management</div>}
          <NavLink to="/admin" end className={({isActive}) => `cf-nav-item ${isActive?'active':''}`}><span className="cf-nav-icon">📊</span>{!collapsed && <span>Dashboard</span>}</NavLink>
          <NavLink to="/admin/courses" className={({isActive}) => `cf-nav-item ${isActive?'active':''}`}><span className="cf-nav-icon">📚</span>{!collapsed && <span>Courses</span>}</NavLink>
          <NavLink to="/admin/users" className={({isActive}) => `cf-nav-item ${isActive?'active':''}`}><span className="cf-nav-icon">👥</span>{!collapsed && <span>Users</span>}</NavLink>
          <NavLink to="/admin/credentials" className={({isActive}) => `cf-nav-item ${isActive?'active':''}`}><span className="cf-nav-icon">🏆</span>{!collapsed && <span>Credentials</span>}</NavLink>
          <NavLink to="/admin/impact" className={({isActive}) => `cf-nav-item ${isActive?'active':''}`}><span className="cf-nav-icon">🌍</span>{!collapsed && <span>Impact Report</span>}</NavLink>
          {!collapsed && <div className="cf-nav-section">Navigation</div>}
          <button className="cf-nav-item" onClick={() => navigate('/learn')}><span className="cf-nav-icon">🎓</span>{!collapsed && <span>Learner View</span>}</button>
        </nav>
        <div className="cf-sidebar-footer">
          <button className="cf-nav-item cf-signout" onClick={handleSignOut}><span className="cf-nav-icon">🚪</span>{!collapsed && <span>Sign Out</span>}</button>
        </div>
      </aside>
      <div className="cf-main">
        <header className="cf-topbar">
          <div className="cf-topbar-left"><div className="cf-breadcrumb">Credii Admin — Trinidad & Tobago Pilot</div></div>
          <div className="cf-topbar-right">
            <div className="cf-tt-badge" style={{background:'#F39C12',color:'#1a2744'}}>⚙️ Admin Mode</div>
            <div className="cf-avatar cf-avatar-gold" style={{width:36,height:36,fontSize:13}}>{initials}</div>
          </div>
        </header>
        <main className="cf-page-content"><Outlet /></main>
      </div>
    </div>
  );
}