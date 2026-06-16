import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import './StudentAnalytics.css';

const EVENT_ICONS = {
  HINT_USED: '💡',
  CHAT_MESSAGE: '💬',
  CODE_SUBMITTED: '📤',
  CODE_RUN: '▶️',
  ERROR_FOUND: '❌',
  SOLUTION_COMPLETED: '✅',
  TASK_OPENED: '📂',
  TASK_CLOSED: '📁'
};

const StudentAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/analytics/student/${id}/overview`);
        setData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!data) return <div className="empty-state"><p>Student not found</p></div>;

  const { student, stats, avgSkills, taskAnalyses, submissions, eventSummary } = data;

  // Radar chart data
  const radarData = avgSkills.length > 0 ? avgSkills.map(s => ({
    skill: s.name.replace('Problem ', 'P. ').replace('Systematic ', 'Sys. '),
    score: s.avgScore,
    fullMark: 100
  })) : [];

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success-400)';
    if (score >= 60) return 'var(--warning-400)';
    return 'var(--danger-400)';
  };

  return (
    <div className="admin-page analytics-page">
      <div className="analytics-back">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/students')}>
          <HiOutlineArrowLeft /> Back to Students
        </button>
      </div>

      {/* Student Header */}
      <motion.div className="card student-header-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="student-header-avatar">
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className="student-header-info">
          <h2>{student.name}</h2>
          <p>{student.email} · Class {student.classSection}</p>
        </div>
        <div className="student-header-stats">
          <div className="student-header-stat">
            <div className="stat-number">{student.totalScore}</div>
            <div className="stat-text">Total Score</div>
          </div>
          <div className="student-header-stat">
            <div className="stat-number">{stats.tasksSolved}</div>
            <div className="stat-text">Solved</div>
          </div>
          <div className="student-header-stat">
            <div className="stat-number">{stats.totalHintsUsed}</div>
            <div className="stat-text">Hints</div>
          </div>
          <div className="student-header-stat">
            <div className="stat-number">{stats.totalAiChats}</div>
            <div className="stat-text">AI Chats</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.avgOverallScore ?? '—'}</div>
          <div className="stat-label">Avg AI Score</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats.totalSubmissions}</div>
          <div className="stat-label">Total Submissions</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{student.streak?.current || 0}</div>
          <div className="stat-label">Day Streak</div>
        </motion.div>
        <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="stat-icon">🧠</div>
          <div className="stat-value">{stats.analysesCompleted}</div>
          <div className="stat-label">AI Analyses</div>
        </motion.div>
      </div>

      <div className="analytics-grid">
        {/* Skill Radar Chart */}
        <motion.div className="card analytics-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3>📈 Skill Radar (Average)</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Radar dataKey="score" stroke="var(--primary-500)" fill="var(--primary-500)" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-analysis-msg">No AI analyses yet. Analyze a task to see the radar chart.</div>
          )}
        </motion.div>

        {/* Skill Scores */}
        <motion.div className="card analytics-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3>🎯 Skill Breakdown</h3>
          {avgSkills.length > 0 ? (
            <div className="skill-avg-list">
              {avgSkills.map((skill, i) => (
                <div key={i} className="skill-avg-item">
                  <span className="skill-avg-name">{skill.name}</span>
                  <div className="skill-avg-bar">
                    <div className="skill-avg-fill" style={{ width: `${skill.avgScore}%`, background: getScoreColor(skill.avgScore) }} />
                  </div>
                  <span className="skill-avg-score" style={{ color: getScoreColor(skill.avgScore) }}>{skill.avgScore}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-analysis-msg">Run an AI analysis on a task to see skill scores.</div>
          )}
        </motion.div>

        {/* Task Analyses */}
        <motion.div className="card analytics-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3>📋 Analyzed Tasks</h3>
          {taskAnalyses.length > 0 ? (
            <div className="analytics-task-list">
              {taskAnalyses.map((ta, i) => (
                <Link key={i} to={`/admin/students/${id}/tasks/${ta.task._id}`} className="analytics-task-row">
                  <div className="analytics-task-info">
                    <div className="analytics-task-title">{ta.task.title}</div>
                    <div className="analytics-task-meta">
                      <span className={`badge badge-${ta.task.difficulty}`}>{ta.task.difficulty}</span>
                      {ta.skill_evaluation?.overall_score != null && (
                        <span>AI: {ta.skill_evaluation.overall_score}/100</span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>→</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-analysis-msg">No task analyses yet.</div>
          )}
        </motion.div>

        {/* Event Summary */}
        <motion.div className="card analytics-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3>📊 Activity Summary</h3>
          {Object.keys(eventSummary).length > 0 ? (
            <div className="event-summary-grid">
              {Object.entries(eventSummary).map(([type, count]) => (
                <div key={type} className="event-summary-item">
                  <span className="event-summary-icon">{EVENT_ICONS[type] || '📌'}</span>
                  <span>{type.replace(/_/g, ' ')}</span>
                  <span className="event-summary-count">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-analysis-msg">No activity recorded yet.</div>
          )}
        </motion.div>
      </div>

      {/* Recent Submissions */}
      <motion.div className="card analytics-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h3>📤 Recent Submissions</h3>
        <div className="analytics-task-list">
          {submissions.length > 0 ? submissions.map((sub, i) => (
            <Link key={i} to={`/admin/students/${id}/tasks/${sub.task?._id}`} className="analytics-task-row">
              <span style={{ fontSize: '1.25rem' }}>
                {sub.status === 'passed' ? '✅' : sub.status === 'partial' ? '🟡' : '❌'}
              </span>
              <div className="analytics-task-info">
                <div className="analytics-task-title">{sub.task?.title || 'Unknown'}</div>
                <div className="analytics-task-meta">
                  <span>{sub.attempts} attempt{sub.attempts !== 1 ? 's' : ''}</span>
                  <span>{sub.hintsUsed} hints</span>
                  <span>{new Date(sub.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <span className="analytics-task-score">{sub.score} pts</span>
            </Link>
          )) : (
            <div className="no-analysis-msg">No submissions yet.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentAnalytics;
