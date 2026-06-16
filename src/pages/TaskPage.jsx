import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlinePlay, HiOutlinePaperAirplane, HiOutlineLightBulb, HiOutlineChatBubbleLeftRight, HiOutlineSparkles } from 'react-icons/hi2';
import './TaskPage.css';

const TaskPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const [task, setTask] = useState(null);
  const [code, setCode] = useState('');
  const [mathAnswer, setMathAnswer] = useState('');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [aiChatCount, setAiChatCount] = useState(0);

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  // AI Feedback
  const [aiFeedback, setAiFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data } = await api.get(`/tasks/${id}`);
        setTask(data.task);
        setCode(data.submission?.code || data.task.starterCode || '');
        setSubmission(data.submission);
        setHintLevel(data.hintLevel || 0);

        // Fetch chat history
        const chatRes = await api.get(`/chat/${id}/history`);
        if (chatRes.data?.messages) {
          setChatMessages(chatRes.data.messages);
          setHintLevel(chatRes.data.hintLevel || 0);
          setAiChatCount(chatRes.data.aiChatCount || 0);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchTask();

    // Track task opened event
    api.post('/events/track', { taskId: id, type: 'TASK_OPENED' }).catch(() => {});

    // Track task closed event on unmount
    return () => {
      api.post('/events/track', { taskId: id, type: 'TASK_CLOSED' }).catch(() => {});
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    setTestResults([]);
    try {
      const { data } = await api.post(`/tasks/${id}/run`, { code });
      setOutput(data.output || data.error || 'No output');
    } catch (err) {
      setOutput('Error: ' + (err.response?.data?.message || err.message));
    } finally { setRunning(false); }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const body = task.type === 'code' ? { code } : { mathAnswer };
      const { data } = await api.post(`/tasks/${id}/submit`, body);
      setTestResults(data.submission.testResults);
      setSubmission(data.submission);

      if (data.submission.status === 'passed') {
        toast.success(`🎉 Correct! You earned ${data.submission.score} points!`);
      } else if (data.submission.status === 'partial') {
        toast('Some test cases passed. Keep trying!', { icon: '🟡' });
      } else {
        toast.error('Not quite right. Check the results and try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
      const payload = {
        message: msg,
        currentCode: task.type === 'code' ? code : undefined,
        currentAnswer: task.type === 'math' ? mathAnswer : undefined
      };
      const { data } = await api.post(`/chat/${id}`, payload);
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setHintLevel(data.hintLevel);
      if (data.aiChatCount !== undefined) setAiChatCount(data.aiChatCount);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that. Please try again.' }]);
    } finally { setChatLoading(false); }
  };

  const handleRequestHint = async () => {
    if (hintLevel >= 3) return toast('Maximum hints reached!', { icon: '💡' });
    try {
      const { data } = await api.post(`/chat/${id}/hint`);
      setChatMessages(prev => [
        ...prev,
        { role: 'user', content: `[Hint ${data.hintLevel} requested]` },
        { role: 'assistant', content: data.message }
      ]);
      setHintLevel(data.hintLevel);
      if (data.aiChatCount !== undefined) setAiChatCount(data.aiChatCount);
      setChatOpen(true);
      toast(`Hint ${data.hintLevel}/3 revealed`, { icon: '💡' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get hint');
    }
  };

  const handleGetFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const { data } = await api.post(`/tasks/${id}/feedback`);
      setAiFeedback(data.feedback);
      if (!data.cached) {
        toast.success('AI feedback generated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get feedback');
    } finally {
      setLoadingFeedback(false);
    }
  };

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!task) return <div className="empty-state"><p>Task not found</p></div>;

  return (
    <div className={`task-page ${chatOpen ? 'chat-open' : ''}`}>
      {/* LEFT: Task description + Editor */}
      <div className="task-main">
        <div className="task-top-bar">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <HiOutlineArrowLeft /> Back
          </button>
          <div className="task-top-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleRequestHint} disabled={hintLevel >= 3}>
              <HiOutlineLightBulb /> Hint ({hintLevel}/3)
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setChatOpen(!chatOpen)}>
              <HiOutlineChatBubbleLeftRight /> AI Tutor
            </button>
          </div>
        </div>

        <div className="task-body">
          {/* Description Panel */}
          <div className="task-description">
            <div className="task-title-row">
              <h2>{task.title}</h2>
              <div className="task-badges">
                <span className={`badge badge-${task.difficulty}`}>{task.difficulty}</span>
                <span className="badge badge-primary">{task.points} pts</span>
              </div>
            </div>
            <div className="task-desc-content" dangerouslySetInnerHTML={{ __html: task.description.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />

            {task.type === 'code' && task.testCases?.length > 0 && (
              <div className="task-examples">
                <h4>Examples:</h4>
                {task.testCases.map((tc, i) => (
                  <div key={i} className="example-case">
                    {tc.input && <div><strong>Input:</strong> <code>{tc.input}</code></div>}
                    <div><strong>Output:</strong> <code>{tc.expectedOutput}</code></div>
                  </div>
                ))}
              </div>
            )}

            {/* Math Task Input */}
            {task.type === 'math' && (
              <div className="math-input-section">
                {task.mathOptions?.length > 0 ? (
                  <div className="math-options">
                    {task.mathOptions.map((opt, i) => (
                      <label key={i} className={`math-option ${mathAnswer === opt ? 'selected' : ''}`}>
                        <input type="radio" name="mathAnswer" value={opt}
                          checked={mathAnswer === opt}
                          onChange={(e) => setMathAnswer(e.target.value)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="input-group">
                    <label>Your Answer</label>
                    <input className="input" type="text" value={mathAnswer}
                      onChange={(e) => setMathAnswer(e.target.value)}
                      placeholder="Enter your answer..." />
                  </div>
                )}
                <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={submitting || !mathAnswer}
                  style={{ marginTop: '1rem', width: '100%' }}>
                  {submitting ? 'Checking...' : 'Submit Answer'}
                </button>
              </div>
            )}
          </div>

          {/* Code Editor */}
          {task.type === 'code' && (
            <div className="task-editor-section">
              <div className="editor-header">
                <span className="editor-lang">{task.language}</span>
                <div className="editor-actions">
                  <button className="btn btn-secondary btn-sm" onClick={handleRun} disabled={running}>
                    <HiOutlinePlay /> {running ? 'Running...' : 'Run'}
                  </button>
                  <button className="btn btn-success btn-sm" onClick={handleSubmit} disabled={submitting}>
                    <HiOutlinePaperAirplane /> {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
              <div 
                className="editor-wrapper" 
                onCopy={(e) => { e.preventDefault(); toast.error('Copying is disabled to encourage learning!'); }}
                onPaste={(e) => { e.preventDefault(); toast.error('Pasting is disabled. Please type your code manually.'); }}
                onCut={(e) => e.preventDefault()}
              >
                <Editor
                  height="350px"
                  language={task.language === 'cpp' ? 'cpp' : task.language}
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    padding: { top: 12 },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    contextmenu: false // Disable right-click context menu
                  }}
                />
              </div>

              {/* Output / Test Results */}
              {(output || testResults.length > 0) && (
                <div className="output-panel">
                  <h4>Output</h4>
                  {output && <pre className="output-text">{output}</pre>}
                  {testResults.length > 0 && (
                    <div className="test-results">
                      {testResults.map((r, i) => (
                        <div key={i} className={`test-result ${r.passed ? 'passed' : 'failed'}`}>
                          <span className="test-icon">{r.passed ? '✅' : '❌'}</span>
                          <div className="test-details">
                            <span>Test {i + 1}: {r.passed ? 'Passed' : 'Failed'}</span>
                            {!r.passed && r.expected !== '[Hidden]' && (
                              <div className="test-diff">
                                <span>Expected: <code>{r.expected}</code></span>
                                <span>Got: <code>{r.actual || '(empty)'}</code></span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {submission?.status === 'passed' && task.solution && (
                <div className="solution-panel" style={{ marginTop: 'var(--spacing-xl)' }}>
                  <h4>✨ Solution</h4>
                  <pre><code>{task.solution}</code></pre>
                  {task.explanation && <p className="explanation">{task.explanation}</p>}
                </div>
              )}
            </div>
          )}

          {/* Test Results for Math */}
          {task.type === 'math' && testResults.length > 0 && (
            <div className="output-panel" style={{ marginTop: '1rem' }}>
              {testResults.map((r, i) => (
                <div key={i} className={`test-result ${r.passed ? 'passed' : 'failed'}`}>
                  <span className="test-icon">{r.passed ? '✅' : '❌'}</span>
                  <span>{r.passed ? 'Correct! Great job!' : 'Not quite right. Try again!'}</span>
                </div>
              ))}
              {submission?.status === 'passed' && task.explanation && (
                <div className="solution-panel"><h4>📝 Explanation</h4><p>{task.explanation}</p></div>
              )}
            </div>
          )}

          {/* AI Feedback Section (Appears after passing) */}
          {submission?.status === 'passed' && (
            <div style={{ marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
              {!aiFeedback && !loadingFeedback ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button className="btn btn-primary btn-lg" onClick={handleGetFeedback} style={{ padding: '0.875rem 2rem', fontSize: '1rem', boxShadow: '0 8px 20px rgba(108, 99, 255, 0.3)' }}>
                    <HiOutlineSparkles size={20} /> Get AI Feedback on My Solution
                  </button>
                </div>
              ) : (
                <div className="card" style={{ padding: 'var(--spacing-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                    <h3>✨ AI Feedback</h3>
                  </div>
                  
                  {loadingFeedback && (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                      <div className="spinner" style={{ margin: '0 auto var(--spacing-md)', width: '48px', height: '48px' }}></div>
                      <p style={{ color: 'var(--text-secondary)' }}>AI is evaluating your skills... this may take a few seconds.</p>
                    </div>
                  )}
              
              {aiFeedback && (
                <div className="feedback-markdown" dangerouslySetInnerHTML={{
                  __html: (aiFeedback.feedback_markdown || '')
                    .replace(/## (.*)/g, '<h4>$1</h4>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n- /g, '<br>• ')
                    .replace(/\n/g, '<br>')
                }} />
              )}
              {aiFeedback && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                  <div className="card" style={{ background: 'rgba(34, 197, 94, 0.08)', borderColor: 'rgba(34, 197, 94, 0.15)', padding: 'var(--spacing-md)' }}>
                    <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>💪 Strengths</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {aiFeedback.strengths?.map((s, i) => <li key={i} style={{ padding: '0.25rem 0' }}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="card" style={{ background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.15)', padding: 'var(--spacing-md)' }}>
                    <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>📈 Areas to Improve</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {aiFeedback.improvements?.map((imp, i) => <li key={i} style={{ padding: '0.25rem 0' }}>{imp}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  </div>

      {/* RIGHT: AI Chat Panel */}
      <div className={`chat-panel ${chatOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3>🤖 AI Tutor</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setChatOpen(false)}>✕</button>
        </div>

        <div className="chat-messages">
          {chatMessages.length === 0 && (
            <div className="chat-welcome">
              <span className="chat-welcome-icon">🤖</span>
              <p>Hi! I'm your AI tutor. Ask me anything about this task. I'll guide you without giving the answer directly!</p>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              <div className="chat-bubble">{msg.content}</div>
            </div>
          ))}
          {chatLoading && (
            <div className="chat-message assistant">
              <div className="chat-bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleChat}>
          <input
            className="input chat-input"
            type="text"
            placeholder={hintLevel < 3 ? "Unlock AI Tutor by using 3 hints first..." : aiChatCount >= 3 ? "AI chat limit reached (3/3)." : `Ask for help... (${3 - aiChatCount} remaining)`}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={chatLoading || hintLevel < 3 || aiChatCount >= 3}
          />
          <button type="submit" className="btn btn-primary btn-icon" disabled={chatLoading || hintLevel < 3 || aiChatCount >= 3 || !chatInput.trim()}>
            <HiOutlinePaperAirplane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskPage;
