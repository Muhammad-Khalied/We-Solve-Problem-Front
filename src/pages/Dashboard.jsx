import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/submissions/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  const COLORS = ['#6C63FF', '#EC4899', '#22C55E', '#F59E0B', '#06B6D4'];

  const pieData = stats?.subjectProgress?.map((s, i) => ({
    name: s.subject.name,
    value: s.completedTasks || 1,
    color: COLORS[i % COLORS.length]
  })) || [];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Track your progress and keep solving! 🚀</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats?.totalScore || 0}</div>
          <div className="stat-label">Total Score</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats?.completedTasks || 0}<span className="stat-total">/{stats?.totalTasks || 0}</span></div>
          <div className="stat-label">Tasks Completed</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{stats?.skillsMastered || 0}<span className="stat-total">/{stats?.totalSkills || 0}</span></div>
          <div className="stat-label">Skills Mastered</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats?.streak?.current || 0}</div>
          <div className="stat-label">Day Streak</div>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        {/* Subject Progress */}
        <motion.div className="card dashboard-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3>Subject Progress</h3>
          <div className="subject-progress-list">
            {stats?.subjectProgress?.map((sp) => (
              <div className="subject-progress-item" key={sp.subject.id}>
                <div className="subject-progress-header">
                  <span className="subject-icon">{sp.subject.icon}</span>
                  <span className="subject-name">{sp.subject.name}</span>
                  <span className="subject-percent">{sp.progress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${sp.progress}%`, background: sp.subject.color }}></div>
                </div>
                <span className="subject-detail">{sp.completedTasks}/{sp.totalTasks} tasks</span>
              </div>
            ))}
          </div>
          <Link to="/roadmap" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
            Continue Learning →
          </Link>
        </motion.div>

        {/* Activity Chart */}
        <motion.div className="card dashboard-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3>Completion Overview</h3>
          {pieData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1A1F35', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '8px', color: '#F1F5F9' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {pieData.map((entry, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-color" style={{ background: entry.color }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state"><div className="empty-icon">📊</div><p>Complete some tasks to see your progress chart</p></div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div className="card dashboard-section full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3>Recent Activity</h3>
          {stats?.recentActivity?.length > 0 ? (
            <div className="activity-list">
              {stats.recentActivity.map((activity, i) => (
                <div className="activity-item" key={i}>
                  <span className={`activity-status ${activity.status}`}>
                    {activity.status === 'passed' ? '✅' : activity.status === 'partial' ? '🟡' : '❌'}
                  </span>
                  <div className="activity-info">
                    <span className="activity-title">{activity.task?.title}</span>
                    <span className="activity-meta">
                      <span className={`badge badge-${activity.task?.difficulty}`}>{activity.task?.difficulty}</span>
                      Score: {activity.score}/{activity.task?.points}
                    </span>
                  </div>
                  <span className="activity-time">
                    {new Date(activity.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-icon">📝</div><p>No activity yet. Start solving tasks!</p></div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
