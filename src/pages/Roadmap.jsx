import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { HiOutlineLockClosed, HiOutlineCheckCircle, HiOutlineAcademicCap } from 'react-icons/hi2';
import './Roadmap.css';

const Roadmap = () => {
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await api.get('/subjects');
        setSubjects(data);
        if (data.length > 0) setActiveSubject(data[0]);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!activeSubject) return;
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/subjects/${activeSubject._id}/skills`);
        setSkills(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchSkills();
  }, [activeSubject]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <HiOutlineCheckCircle className="skill-status-icon completed" />;
      case 'locked': return <HiOutlineLockClosed className="skill-status-icon locked" />;
      default: return <HiOutlineAcademicCap className="skill-status-icon unlocked" />;
    }
  };

  const getDifficultyClass = (diff) => {
    return diff === 'beginner' ? 'easy' : diff === 'intermediate' ? 'medium' : 'hard';
  };

  return (
    <div className="roadmap-page">
      <div className="page-header">
        <h1>Learning Roadmap</h1>
        <p>Follow the path to master problem-solving skills</p>
      </div>

      {/* Subject Tabs */}
      <div className="subject-tabs">
        {subjects.map((subject) => (
          <button
            key={subject._id}
            className={`subject-tab ${activeSubject?._id === subject._id ? 'active' : ''}`}
            onClick={() => setActiveSubject(subject)}
            style={{ '--subject-color': subject.color }}
          >
            <span className="tab-icon">{subject.icon}</span>
            {subject.name}
          </button>
        ))}
      </div>

      {/* Skill Tree */}
      {loading ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : (
        <div className="skill-tree">
          {skills.map((skill, index) => (
            <motion.div
              key={skill._id}
              className={`skill-node ${skill.status}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {index > 0 && <div className="skill-connector" />}
              <div
                className={`skill-card ${skill.status}`}
                onClick={() => skill.status !== 'locked' && navigate(`/skills/${skill._id}`)}
                style={{ cursor: skill.status === 'locked' ? 'not-allowed' : 'pointer' }}
              >
                <div className="skill-card-header">
                    <span className="skill-icon">{skill.icon}</span>
                  <div className="skill-info">
                    <h3>{skill.name}</h3>
                    <p>{skill.description}</p>
                  </div>
                  {getStatusIcon(skill.status)}
                </div>
                <div className="skill-card-footer">
                  <span className={`badge badge-${getDifficultyClass(skill.difficulty)}`}>
                    {skill.difficulty}
                  </span>
                  <div className="skill-progress">
                    <span>{skill.completedTasks}/{skill.totalTasks} tasks</span>
                    <div className="progress-bar-container" style={{ width: 100 }}>
                        <div className="progress-bar-fill" style={{ width: `${skill.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Roadmap;
