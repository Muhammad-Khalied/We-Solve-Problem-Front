import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineSparkles, HiOutlineCheck, HiOutlineXMark, HiOutlineChevronDown, HiOutlineChevronUp, HiOutlinePaperClip, HiOutlinePaperAirplane } from 'react-icons/hi2';
import './AIContentGenerator.css';

const AIContentGenerator = () => {
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [subjects, setSubjects] = useState([]);
  const [, setSkills] = useState([]); // setSkills is used, but skills is not

  // Generated content from AI
  const [generatedSkills, setGeneratedSkills] = useState([]);
  // Track accept/refuse status per skill index
  const [skillStatus, setSkillStatus] = useState({});
  // Track which tasks are expanded
  const [expandedTasks, setExpandedTasks] = useState({});
  // Subject selection per skill for acceptance
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [globalSubject, setGlobalSubject] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, skillRes] = await Promise.all([
          api.get('/subjects'),
          api.get('/skills')
        ]);
        setSubjects(subRes.data);
        setSkills(skillRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || loading) return;

    const userMsg = input.trim();
    setInput('');
    
    let combinedMsg;
    let uiMsg;

    if (attachedFile) {
      combinedMsg = `[Attached File: ${attachedFile.filename}]\n\n${userMsg ? userMsg + '\n\n' : ''}File Content:\n${attachedFile.text}`;
      uiMsg = `[Attached File: ${attachedFile.filename}]${userMsg ? '\n' + userMsg : ''}`;
      setAttachedFile(null); // Clear attachment
    } else {
      combinedMsg = userMsg;
      uiMsg = userMsg;
    }

    const newMessagesForUI = [...messages, { role: 'user', content: uiMsg }];
    const newMessagesForAPI = [...messages, { role: 'user', content: combinedMsg }];
    
    setMessages(newMessagesForUI);
    setLoading(true);

    try {
      const { data } = await api.post('/admin/content-ai/chat', {
        messages: newMessagesForAPI
      });

      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Content generated — see the preview panel.' }]);

      // If skills were generated, add them to preview
      if (data.skills && data.skills.length > 0) {
        setGeneratedSkills(prev => [...prev, ...data.skills]);
        toast.success(`Generated ${data.skills.length} skill(s) with tasks!`);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error communicating with AI. Please try again.' }]);
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset input immediately so user can upload same file again if needed
    e.target.value = null;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/admin/content-ai/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setAttachedFile({ filename: data.filename, text: data.text });
      toast.success('File attached! Add a prompt and click send.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process file');
    } finally {
      setUploading(false);
    }
  };

  const handleAcceptSkill = async (skillIndex) => {
    const skill = generatedSkills[skillIndex];
    const subjectId = selectedSubjects[skillIndex] || globalSubject;
    if (!subjectId) {
      toast.error('Please select a subject or set a global subject first');
      return;
    }

    const filteredTasks = (skill.tasks || []).filter((_, ti) => skillStatus[`task-${skillIndex}-${ti}`] !== 'refused');
    const skillToAccept = { ...skill, tasks: filteredTasks };

    try {
      const { data } = await api.post('/admin/content-ai/accept', {
        skill: skillToAccept,
        subjectId
      });
      setSkillStatus(prev => ({ ...prev, [skillIndex]: 'accepted' }));
      toast.success(data.message);
      
      // Refresh skills list
      const skillRes = await api.get('/skills');
      setSkills(skillRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept skill');
    }
  };

  const handleAcceptAll = async () => {
    let acceptedCount = 0;
    
    for (let si = 0; si < generatedSkills.length; si++) {
      if (skillStatus[si] === 'accepted' || skillStatus[si] === 'refused') continue;

      const skill = generatedSkills[si];
      const subjectId = selectedSubjects[si] || globalSubject;
      
      if (!subjectId) {
        toast.error(`No subject selected for "${skill.name}". Set a global subject.`, { id: `subj-err-${si}` });
        continue;
      }

      const filteredTasks = (skill.tasks || []).filter((_, ti) => skillStatus[`task-${si}-${ti}`] !== 'refused');
      const skillToAccept = { ...skill, tasks: filteredTasks };

      try {
        await api.post('/admin/content-ai/accept', {
          skill: skillToAccept,
          subjectId
        });
        setSkillStatus(prev => ({ ...prev, [si]: 'accepted' }));
        acceptedCount++;
      } catch (error) {
        console.error(error);
        toast.error(`Failed to accept ${skill.name}`);
      }
    }
    
    if (acceptedCount > 0) {
      toast.success(`Accepted ${acceptedCount} remaining skill(s)!`);
      const skillRes = await api.get('/skills');
      setSkills(skillRes.data);
    }
  };

  const handleRefuseSkill = (skillIndex) => {
    setSkillStatus(prev => ({ ...prev, [skillIndex]: 'refused' }));
    toast('Skill refused', { icon: '🗑️' });
  };

  // Note: handleAcceptTask is intentionally removed because it's currently unused.

  const handleRefuseTask = (skillIndex, taskIndex) => {
    const taskKey = `${skillIndex}-${taskIndex}`;
    // Mark task as refused - remove it from the skill's tasks
    setSkillStatus(prev => ({ ...prev, [`task-${taskKey}`]: 'refused' }));
    
    // Actually remove the task from the generated skill so it won't be included if skill is accepted
    setGeneratedSkills(prev => {
      const updated = [...prev];
      updated[skillIndex] = {
        ...updated[skillIndex],
        tasks: updated[skillIndex].tasks.filter((_, i) => i !== taskIndex)
      };
      return updated;
    });
    toast('Task removed', { icon: '🗑️' });
  };

  const toggleTaskExpand = (key) => {
    setExpandedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="ai-generator-page">
      {/* LEFT: Chat Panel */}
      <div className="card ai-gen-chat">
        <div className="ai-gen-chat-header">
          <h3><HiOutlineSparkles /> AI Content Generator</h3>
        </div>

        <div className="ai-gen-messages">
          {messages.length === 0 && (
            <div className="ai-gen-empty">
              <span className="ai-gen-empty-icon">🤖</span>
              <p>Paste your educational material (syllabus, topics, curriculum goals) and I'll generate skills and tasks for your platform!</p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <p>Try: "Generate 3 Python skills about loops, conditionals, and functions for beginners"</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`ai-gen-msg ${msg.role}`}>
              <div className="ai-gen-bubble">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="ai-gen-msg assistant">
              <div className="ai-gen-bubble">
                <span style={{ display: 'inline-flex', gap: '0.25rem' }}>
                  Generating<span className="typing-dot">.</span><span className="typing-dot">.</span><span className="typing-dot">.</span>
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="ai-gen-input-form" style={{ flexDirection: 'column' }}>
          {attachedFile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-elevated)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', width: 'fit-content', border: '1px solid var(--border-color)' }}>
              <span>📎 {attachedFile.filename}</span>
              <button className="btn-icon" onClick={() => setAttachedFile(null)} style={{ padding: '0.125rem', color: 'var(--text-muted)' }}><HiOutlineXMark size={14}/></button>
            </div>
          )}
          <div className="ai-gen-input-controls" style={{ display: 'flex', gap: 'var(--spacing-sm)', width: '100%' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".pdf,.txt,.md,.csv,application/json" 
              style={{ display: 'none' }} 
            />
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={loading || uploading || attachedFile}
              title={attachedFile ? 'File already attached' : 'Upload Material (PDF, TXT, etc)'}
            >
              {uploading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : <HiOutlinePaperClip />}
            </button>
            <textarea
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the material or topics you want to generate content for..."
              disabled={loading || uploading}
            />
            <button className="btn btn-primary btn-icon" onClick={handleSend} disabled={loading || uploading || (!input.trim() && !attachedFile)}>
              <HiOutlinePaperAirplane />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Preview Panel */}
      <div className="card ai-gen-preview">
        <div className="ai-gen-preview-header">
          <div>
            <h3>📋 Generated Content</h3>
            {generatedSkills.length > 0 && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {generatedSkills.length} skill(s) · {generatedSkills.reduce((sum, s) => sum + (s.tasks?.length || 0), 0)} task(s)
              </span>
            )}
          </div>
          {generatedSkills.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select 
                className="gen-subject-select"
                value={globalSubject}
                onChange={(e) => setGlobalSubject(e.target.value)}
                title="Fallback Subject for all skills"
              >
                <option value="">Global Subject...</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              <button className="btn btn-success btn-sm" onClick={handleAcceptAll}>
                <HiOutlineCheck /> Accept All
              </button>
            </div>
          )}
        </div>

        <div className="ai-gen-preview-body">
          {generatedSkills.length === 0 ? (
            <div className="ai-gen-empty">
              <span className="ai-gen-empty-icon">📝</span>
              <p>Generated skills and tasks will appear here. Chat with the AI to generate content from your material.</p>
            </div>
          ) : (
            generatedSkills.map((skill, si) => (
              <div key={si} className="gen-skill-card">
                <div className="gen-skill-header">
                  <div className="gen-skill-info">
                    <span className="gen-skill-icon">{skill.icon || '🎯'}</span>
                    <div>
                      <h4>{skill.name}</h4>
                      <p>{skill.description?.substring(0, 80)}{skill.description?.length > 80 ? '...' : ''}</p>
                    </div>
                  </div>
                  <div className="gen-skill-actions">
                    {skillStatus[si] === 'accepted' ? (
                      <span className="accepted-badge">✅ Accepted</span>
                    ) : skillStatus[si] === 'refused' ? (
                      <span className="refused-badge">❌ Refused</span>
                    ) : (
                      <>
                        <select 
                          className="gen-subject-select"
                          value={selectedSubjects[si] || ''}
                          onChange={(e) => setSelectedSubjects(prev => ({ ...prev, [si]: e.target.value }))}
                        >
                          <option value="">Subject...</option>
                          {subjects.map(s => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                          ))}
                        </select>
                        <button className="btn btn-success btn-sm" onClick={() => handleAcceptSkill(si)} title="Accept skill & tasks">
                          <HiOutlineCheck /> Accept
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRefuseSkill(si)} title="Refuse">
                          <HiOutlineXMark />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Tasks */}
                {skill.tasks?.map((task, ti) => {
                  const taskKey = `${si}-${ti}`;
                  const isExpanded = expandedTasks[taskKey];
                  const taskStatus = skillStatus[`task-${taskKey}`];

                  if (taskStatus === 'refused') return null;

                  return (
                    <div key={ti} className="gen-task-item">
                      <div className="gen-task-top">
                        <span className="gen-task-title">{task.title}</span>
                        <div className="gen-task-badges">
                          <span className={`badge badge-${task.difficulty}`}>{task.difficulty}</span>
                          <span className="badge badge-primary">{task.type}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--warning-400)', fontWeight: 600 }}>⭐ {task.points}</span>
                          {skillStatus[si] !== 'accepted' && skillStatus[si] !== 'refused' && (
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ padding: '0.25rem', color: 'var(--danger-400)' }}
                              onClick={() => handleRefuseTask(si, ti)}
                              title="Remove this task"
                            >
                              <HiOutlineXMark size={14} />
                            </button>
                          )}
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ padding: '0.25rem' }}
                            onClick={() => toggleTaskExpand(taskKey)}
                          >
                            {isExpanded ? <HiOutlineChevronUp size={14} /> : <HiOutlineChevronDown size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="gen-task-desc">{task.description?.substring(0, 120)}...</div>
                      <div className="gen-task-meta">
                        {task.type === 'code' && <span>🔤 {task.language}</span>}
                        <span>📝 {task.testCases?.length || 0} test cases</span>
                        <span>💡 {task.hints?.length || 0} hints</span>
                      </div>

                      {isExpanded && (
                        <div className="gen-task-detail">
                          {task.type === 'code' && task.starterCode && (
                            <>
                              <h5>Starter Code</h5>
                              <pre>{task.starterCode}</pre>
                            </>
                          )}
                          {task.solution && (
                            <>
                              <h5>Solution</h5>
                              <pre>{task.solution}</pre>
                            </>
                          )}
                          {task.explanation && (
                            <>
                              <h5>Explanation</h5>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{task.explanation}</p>
                            </>
                          )}
                          {task.hints?.length > 0 && (
                            <>
                              <h5>Hints</h5>
                              {task.hints.map((h, hi) => (
                                <p key={hi} style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                  💡 Hint {hi + 1}: {h}
                                </p>
                              ))}
                            </>
                          )}
                          {task.testCases?.length > 0 && (
                            <>
                              <h5>Test Cases</h5>
                              {task.testCases.map((tc, tci) => (
                                <div key={tci} style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', padding: '0.25rem 0' }}>
                                  <span>Input: <code>{tc.input || '(none)'}</code></span>
                                  <span>Expected: <code>{tc.expectedOutput}</code></span>
                                  {tc.isHidden && <span style={{ color: 'var(--warning-400)' }}>🔒 Hidden</span>}
                                </div>
                              ))}
                            </>
                          )}
                          {task.type === 'math' && (
                            <>
                              <h5>Answer: {task.mathAnswer}</h5>
                              {task.mathOptions?.length > 0 && (
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                  Options: {task.mathOptions.join(' | ')}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AIContentGenerator;
