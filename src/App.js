import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LearnerLayout from './components/LearnerLayout';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import Verify from './pages/Verify';
import LearnerDashboard from './pages/learner/Dashboard';
import CourseLibrary from './pages/learner/CourseLibrary';
import CoursePage from './pages/learner/CoursePage';
import MyCredentials from './pages/learner/MyCredentials';
import MyProfile from './pages/learner/MyProfile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCourses from './pages/admin/Courses';
import AdminUsers from './pages/admin/Users';
import AdminCredentials from './pages/admin/Credentials';
import AdminImpact from './pages/admin/Impact';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();
  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:16}}>
      <div style={{width:48,height:48,border:'4px solid #e5e7eb',borderTop:'4px solid #C0392B',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{color:'#6b7280',fontSize:14}}>Loading Credii...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !['admin','instructor'].includes(profile?.role)) return <Navigate to="/learn" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/learn" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verify/:credentialId" element={<Verify />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/learn" element={<PrivateRoute><LearnerLayout /></PrivateRoute>}>
            <Route index element={<LearnerDashboard />} />
            <Route path="courses" element={<CourseLibrary />} />
            <Route path="courses/:courseId" element={<CoursePage />} />
            <Route path="credentials" element={<MyCredentials />} />
            <Route path="profile" element={<MyProfile />} />
          </Route>
          <Route path="/admin" element={<PrivateRoute adminOnly><AdminLayout /></PrivateRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="credentials" element={<AdminCredentials />} />
            <Route path="impact" element={<AdminImpact />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}