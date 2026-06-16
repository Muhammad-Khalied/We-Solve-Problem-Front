import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import './SkillDetail.css';

const SkillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillRes, tasksRes] = await Promise.all([
          api.get(`/skills/${id}`),
          api.get(`/skills/${id}/tasks`)
        ]);
        setSkill(skillRes.data);
        setTasks(tasksRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'passed': return '✅';
      case 'partial': return '🟡';
      case 'failed': return '❌';
      default: return '⬜';
    }
  };

  return (
    <div className="skill-detail-page">
      <button className="btn btn-ghost" onClick={() => navigate('/roadmap')} style={{ marginBottom: '1rem' }}>
        <HiOutlineArrowLeft /> Back to Roadmap
      </button>

      <div className="skill-detail-header card">
        <span className="skill-detail-icon">{skill?.icon}</span>
        <div>
          <h1>{skill?.name}</h1>
          <p>{skill?.description}</p>
          <span className="badge badge-primary">{skill?.subject?.name}</span>
        </div>
      </div>

      <h2 style={{ margin: '1.5rem 0 1rem' }}>Tasks ({tasks.length})</h2>

      <div className="tasks-list">
        {tasks.map((task, i) => (
          <motion.div
            key={task._id}
            className="task-card card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/tasks/${task._id}`)}
          >
            <div className="task-card-left">
                <span className="task-status-emoji">{getStatusEmoji(task.status)}</span>
              <div className="task-info">
                <h4>{task.title}</h4>
                <div className="task-meta">
                  <span className={`badge badge-${task.difficulty}`}>{task.difficulty}</span>
                  <span className="task-type-badge">{task.type === 'code' ? '💻' : '📐'} {task.type}</span>
                  {task.language && <span className="task-lang">{task.language}</span>}
                </div>
              </div>
            </div>
            <div className="task-card-right">
                <span className="task-points">{task.bestScore > 0 ? `${task.bestScore}/` : ''}{task.points} pts</span>
                {task.attempts > 0 && <span className="task-attempts">{task.attempts} attempt{task.attempts !== 1 ? 's' : ''}</span>}
              </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SkillDetail;
