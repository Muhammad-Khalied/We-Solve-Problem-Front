import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import './ChatAnalysis.css';

const getScoreColor = (score) => {
  if (score >= 80) return 'var(--success-400)';
  if (score >= 60) return 'var(--warning-400)';
  return 'var(--danger-400)';
};

const ChatAnalysis = () => {
  const { studentId, taskId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [task, setTask] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatAnalysis, setChatAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, taskRes, chatAnalysisRes] = await Promise.all([
          api.get(`/admin/students/${studentId}`),
          api.get(`/tasks/${taskId}`),
          api.get(`/analytics/chat/${studentId}/${taskId}`).catch(() => ({ data: { result: null } }))
        ]);

        setStudent(studentRes.data.student);
        setTask(taskRes.data.task);
        setChatAnalysis(chatAnalysisRes.data.result);

        // Get chat history from student details
        const chatLog = studentRes.data.chatLogs?.find(
          c => c.task?._id === taskId || c.task === taskId
        );
        setChatHistory(chatLog?.messages || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [studentId, taskId]);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="admin-page chat-analysis-page">
      {/* Back */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/students/${studentId}/tasks/${taskId}`)}>
          <HiOutlineArrowLeft /> Back to Problem Analysis
        </button>
      </div>

      {/* Header */}
      <motion.div className="page-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Chat Analysis: {task?.title || 'Task'}</h1>
        <p>Student: {student?.name || 'Unknown'} · {chatHistory.length} messages</p>
      </motion.div>

      {/* Score Cards */}
      {chatAnalysis && (
        <motion.div className="chat-score-row" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="chat-score-card understanding">
            <div className="chat-score-value" style={{ color: getScoreColor(chatAnalysis.understanding_score) }}>
              {chatAnalysis.understanding_score}
            </div>
            <div className="chat-score-label">Understanding</div>
          </div>
          <div className="chat-score-card dependency">
            <div className="chat-score-value" style={{ color: chatAnalysis.dependency_on_ai > 60 ? 'var(--danger-400)' : 'var(--success-400)' }}>
              {chatAnalysis.dependency_on_ai}
            </div>
            <div className="chat-score-label">AI Dependency</div>
          </div>
          <div className="chat-score-card thinking">
            <div className="chat-score-value" style={{ color: getScoreColor(chatAnalysis.critical_thinking) }}>
              {chatAnalysis.critical_thinking}
            </div>
            <div className="chat-score-label">Critical Thinking</div>
          </div>
          <div className="chat-score-card confidence">
            <div className="chat-score-value" style={{ color: getScoreColor(chatAnalysis.confidence_level) }}>
              {chatAnalysis.confidence_level}
            </div>
            <div className="chat-score-label">Confidence</div>
          </div>
        </motion.div>
      )}

      {/* Summary */}
      {chatAnalysis && (
        <motion.div className="card chat-analysis-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>📝 AI Summary</h3>
          <p>{chatAnalysis.summary}</p>

          <div className="sw-grid" style={{ marginTop: 'var(--spacing-md)' }}>
            <div className="sw-card strengths">
              <h4>💪 Strengths</h4>
              <ul>
                {chatAnalysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="sw-card weaknesses">
              <h4>📈 Areas to Improve</h4>
              <ul>
                {chatAnalysis.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>

          {chatAnalysis.recommendations?.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <h4 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>💡 Recommendations</h4>
              <ul className="recommendations-list">
                {chatAnalysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {!chatAnalysis && (
        <div className="card" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            No chat analysis available. Go to the Problem Analysis page and click "Analyze with AI" first.
          </p>
        </div>
      )}

      {/* Chat Replay */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ padding: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>💬 Chat Replay ({chatHistory.length} messages)</h3>
        {chatHistory.length > 0 ? (
          <div className="chat-replay">
            {chatHistory.map((msg, i) => {
              const isHintRequest = msg.content?.includes('[Hint') && msg.content?.includes('requested]');
              return (
                <div key={i} className={`chat-replay-msg ${msg.role}`}>
                  <div className={`chat-replay-bubble ${isHintRequest ? 'highlight' : ''}`}>
                    {msg.content}
                  </div>
                  {msg.timestamp && (
                    <span className="chat-replay-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-analysis-msg">No chat messages for this task.</div>
        )}
      </motion.div>
    </div>
  );
};

export default ChatAnalysis;
