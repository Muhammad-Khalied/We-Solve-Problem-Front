import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import SkillDetail from './pages/SkillDetail';
import TaskPage from './pages/TaskPage';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminContent from './pages/AdminContent';
import StudentAnalytics from './pages/StudentAnalytics';
import ProblemAnalysis from './pages/ProblemAnalysis';
import ChatAnalysis from './pages/ChatAnalysis';
import AIContentGenerator from './pages/AIContentGenerator';
import AdminRoadmap from './pages/AdminRoadmap';
import './App.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

import { useState, useEffect } from 'react';

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="main-content">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        {children}
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loader" style={{ height: '100vh' }}><div className="spinner"></div></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/roadmap" element={
        <ProtectedRoute><AppLayout><Roadmap /></AppLayout></ProtectedRoute>
      } />
      <Route path="/skills/:id" element={
        <ProtectedRoute><AppLayout><SkillDetail /></AppLayout></ProtectedRoute>
      } />
      <Route path="/tasks/:id" element={
        <ProtectedRoute><AppLayout><TaskPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute><AppLayout><Leaderboard /></AppLayout></ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/admin/students" element={
        <ProtectedRoute adminOnly><AppLayout><AdminStudents /></AppLayout></ProtectedRoute>
      } />
      <Route path="/admin/content" element={
        <ProtectedRoute adminOnly><AppLayout><AdminContent /></AppLayout></ProtectedRoute>
      } />
      <Route path="/admin/students/:id/analytics" element={
        <ProtectedRoute adminOnly><AppLayout><StudentAnalytics /></AppLayout></ProtectedRoute>
      } />
      <Route path="/admin/students/:studentId/tasks/:taskId" element={
        <ProtectedRoute adminOnly><AppLayout><ProblemAnalysis /></AppLayout></ProtectedRoute>
      } />
      <Route path="/admin/students/:studentId/tasks/:taskId/chat" element={
        <ProtectedRoute adminOnly><AppLayout><ChatAnalysis /></AppLayout></ProtectedRoute>
      } />
      <Route path="/admin/ai-generator" element={
        <ProtectedRoute adminOnly><AppLayout><AIContentGenerator /></AppLayout></ProtectedRoute>
      } />
      <Route path="/admin/roadmap-editor" element={
        <ProtectedRoute adminOnly><AppLayout><AdminRoadmap /></AppLayout></ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

// No extra imports needed, useState is handled above

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1A1F35',
            color: '#F1F5F9',
            border: '1px solid rgba(148, 163, 184, 0.12)',
            borderRadius: '12px'
          }
        }} />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
