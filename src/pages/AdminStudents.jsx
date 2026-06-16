import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AdminContent.css'; // Reuse basic styles for simplicity

const AdminStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/admin/students');
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Students</h1>
        <p>Manage and view student progress</p>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: 'var(--spacing-md)' }}>Name</th>
                <th style={{ padding: 'var(--spacing-md)' }}>Email</th>
                <th style={{ padding: 'var(--spacing-md)' }}>Class</th>
                <th style={{ padding: 'var(--spacing-md)' }}>Tasks Done</th>
                <th style={{ padding: 'var(--spacing-md)' }}>Total Score</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => navigate(`/admin/students/${s._id}/analytics`)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-primary">{s.name.charAt(0).toUpperCase()}</span>
                      {s.name}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>{s.email}</td>
                  <td style={{ padding: 'var(--spacing-md)' }}>{s.classSection || 'N/A'}</td>
                  <td style={{ padding: 'var(--spacing-md)' }}>✅ {s.tasksCompleted}</td>
                  <td style={{ padding: 'var(--spacing-md)' }}>⭐ {s.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="empty-state">
              <p>No students found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;
