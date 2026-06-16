import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';
import ThemeToggle from '../components/common/ThemeToggle';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', classSection: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.classSection);
      toast.success('Account created! Let\'s start learning 🚀');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="auth-container">
        <div className="auth-theme-toggle">
          <ThemeToggle style={{ background: 'var(--bg-elevated)', borderRadius: '50%', padding: '0.75rem', width: 'auto', height: 'auto', border: '1px solid var(--border-color)' }} iconSize={24} />
        </div>
        <div className="auth-card">
          <div className="auth-header">
            <img src="/logo.png" alt="WE solve problems logo" className="auth-logo" style={{ width: '64px', height: '64px', margin: '0 auto', marginBottom: '1rem', objectFit: 'contain' }} />
            <h1>Create Account</h1>
            <p>Join WE solve problems and start your journey</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" className="input" placeholder="Enter your name"
                value={form.name} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" name="email" type="email" className="input" placeholder="Enter your email"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" name="password" type="password" className="input" placeholder="Min 6 characters"
                value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <div className="input-group">
              <label htmlFor="classSection">Class Section</label>
              <select id="classSection" name="classSection" className="input"
                value={form.classSection} onChange={handleChange} required>
                <option value="">-- Select your Class --</option>
                <option value="1A">Grade 10 - Section A (1A)</option>
                <option value="1B">Grade 10 - Section B (1B)</option>
                <option value="1C">Grade 10 - Section C (1C)</option>
                <option value="2A">Grade 11 - Section A (2A)</option>
                <option value="2B">Grade 11 - Section B (2B)</option>
                <option value="2C">Grade 11 - Section C (2C)</option>
                <option value="3A">Grade 12 - Section A (3A)</option>
                <option value="3B">Grade 12 - Section B (3B)</option>
                <option value="3C">Grade 12 - Section C (3C)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? <span className="spinner" style={{width:20,height:20,borderWidth:2}}></span> : 'Create Account'}
            </button>
          </form>
          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
