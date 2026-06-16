import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { HiOutlineArrowLeft, HiOutlineSparkles, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import './ProblemAnalysis.css';

const EVENT_ICONS = {
  HINT_USED: '💡', CHAT_MESSAGE: '💬', CODE_SUBMITTED: '📤', CODE_RUN: '▶️',
  ERROR_FOUND: '❌', SOLUTION_COMPLETED: '✅', TASK_OPENED: '📂', TASK_CLOSED: '📁'
};

const getScoreColor = (score) => {
  if (score >= 80) return 'var(--success-400)';
  if (score >= 60) return 'var(--warning-400)';
  return 'var(--danger-400)';
};

const ProblemAnalysis = () => {
  const { studentId, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [student, setStudent] = useState(null);
  const [chatAnalysis, setChatAnalysis] = useState(null);
  const [skillEval, setSkillEval] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [events, setEvents] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, studentRes, chatRes, skillRes, feedbackRes, eventsRes] = await Promise.all([
          api.get(`/tasks/${taskId}`),
          api.get(`/admin/students/${studentId}`),
          api.get(`/analytics/chat/${studentId}/${taskId}`).catch(() => ({ data: { result: null } })),
          api.get(`/analytics/skills/${studentId}/${taskId}`).catch(() => ({ data: { result: null } })),
          api.get(`/analytics/feedback/${studentId}/${taskId}`).catch(() => ({ data: { result: null } })),
          api.get(`/analytics/student/${studentId}/tasks/${taskId}/events`).catch(() => ({ data: [] }))
        ]);

        setTask(taskRes.data.task);
        setStudent(studentRes.data.student);
        setChatAnalysis(chatRes.data.result);
        setSkillEval(skillRes.data.result);
        setFeedback(feedbackRes.data.result);
        setEvents(eventsRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };

    fetchData();
  }, [studentId, taskId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const { data } = await api.post(`/analytics/analyze/${studentId}/${taskId}`);
      setChatAnalysis(data.chatAnalysis);
      setSkillEval(data.skillEvaluation);
      setFeedback(data.feedback);
      toast.success(data.cached ? 'Loaded from cache (no new data)' : 'AI analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally { setAnalyzing(false); }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!task) return <div className="empty-state"><p>Task not found</p></div>;

  // Radar chart data from skill evaluation
  const radarData = skillEval?.skills?.map(s => ({
    skill: s.name.replace('Problem ', 'P. ').replace('Systematic ', 'Sys. '),
    score: s.score,
    fullMark: 100
  })) || [];

  return (
    <div className="admin-page problem-analysis-page">
      {/* Top Bar */}
      <div className="problem-analysis-topbar">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/students/${studentId}/analytics`)}>
          <HiOutlineArrowLeft /> Back to {student?.name || 'Student'}
        </button>
        <div className="topbar-actions">
          <Link to={`/admin/students/${studentId}/tasks/${taskId}/chat`} className="btn btn-secondary btn-sm">
            <HiOutlineChatBubbleLeftRight /> View Chat
          </Link>
          <button className="btn btn-primary btn-sm" onClick={handleAnalyze} disabled={analyzing}>
            <HiOutlineSparkles /> {analyzing ? 'Analyzing...' : skillEval ? 'Re-Analyze' : 'Analyze with AI'}
          </button>
        </div>
      </div>

      {/* Problem Info */}
      <motion.div className="card problem-info-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2>
          {task.title}
          <span className={`badge badge-${task.difficulty}`}>{task.difficulty}</span>
          <span className="badge badge-primary">{task.points} pts</span>
        </h2>
        <div className="problem-desc">{task.description}</div>
      </motion.div>

      {/* Analyzing overlay */}
      {analyzing && (
        <div className="card analyzing-overlay">
          <div className="spinner"></div>
          <p>AI is analyzing the student's work... This may take a few seconds.</p>
        </div>
      )}

      {/* Analysis Content */}
      {!analyzing && (
        <>
          <div className="analysis-content-grid">
            {/* Radar Chart */}
            <motion.div className="card analysis-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3>🎯 8-Skill Evaluation</h3>
              {radarData.length > 0 ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(skillEval.overall_score) }}>
                      {skillEval.overall_score}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>/100 overall</span>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData} outerRadius="70%">
                      <PolarGrid stroke="var(--border-color)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
                      <Radar dataKey="score" stroke="var(--primary-500)" fill="var(--primary-500)" fillOpacity={0.3} strokeWidth={2} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="no-analysis-msg">Click "Analyze with AI" to generate the evaluation.</div>
              )}
            </motion.div>

            {/* Chat Analysis Scores */}
            <motion.div className="card analysis-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3>💬 Chat Analysis</h3>
              {chatAnalysis ? (
                <>
                  <div className="score-gauges">
                    {[
                      { label: 'Understanding', value: chatAnalysis.understanding_score },
                      { label: 'AI Dependency', value: chatAnalysis.dependency_on_ai },
                      { label: 'Critical Think.', value: chatAnalysis.critical_thinking },
                      { label: 'Confidence', value: chatAnalysis.confidence_level }
                    ].map((g, i) => (
                      <div key={i} className="score-gauge">
                        <div className="gauge-value" style={{ color: g.label === 'AI Dependency' ? (g.value > 60 ? 'var(--danger-400)' : 'var(--success-400)') : getScoreColor(g.value) }}>
                          {g.value}
                        </div>
                        <div className="gauge-label">{g.label}</div>
                        <div className="gauge-bar">
                          <div className="gauge-bar-fill" style={{
                            width: `${g.value}%`,
                            background: g.label === 'AI Dependency' ? (g.value > 60 ? 'var(--danger-400)' : 'var(--success-400)') : getScoreColor(g.value)
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ marginTop: 'var(--spacing-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {chatAnalysis.summary}
                  </p>
                </>
              ) : (
                <div className="no-analysis-msg">Click "Analyze with AI" to see chat analysis.</div>
              )}
            </motion.div>
          </div>

          {/* Skill Detail Cards */}
          {skillEval?.skills && (
            <motion.div className="card analysis-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h3>📊 Skill Details</h3>
              <div className="skill-cards-list">
                {skillEval.skills.map((skill, i) => (
                  <div key={i} className="skill-eval-card" style={{ borderLeftColor: getScoreColor(skill.score) }}>
                    <div className="skill-eval-header">
                      <span className="skill-eval-name">{skill.name}</span>
                      <span className="skill-eval-score" style={{ color: getScoreColor(skill.score) }}>{skill.score}/100</span>
                    </div>
                    <div className="skill-eval-feedback">{skill.feedback}</div>
                    <div className="skill-tags">
                      {skill.strengths?.map((s, j) => (
                        <span key={`s-${j}`} className="skill-tag strength">✓ {s}</span>
                      ))}
                      {skill.weaknesses?.map((w, j) => (
                        <span key={`w-${j}`} className="skill-tag weakness">△ {w}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Feedback & Strengths/Weaknesses */}
          {feedback && (
            <motion.div className="card feedback-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h3>📝 AI Feedback</h3>
              <div className="feedback-markdown" dangerouslySetInnerHTML={{
                __html: (feedback.feedback_markdown || '')
                  .replace(/## (.*)/g, '<h2>$1</h2>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n- /g, '<br>• ')
                  .replace(/\n/g, '<br>')
              }} />

              <div className="sw-grid">
                <div className="sw-card strengths">
                  <h4>💪 Strengths</h4>
                  <ul>
                    {feedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="sw-card weaknesses">
                  <h4>📈 Areas to Improve</h4>
                  <ul>
                    {feedback.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>

              {feedback.recommended_topics?.length > 0 && (
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>📚 Recommended Topics</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {feedback.recommended_topics.map((t, i) => (
                      <span key={i} className="badge badge-primary">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Event Timeline */}
          <motion.div className="card analysis-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h3>📅 Event Timeline ({events.length})</h3>
            {events.length > 0 ? (
              <div className="event-timeline">
                {events.map((event, i) => (
                  <div key={i} className="event-timeline-item">
                    <span className="event-timeline-icon">{EVENT_ICONS[event.type] || '📌'}</span>
                    <div>
                      <div className="event-timeline-type">{event.type.replace(/_/g, ' ')}</div>
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {Object.entries(event.metadata).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                        </div>
                      )}
                    </div>
                    <span className="event-timeline-time">
                      {new Date(event.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-analysis-msg">No events recorded for this task.</div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ProblemAnalysis;
