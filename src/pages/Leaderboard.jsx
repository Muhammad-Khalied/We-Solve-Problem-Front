import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import './Leaderboard.css';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/subjects').then(r => setSubjects(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const params = activeFilter !== 'all' ? { subjectId: activeFilter } : {};
        const { data } = await api.get('/submissions/leaderboard', { params });
        setLeaderboard(data.leaderboard);
        setCurrentUserRank(data.currentUserRank);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchLeaderboard();
  }, [activeFilter]);

  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="leaderboard-page">
      <div className="page-header">
        <h1>🏆 Leaderboard</h1>
        <p>See who's at the top!</p>
      </div>

      <div className="leaderboard-filters">
        <button className={`subject-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}>All Subjects</button>
        {subjects.map(s => (
          <button key={s._id}
            className={`subject-tab ${activeFilter === s._id ? 'active' : ''}`}
            onClick={() => setActiveFilter(s._id)}>
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      {currentUserRank && (
        <div className="your-rank card">
          <span>Your Rank:</span>
          <strong>{getMedal(currentUserRank)}</strong>
        </div>
      )}

      {loading ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : leaderboard.length > 0 ? (
        <div className="leaderboard-list">
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="podium">
              {[1, 0, 2].map((idx) => {
                const entry = leaderboard[idx];
                if (!entry) return null;
                return (
                  <motion.div key={idx} className={`podium-card rank-${idx + 1}`}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}>
                    <div className="podium-medal">{getMedal(idx + 1)}</div>
                    <div className="podium-avatar">
                      {entry.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <h4 className="podium-name">{entry.user?.name}</h4>
                    <span className="podium-section">{entry.user?.classSection}</span>
                    <span className="podium-score">⭐ {entry.totalScore}</span>
                    <span className="podium-tasks">{entry.tasksCompleted} tasks</span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full List */}
          <div className="leaderboard-table">
            <div className="table-header">
              <span>Rank</span>
              <span>Student</span>
              <span>Class</span>
              <span>Tasks</span>
              <span>Score</span>
            </div>
            {leaderboard.map((entry, i) => (
              <motion.div key={i}
                className={`table-row ${entry.user?.id?.toString() === user?.id?.toString() || entry.user?._id?.toString() === user?.id?.toString() ? 'current-user' : ''}`}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}>
                <span className="rank-cell">{getMedal(entry.rank)}</span>
                <span className="name-cell">
                  <span className="table-avatar">{entry.user?.name?.charAt(0)?.toUpperCase()}</span>
                  {entry.user?.name}
                </span>
                <span className="class-cell">{entry.user?.classSection || '-'}</span>
                <span className="tasks-cell">{entry.tasksCompleted}</span>
                <span className="score-cell">⭐ {entry.totalScore}</span>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state"><div className="empty-icon">🏆</div><p>No scores yet. Start solving to be the first!</p></div>
      )}
    </div>
  );
};

export default Leaderboard;
