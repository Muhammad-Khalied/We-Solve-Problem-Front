import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { 
  HiOutlinePlus, 
  HiOutlinePencilSquare, 
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineCodeBracket,
  HiOutlineCalculator,
  HiOutlineDocumentText,
  HiOutlineFunnel
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import SkillModal from '../components/admin/SkillModal';
import TaskModal from '../components/admin/TaskModal';
import SubjectModal from '../components/admin/SubjectModal';
import './AdminContent.css';

const AdminContent = () => {
  const [skills, setSkills] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subjects');

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // Tasks only

  // Modal states
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [skillsRes, tasksRes, subjectsRes] = await Promise.all([
        api.get('/skills'),
        api.get('/admin/tasks'),
        api.get('/subjects')
      ]);
      setSkills(skillsRes.data);
      setTasks(tasksRes.data);
      setSubjects(subjectsRes.data);
    } catch (err) {
      toast.error('Failed to load content data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleOpenSkillModal = (skill = null) => {
    setEditingItem(skill);
    setIsSkillModalOpen(true);
  };

  const handleOpenTaskModal = (task = null) => {
    setEditingItem(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenSubjectModal = (subject = null) => {
    setEditingItem(subject);
    setIsSubjectModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsSkillModalOpen(false);
    setIsTaskModalOpen(false);
    setIsSubjectModalOpen(false);
    setEditingItem(null);
  };

  // --- SUBJECT CRUD ---
  const handleSaveSubject = async (formData) => {
    try {
      if (editingItem) {
        await api.put(`/admin/subjects/${editingItem._id}`, formData);
        toast.success('Subject updated successfully');
      } else {
        await api.post('/admin/subjects', formData);
        toast.success('Subject created successfully');
      }
      handleCloseModals();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save subject');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('CAUTION: Are you sure you want to delete this subject? This will PERMANENTLY delete ALL skills, tasks, submissions, and chat histories under it!')) return;
    try {
      await api.delete(`/admin/subjects/${id}`);
      toast.success('Subject deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete subject');
    }
  };

  // --- SKILL CRUD ---
  const handleSaveSkill = async (formData) => {
    try {
      if (editingItem) {
        await api.put(`/admin/skills/${editingItem._id}`, formData);
        toast.success('Skill updated successfully');
      } else {
        await api.post('/admin/skills', formData);
        toast.success('Skill created successfully');
      }
      handleCloseModals();
      fetchData(); // Refresh data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save skill');
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill? This will also delete all associated tasks, submissions, and chat histories!')) return;
    try {
      await api.delete(`/admin/skills/${id}`);
      toast.success('Skill deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete skill');
    }
  };

  // --- TASK CRUD ---
  const handleSaveTask = async (formData) => {
    try {
      if (editingItem) {
        await api.put(`/admin/tasks/${editingItem._id}`, formData);
        toast.success('Task updated successfully');
      } else {
        await api.post('/admin/tasks', formData);
        toast.success('Task created successfully');
      }
      handleCloseModals();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/admin/tasks/${id}`);
      toast.success('Task deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  // --- FILTERING ---
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'all' || skill.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'all' || task.difficulty === difficultyFilter;
    const matchesType = typeFilter === 'all' || task.type === typeFilter;
    return matchesSearch && matchesDiff && matchesType;
  });

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          subject.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getTaskIcon = (type) => {
    switch (type) {
      case 'code': return <HiOutlineCodeBracket />;
      case 'math': return <HiOutlineCalculator />;
      default: return <HiOutlineDocumentText />;
    }
  };

  const getSubjectName = (subjectId) => {
    const sub = subjects.find(s => s._id === subjectId || s._id === subjectId?._id);
    return sub ? sub.name : 'No Subject';
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  return (
    <div className="admin-page admin-content-page">
      <div className="page-header flex-header">
        <div>
          <h1>Content Management</h1>
          <p>Manage your platform's subjects, skills, and tasks</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => activeTab === 'subjects' ? handleOpenSubjectModal() : activeTab === 'skills' ? handleOpenSkillModal() : handleOpenTaskModal()}
        >
          <HiOutlinePlus size={20} /> Add New {activeTab === 'subjects' ? 'Subject' : activeTab === 'skills' ? 'Skill' : 'Task'}
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => { setActiveTab('subjects'); setSearchQuery(''); setDifficultyFilter('all'); }}
        >
          Subjects ({subjects.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => { setActiveTab('skills'); setSearchQuery(''); setDifficultyFilter('all'); }}
        >
          Skills ({skills.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => { setActiveTab('tasks'); setSearchQuery(''); setDifficultyFilter('all'); }}
        >
          Tasks ({tasks.length})
        </button>
      </div>

      {/* Control Bar */}
      <div className="content-control-bar">
        <div className="search-box">
          <HiOutlineMagnifyingGlass className="search-icon" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <div className="segmented-control">
            <button 
              className={`segment-btn ${difficultyFilter === 'all' ? 'active auto' : ''}`}
              onClick={() => setDifficultyFilter('all')}
            >All</button>
            {activeTab === 'skills' ? (
              <>
                <button 
                  className={`segment-btn ${difficultyFilter === 'beginner' ? 'active unlocked' : ''}`}
                  onClick={() => setDifficultyFilter('beginner')}
                >Beginner</button>
                <button 
                  className={`segment-btn ${difficultyFilter === 'intermediate' ? 'active auto' : ''}`}
                  onClick={() => setDifficultyFilter('intermediate')}
                >Intermediate</button>
                <button 
                  className={`segment-btn ${difficultyFilter === 'advanced' ? 'active locked' : ''}`}
                  onClick={() => setDifficultyFilter('advanced')}
                >Advanced</button>
              </>
            ) : activeTab === 'tasks' ? (
              <>
                <button 
                  className={`segment-btn ${difficultyFilter === 'easy' ? 'active unlocked' : ''}`}
                  onClick={() => setDifficultyFilter('easy')}
                >Easy</button>
                <button 
                  className={`segment-btn ${difficultyFilter === 'medium' ? 'active auto' : ''}`}
                  onClick={() => setDifficultyFilter('medium')}
                >Medium</button>
                <button 
                  className={`segment-btn ${difficultyFilter === 'hard' ? 'active locked' : ''}`}
                  onClick={() => setDifficultyFilter('hard')}
                >Hard</button>
              </>
            ) : null}
          </div>

          {activeTab === 'tasks' && (
            <div className="segmented-control">
              <button 
                className={`segment-btn ${typeFilter === 'all' ? 'active auto' : ''}`}
                onClick={() => setTypeFilter('all')}
              >All Types</button>
              <button 
                className={`segment-btn ${typeFilter === 'code' ? 'active auto' : ''}`}
                onClick={() => setTypeFilter('code')}
              >Code</button>
              <button 
                className={`segment-btn ${typeFilter === 'math' ? 'active auto' : ''}`}
                onClick={() => setTypeFilter('math')}
              >Math</button>
            </div>
          )}
        </div>
      </div>

      <div className="content-grid">
        {activeTab === 'subjects' && filteredSubjects.map((subject) => (
          <motion.div 
            key={subject._id} 
            className="card admin-content-card"
            style={{ borderTop: `4px solid ${subject.color}` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.4)" }}
          >
            <div className="card-header">
              <div className="skill-icon">{subject.icon}</div>
              <div className="actions">
                <button className="btn-icon btn-ghost" title="Edit" onClick={() => handleOpenSubjectModal(subject)}><HiOutlinePencilSquare /></button>
                <button className="btn-icon btn-danger-ghost" title="Delete" onClick={() => handleDeleteSubject(subject._id)}><HiOutlineTrash /></button>
              </div>
            </div>
            <h3>{subject.name}</h3>
            <p className="card-description">{subject.description}</p>
            <div className="card-meta">
              <span className="meta-item context-label" style={{ margin: 0 }}>Order: {subject.order}</span>
            </div>
          </motion.div>
        ))}

        {activeTab === 'skills' && filteredSkills.map((skill) => (
          <motion.div 
            key={skill._id} 
            className={`card admin-content-card diff-border-${skill.difficulty}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.4)" }}
          >
            <div className="card-header">
              <div className="skill-icon">{skill.icon}</div>
              <div className="actions">
                <button className="btn-icon btn-ghost" title="Edit" onClick={() => handleOpenSkillModal(skill)}><HiOutlinePencilSquare /></button>
                <button className="btn-icon btn-danger-ghost" title="Delete" onClick={() => handleDeleteSkill(skill._id)}><HiOutlineTrash /></button>
              </div>
            </div>
            <div className="card-body">
              <span className="context-label" style={{ margin: 0 }}>{getSubjectName(skill.subject)}</span>
              <h3 style={{ margin: '0.25rem 0' }}>{skill.name}</h3>
              <p>{skill.description}</p>
            </div>
            <div className="card-meta" style={{ flexWrap: 'nowrap' }}>
              <span className={`badge badge-${skill.difficulty} polished-badge`}>{skill.difficulty}</span>
              <span className="task-count" style={{ whiteSpace: 'nowrap' }}>{skill.totalTasks || 0} tasks</span>
            </div>
          </motion.div>
        ))}

        {activeTab === 'tasks' && filteredTasks.map((task) => (
          <motion.div 
            key={task._id} 
            className={`card admin-content-card task-card diff-border-${task.difficulty}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.4)" }}
          >
            <div className="card-header">
              <div className={`task-type-badge type-${task.type}`}>
                {getTaskIcon(task.type)}
                {task.type.toUpperCase()}
              </div>
              <div className="actions">
                <button className="btn-icon btn-ghost" title="Edit" onClick={() => handleOpenTaskModal(task)}><HiOutlinePencilSquare /></button>
                <button className="btn-icon btn-danger-ghost" title="Delete" onClick={() => handleDeleteTask(task._id)}><HiOutlineTrash /></button>
              </div>
            </div>
            <div className="card-body">
              <span className="context-label" style={{ margin: 0 }}>Skill: {task.skill?.name || 'Unknown'}</span>
              <h3 className="task-title" style={{ margin: '0.25rem 0' }}>{task.title}</h3>
            </div>
            <div className="card-meta" style={{ flexWrap: 'nowrap' }}>
              <span className={`badge badge-${task.difficulty} polished-badge`}>{task.difficulty}</span>
              <span className="points-badge" style={{ whiteSpace: 'nowrap' }}>⭐ {task.points} pts</span>
            </div>
          </motion.div>
        ))}
      </div>

      {activeTab === 'skills' && filteredSkills.length === 0 && (
        <div className="empty-state premium-empty">
          <HiOutlineDocumentText className="empty-icon" />
          <h3>No skills found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}
      {activeTab === 'tasks' && filteredTasks.length === 0 && (
        <div className="empty-state premium-empty">
          <HiOutlineDocumentText className="empty-icon" />
          <h3>No tasks found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}
      {activeTab === 'subjects' && filteredSubjects.length === 0 && (
        <div className="empty-state premium-empty">
          <span className="empty-icon">📚</span>
          <h3>No subjects found</h3>
          <p>Try adjusting your search or create a new subject.</p>
        </div>
      )}

      <SubjectModal 
        isOpen={isSubjectModalOpen} 
        onClose={handleCloseModals} 
        onSubmit={handleSaveSubject} 
        initialData={editingItem} 
        subjects={subjects}
      />

      <SkillModal 
        isOpen={isSkillModalOpen} 
        onClose={handleCloseModals} 
        onSubmit={handleSaveSkill} 
        initialData={editingItem} 
        subjects={subjects}
        skills={skills}
      />

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={handleCloseModals} 
        onSubmit={handleSaveTask} 
        initialData={editingItem} 
        skills={skills} 
        tasks={tasks}
      />
    </div>
  );
};

export default AdminContent;
