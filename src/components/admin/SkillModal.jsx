import { useState, useEffect } from 'react';
import MultiSelectDropdown from '../common/MultiSelectDropdown';
import './AdminModals.css';

const EMOJI_PRESETS = [
  '💻', '🚀', '🧠', '📐', '📊', '⚡', '🎯', '🔥', '⚙️', '🔍',
  '📚', '📝', '💡', '🤖', '🧩', '🧪', '🌐', '🛠️', '🎨', '📈',
  '🛡️', '🔑', '📱', '⌨️', '🎧', '🎮', '🏆', '⭐', '🎓', '🥇'
];

const SkillModal = ({ isOpen, onClose, onSubmit, initialData, subjects, skills = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    icon: '🎯',
    order: 0,
    difficulty: 'beginner',
    accessMode: 'auto',
    prerequisites: []
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        subject: initialData.subject?._id || initialData.subject || '',
        icon: initialData.icon || '🎯',
        order: initialData.order || 0,
        difficulty: initialData.difficulty || 'beginner',
        accessMode: initialData.accessMode || 'auto',
        prerequisites: initialData.prerequisites ? initialData.prerequisites.map(p => p._id || p) : []
      });
    } else {
      const maxOrder = skills.length > 0 ? Math.max(...skills.map(s => s.order || 0)) : -1;
      setFormData({
        name: '', description: '', subject: subjects[0]?._id || '', icon: '🎯', order: maxOrder + 1, difficulty: 'beginner', accessMode: 'auto', prerequisites: []
      });
    }
  }, [initialData, subjects, isOpen, skills]);

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
        <h2 className="modal-title">{initialData ? 'Edit Skill' : 'Add New Skill'}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          
          <div className="modal-section">
            <h3 className="modal-section-title">Basic Information</h3>
            <div className="input-group">
              <label>Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="input" placeholder="e.g., Intro to Python" required />
            </div>
            
            <div className="input-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="input" rows="3" placeholder="Briefly describe what students will learn..." required />
            </div>

            <div className="form-row">
              <div className="input-group flex-1">
                <label>Subject</label>
                <select name="subject" value={formData.subject} onChange={handleChange} className="input" required>
                  <option value="">Select a subject</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group flex-1">
                <label>Difficulty</label>
                <div className="segmented-control">
                  <button type="button" className={`segment-btn ${formData.difficulty === 'beginner' ? 'active unlocked' : ''}`} onClick={() => handleCustomChange('difficulty', 'beginner')}>Beginner</button>
                  <button type="button" className={`segment-btn ${formData.difficulty === 'intermediate' ? 'active auto' : ''}`} onClick={() => handleCustomChange('difficulty', 'intermediate')}>Intermediate</button>
                  <button type="button" className={`segment-btn ${formData.difficulty === 'advanced' ? 'active locked' : ''}`} onClick={() => handleCustomChange('difficulty', 'advanced')}>Advanced</button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">Visuals</h3>
            <div className="form-row">
              <div className="input-group flex-1">
                <label>Icon (Emoji)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input name="icon" value={formData.icon} onChange={handleChange} className="input" style={{ width: '60px', textAlign: 'center', fontSize: '1.25rem' }} required />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Pick from suggestions below or paste your own.</span>
                </div>
                <div className="emoji-grid">
                  {EMOJI_PRESETS.map(emoji => (
                    <button 
                      key={emoji} 
                      type="button" 
                      className={`emoji-btn ${formData.icon === emoji ? 'selected' : ''}`}
                      onClick={() => handleCustomChange('icon', emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">Roadmap Settings</h3>
            <div className="form-row">
              <div className="input-group flex-1">
                <label>Order (Placement in Subject)</label>
                <input type="number" name="order" value={formData.order} onChange={handleChange} className="input" min="0" required />
              </div>
            </div>

            <div className="form-row" style={{ marginTop: 'var(--spacing-md)' }}>
              <div className="input-group flex-1">
                <label>Access Mode</label>
                <div className="segmented-control">
                  <button type="button" className={`segment-btn ${formData.accessMode === 'auto' ? 'active auto' : ''}`} onClick={() => handleCustomChange('accessMode', 'auto')}>Auto (Progression)</button>
                  <button type="button" className={`segment-btn ${formData.accessMode === 'unlocked' ? 'active unlocked' : ''}`} onClick={() => handleCustomChange('accessMode', 'unlocked')}>Always Unlocked</button>
                  <button type="button" className={`segment-btn ${formData.accessMode === 'locked' ? 'active locked' : ''}`} onClick={() => handleCustomChange('accessMode', 'locked')}>Always Locked</button>
                </div>
              </div>
              <div className="input-group flex-1">
                <label>Prerequisites (Only applies to Auto mode)</label>
                <MultiSelectDropdown 
                  options={skills.filter(s => s._id !== initialData?._id).map(s => ({ value: s._id, label: `${s.name} (${s.subject?.name || 'Unknown'})` }))}
                  value={formData.prerequisites}
                  onChange={(newVal) => handleCustomChange('prerequisites', newVal)}
                  disabled={formData.accessMode !== 'auto'}
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initialData ? 'Update Skill' : 'Create Skill'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillModal;
