import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, studentsRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/students')
        ]);
        setAnalytics(analyticsRes.data);
        setStudents(studentsRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  const chartData = analytics?.topTasks?.map(t => ({
    name: t.task?.title?.substring(0, 15) + '...',
    completions: t.completions
  })) || [];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview and analytics</p>
      </div>

      <div className="stats-grid">
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stat-icon">👥</div>
          <div className="stat-value">{analytics?.totalStudents || 0}</div>
          <div className="stat-label">Total Students</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon">📝</div>
          <div className="stat-value">{analytics?.totalTasks || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-icon">📤</div>
          <div className="stat-value">{analytics?.totalSubmissions || 0}</div>
          <div className="stat-label">Total Submissions</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="stat-icon">✅</div>
          <div className="stat-value">{analytics?.passRate || 0}%</div>
          <div className="stat-label">Pass Rate</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="stat-icon">🤖</div>
          <div className="stat-value">{analytics?.totalChats || 0}</div>
          <div className="stat-label">AI Conversations</div>
        </motion.div>
      </div>

      <div className="admin-grid">
        {/* Top Tasks Chart */}
        <div className="card admin-section">
          <h3>Most Completed Tasks</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1A1F35', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '8px', color: '#F1F5F9' }} />
                <Bar dataKey="completions" fill="#6C63FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No data yet</p></div>
          )}
        </div>

        {/* Student List */}
        <div className="card admin-section">
          <div className="section-header">
            <h3>Students</h3>
            <Link to="/admin/students" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          <div className="admin-students-list">
            {students.slice(0, 8).map((s) => (
              <div key={s._id} className="admin-student-row" style={{ cursor: 'pointer' }}
                onClick={() => window.location.href = `/admin/students/${s._id}/analytics`}>
                <div className="admin-student-info">
                  <span className="table-avatar">{s.name.charAt(0).toUpperCase()}</span>
                  <div>
                    <span className="admin-student-name">{s.name}</span>
                    <span className="admin-student-class">{s.classSection || 'N/A'}</span>
                  </div>
                </div>
                <div className="admin-student-stats">
                  <span>✅ {s.tasksCompleted}</span>
                  <span>⭐ {s.totalScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
