import { useState, useEffect } from 'react';
import './AdminModals.css';

const TaskModal = ({ isOpen, onClose, onSubmit, initialData, skills, tasks = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skill: '',
    type: 'code',
    difficulty: 'easy',
    points: 10,
    order: 0,
    starterCode: '',
    language: 'python',
    solution: '',
    explanation: ''
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        skill: initialData.skill?._id || initialData.skill || '',
        type: initialData.type || 'code',
        difficulty: initialData.difficulty || 'easy',
        points: initialData.points || 10,
        order: initialData.order || 0,
        starterCode: initialData.starterCode || '',
        language: initialData.language || 'python',
        solution: initialData.solution || '',
        explanation: initialData.explanation || ''
      });
    } else {
      const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order || 0)) : -1;
      setFormData({
        title: '', description: '', skill: skills[0]?._id || '', type: 'code', difficulty: 'easy', points: 10, order: maxOrder + 1, starterCode: '', language: 'python', solution: '', explanation: ''
      });
    }
  }, [initialData, skills, isOpen, tasks]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card modal-large">
        <h2 className="modal-title">{initialData ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          
          <div className="modal-section">
            <h3 className="modal-section-title">Task Core</h3>
            
            <div className="form-row">
              <div className="input-group flex-1">
                <label>Title</label>
                <input name="title" value={formData.title} onChange={handleChange} className="input" placeholder="e.g., Variable Basics" required />
              </div>
              <div className="input-group flex-1">
                <label>Parent Skill</label>
                <select name="skill" value={formData.skill} onChange={handleChange} className="input" required>
                  <option value="">Select a skill</option>
                  {skills.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Description / Prompt</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="input" rows="3" placeholder="What should the student do?" required />
            </div>
            
            <div className="form-row">
              <div className="input-group flex-1">
                <label>Task Type</label>
                <div className="segmented-control">
                  <button type="button" className={`segment-btn ${formData.type === 'code' ? 'active auto' : ''}`} onClick={() => handleCustomChange('type', 'code')}>Code</button>
                  <button type="button" className={`segment-btn ${formData.type === 'math' ? 'active auto' : ''}`} onClick={() => handleCustomChange('type', 'math')}>Math</button>
                </div>
              </div>
              <div className="input-group flex-1">
                <label>Difficulty</label>
                <div className="segmented-control">
                  <button type="button" className={`segment-btn ${formData.difficulty === 'easy' ? 'active easy' : ''}`} onClick={() => handleCustomChange('difficulty', 'easy')}>Easy</button>
                  <button type="button" className={`segment-btn ${formData.difficulty === 'medium' ? 'active medium' : ''}`} onClick={() => handleCustomChange('difficulty', 'medium')}>Medium</button>
                  <button type="button" className={`segment-btn ${formData.difficulty === 'hard' ? 'active hard' : ''}`} onClick={() => handleCustomChange('difficulty', 'hard')}>Hard</button>
                </div>
              </div>
            </div>
          </div>

          {formData.type === 'code' && (
            <div className="modal-section">
              <h3 className="modal-section-title">Code Setup</h3>
              <div className="form-row">
                <div className="input-group flex-1">
                  <label>Language</label>
                  <select name="language" value={formData.language} onChange={handleChange} className="input">
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Starter Code (Optional)</label>
                <textarea name="starterCode" value={formData.starterCode} onChange={handleChange} className="input font-mono" rows="4" placeholder="# Type starter code here..." />
              </div>
            </div>
          )}

          {formData.type === 'math' && (
            <div className="modal-section">
              <h3 className="modal-section-title">Math Setup</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Note: You can format math using LaTeX in the description.</p>
              {/* Additional math fields could go here in the future */}
            </div>
          )}

          <div className="modal-section">
            <h3 className="modal-section-title">Solution & Settings</h3>
            <div className="input-group">
              <label>Correct Solution (Hidden from student)</label>
              <textarea name="solution" value={formData.solution} onChange={handleChange} className="input font-mono" rows="3" placeholder="Provide the exact solution or answer..." />
            </div>

            <div className="form-row" style={{ marginTop: 'var(--spacing-md)' }}>
              <div className="input-group flex-1">
                <label>Points Awarded</label>
                <input type="number" name="points" value={formData.points} onChange={handleChange} className="input" min="0" required />
              </div>
              <div className="input-group flex-1">
                <label>Order within Skill</label>
                <input type="number" name="order" value={formData.order} onChange={handleChange} className="input" min="0" required />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initialData ? 'Update Task' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
