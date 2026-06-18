import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function LearnerLayout() {
  const { profile, isAdmin, isInstructor, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  async function handleSignOut() { await signOut(); navigate('/login'); }

  return (
    <div className={`cf-layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="cf-sidebar">
        <div className="cf-sidebar-header">
          <div className="cf-logo">
            <div className="cf-logo-icon">C</div>
            {!collapsed && <span className="cf-logo-text">credii</span>}
          </div>
          <button className="cf-collapse-btn" onClick={() => setCollapsed(c => !c)}>{collapsed ? '→' : '←'}</button>
        </div>
        <div className="cf-sidebar-user">
          <div className="cf-avatar">{initials}</div>
          {!collapsed && <div className="cf-user-info"><div className="cf-user-name">{profile?.full_name || 'Learner'}</div><div className="cf-user-role">🎓 Learner</div></div>}
        </div>
        <nav className="cf-nav">
          {!collapsed && <div className="cf-nav-section">Learn</div>}
          <NavLink to="/learn" end className={({isActive}) => `cf-nav-item ${isActive?'active':''}`}><span className="cf-nav-icon">📊</span>{!collapsed && <span>Dashboard</span>}</NavLink>
          <NavLink to="/learn/courses" className={({isActive}) => `cf-nav-item ${isActive?'active':''}`}><span className="cf-nav-icon">📚</span>{!collapsed && <span>Course Library</span>}</NavLink>
          <NavLink to="/learn/credentials" className={({isActive}) => `cf-nav-item ${isActive?'active':''}`}><span className="cf-nav-icon">🏆</span>{!collapsed && <span>My Credentials</span>}</NavLink>
          <NavLink to="/learn/profile" className={({isActive}) => `cf-nav-item ${isActive?'active':''}`}><span className="cf-nav-icon">👤</span>{!collapsed && <span>My Profile</span>}</NavLink>
          {(isAdmin || isInstructor) && <>
            {!collapsed && <div className="cf-nav-section">Admin</div>}
            <button className="cf-nav-item" onClick={() => navigate('/admin')}><span className="cf-nav-icon">⚙️</span>{!collapsed && <span>Admin Panel</span>}</button>
          </>}
        </nav>
        <div className="cf-sidebar-footer">
          <button className="cf-nav-item cf-signout" onClick={handleSignOut}><span className="cf-nav-icon">🚪</span>{!collapsed && <span>Sign Out</span>}</button>
        </div>
      </aside>
      <div className="cf-main">
        <header className="cf-topbar">
          <div className="cf-topbar-left"><div className="cf-breadcrumb">Caribbean Digital Trust Infrastructure 🇹🇹</div></div>
          <div className="cf-topbar-right">
            <div className="cf-tt-badge">🇹🇹 T&T Pilot</div>
            <div className="cf-user-menu-wrap">
              <button className="cf-avatar" style={{width:36,height:36,fontSize:13}} onClick={() => setShowMenu(m => !m)}>{initials}</button>
              {showMenu && <div className="cf-user-menu">
                <div className="cf-user-menu-name">{profile?.full_name}</div>
                <div className="cf-user-menu-email">{profile?.email}</div>
                <div className="cf-user-menu-divider"/>
                <button onClick={() => { navigate('/learn/profile'); setShowMenu(false); }}>👤 My Profile</button>
                <button onClick={() => { navigate('/learn/credentials'); setShowMenu(false); }}>🏆 My Credentials</button>
                <button onClick={handleSignOut}>🚪 Sign Out</button>
              </div>}
            </div>
          </div>
        </header>
        <main className="cf-page-content"><Outlet /></main>
      </div>
    </div>
  );
}