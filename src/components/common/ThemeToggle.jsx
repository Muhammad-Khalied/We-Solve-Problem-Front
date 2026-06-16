import { useState, useEffect } from 'react';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';

const ThemeToggle = ({ className = '', style = {}, iconSize = 20 }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <button 
      type="button"
      className={`btn btn-ghost btn-icon ${className}`} 
      onClick={toggleTheme} 
      title="Toggle Theme"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}
    >
      {theme === 'dark' ? <HiOutlineSun size={iconSize} /> : <HiOutlineMoon size={iconSize} />}
    </button>
  );
};

export default ThemeToggle;
