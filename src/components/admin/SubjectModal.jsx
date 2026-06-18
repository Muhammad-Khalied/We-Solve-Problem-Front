import { useState, useEffect } from 'react';
import './AdminModals.css';

const EMOJI_PRESETS = [
  '💻', '🚀', '🧠', '📐', '📊', '⚡', '🎯', '🔥', '⚙️', '🔍',
  '📚', '📝', '💡', '🤖', '🧩', '🧪', '🌐', '🛠️', '🎨', '📈',
  '🛡️', '🔑', '📱', '⌨️', '🎧', '🎮', '🏆', '⭐', '🎓', '🥇'
];

const PRESET_COLORS = [
  '#6C63FF', '#EC4899', '#22C55E', '#F59E0B', '#06B6D4',
  '#EF4444', '#8B5CF6', '#F97316', '#14B8A6', '#3B82F6'
];

const SubjectModal = ({ isOpen, onClose, onSubmit, initialData, subjects = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📚',
    color: '#6C63FF',
    order: 0
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        icon: initialData.icon || '📚',
        color: initialData.color || '#6C63FF',
        order: initialData.order || 0
      });
    } else {
      const maxOrder = subjects.length > 0 ? Math.max(...subjects.map(s => s.order || 0)) : -1;
      setFormData({
        name: '', 
        description: '', 
        icon: '📚', 
        color: '#6C63FF', 
        order: maxOrder + 1
      });
    }
  }, [initialData, subjects, isOpen]);

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
        <h2 className="modal-title">{initialData ? 'Edit Subject' : 'Add New Subject'}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          
          <div className="modal-section">
            <h3 className="modal-section-title">Basic Information</h3>
            <div className="input-group">
              <label>Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="input" placeholder="e.g., Computer Science" required />
            </div>
            
            <div className="input-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="input textarea" placeholder="Describe the subject..." required />
            </div>
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">Appearance</h3>
            <div className="form-row two-cols">
              <div className="input-group">
                <label>Icon (Emoji)</label>
                <div className="emoji-selector">
                  <div className="current-emoji">{formData.icon}</div>
                  <div className="emoji-grid">
                    {EMOJI_PRESETS.map(emoji => (
                      <button 
                        key={emoji} 
                        type="button" 
                        className={`emoji-btn ${formData.icon === emoji ? 'selected' : ''}`}
                        onClick={() => handleCustomChange('icon', emoji)}
                      >{emoji}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="input-group">
                <label>Color</label>
                <div className="color-selector">
                  <div className="current-color-preview" style={{ background: formData.color }}></div>
                  <input type="color" name="color" value={formData.color} onChange={handleChange} className="color-picker" />
                  <div className="color-grid">
                    {PRESET_COLORS.map(color => (
                      <button 
                        key={color} 
                        type="button" 
                        className={`color-btn ${formData.color === color ? 'selected' : ''}`}
                        style={{ background: color }}
                        onClick={() => handleCustomChange('color', color)}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">Ordering</h3>
            <div className="input-group">
              <label>Order (Lower number appears first)</label>
              <input type="number" name="order" value={formData.order} onChange={handleChange} className="input" required />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectModal;
