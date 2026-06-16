import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineMap, HiOutlineCheck, HiOutlineArrowsUpDown, HiOutlineXMark } from 'react-icons/hi2';
import { Reorder } from 'framer-motion';
import './AdminRoadmap.css';

import MultiSelectDropdown from '../components/common/MultiSelectDropdown';

const AdminRoadmap = () => {
  const [subjects, setSubjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state to track modifications before saving
  const [editedSkills, setEditedSkills] = useState({});

  const fetchData = async () => {
    try {
      const [skillsRes, subjectsRes] = await Promise.all([
        api.get('/skills'),
        api.get('/subjects')
      ]);
      setSkills(skillsRes.data);
      setSubjects(subjectsRes.data);

      // Initialize edit state
      const initialEdits = {};
      skillsRes.data.forEach(skill => {
        initialEdits[skill._id] = {
          _id: skill._id,
          order: skill.order || 0,
          accessMode: skill.accessMode || 'auto',
          prerequisites: skill.prerequisites ? skill.prerequisites.map(p => p._id || p) : []
        };
      });
      setEditedSkills(initialEdits);

    } catch (err) {
      toast.error('Failed to load roadmap data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleSkillChange = (skillId, field, value) => {
    setEditedSkills(prev => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        [field]: value
      }
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const updatesArray = Object.values(editedSkills);
      
      await api.put('/admin/skills/bulk-update', { skills: updatesArray });
      toast.success('Roadmap updated successfully!');
      
      // Refresh to get latest populated data
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save roadmap');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="admin-roadmap-page">
      <div className="roadmap-header-actions">
        <div>
          <h1><HiOutlineMap style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} /> Roadmap Editor</h1>
          <p>Control exactly how students progress through the platform. Drag to reorder.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSaveChanges} disabled={saving}>
          {saving ? 'Saving...' : <><HiOutlineCheck /> Save All Changes</>}
        </button>
      </div>

      {subjects.map(subject => {
        // Get skills for this subject
        const subjectSkills = skills.filter(s => s.subject?._id === subject._id || s.subject === subject._id);
        // Sort them by the current edited order so the teacher sees the live order
        subjectSkills.sort((a, b) => editedSkills[a._id]?.order - editedSkills[b._id]?.order);

        return (
          <div key={subject._id} className="roadmap-subject-group">
            <div className="subject-group-header">
              <h2><span style={{ color: subject.color }}>{subject.icon}</span> {subject.name}</h2>
            </div>
            
            <div className="skill-list-editor">
              {subjectSkills.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem' }}>No skills in this subject yet.</p>
              ) : (
                <Reorder.Group 
                  axis="y" 
                  values={subjectSkills} 
                  onReorder={(newOrder) => {
                    setEditedSkills(prev => {
                      const updated = { ...prev };
                      newOrder.forEach((skill, index) => {
                        updated[skill._id] = {
                          ...updated[skill._id],
                          order: index
                        };
                      });
                      return updated;
                    });
                  }}
                  className="reorder-group"
                >
                  {subjectSkills.map(skill => {
                    const edits = editedSkills[skill._id];
                    if (!edits) return null;

                    return (
                      <Reorder.Item key={skill._id} value={skill} className={`skill-edit-row ${edits.accessMode}-mode`}>
                        <div className="drag-handle" title="Drag to reorder">
                          <HiOutlineArrowsUpDown size={20} />
                        </div>
                        
                        <div className="skill-name-col">
                          <span>{skill.icon}</span>
                          <div>
                            <div style={{ marginBottom: '0.125rem' }}>{skill.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {skill.totalTasks || 0} Tasks • {skill.difficulty}
                            </div>
                          </div>
                        </div>

                        <div className="skill-edit-col">
                          <label>Access Mode</label>
                          <div className="segmented-control">
                            <button 
                              className={`segment-btn ${edits.accessMode === 'auto' ? 'active auto' : ''}`}
                              onClick={() => handleSkillChange(skill._id, 'accessMode', 'auto')}
                            >Auto</button>
                            <button 
                              className={`segment-btn ${edits.accessMode === 'unlocked' ? 'active unlocked' : ''}`}
                              onClick={() => handleSkillChange(skill._id, 'accessMode', 'unlocked')}
                            >Unlocked</button>
                            <button 
                              className={`segment-btn ${edits.accessMode === 'locked' ? 'active locked' : ''}`}
                              onClick={() => handleSkillChange(skill._id, 'accessMode', 'locked')}
                            >Locked</button>
                          </div>
                        </div>

                        <div className="skill-edit-col prereq-col">
                          <label>Prerequisites</label>
                          <MultiSelectDropdown 
                            options={skills.filter(s => s._id !== skill._id).map(s => ({ value: s._id, label: s.name }))}
                            value={edits.prerequisites}
                            onChange={(newVal) => handleSkillChange(skill._id, 'prerequisites', newVal)}
                            disabled={edits.accessMode !== 'auto'}
                          />
                        </div>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminRoadmap;
