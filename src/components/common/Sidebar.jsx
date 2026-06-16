import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineMap,
  HiOutlineTrophy,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineSparkles
} from 'react-icons/hi2';
import { HiOutlineXMark } from 'react-icons/hi2';
import './Sidebar.css';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();

  const studentLinks = [
    { to: '/dashboard', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/roadmap', icon: <HiOutlineMap />, label: 'Roadmap' },
    { to: '/leaderboard', icon: <HiOutlineTrophy />, label: 'Leaderboard' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/roadmap', icon: <HiOutlineMap />, label: 'Roadmap' },
    { to: '/leaderboard', icon: <HiOutlineTrophy />, label: 'Leaderboard' },
    { to: '/admin', icon: <HiOutlineChartBar />, label: 'Analytics' },
    { to: '/admin/students', icon: <HiOutlineUsers />, label: 'Students' },
    { to: '/admin/content', icon: <HiOutlineDocumentText />, label: 'Content' },
    { to: '/admin/roadmap-editor', icon: <HiOutlineMap />, label: 'Roadmap Editor' },
    { to: '/admin/ai-generator', icon: <HiOutlineSparkles />, label: 'AI Generator' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <img src="/logo.png" alt="WE solve problems logo" className="brand-logo-img" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <div>
              <h2 style={{ fontSize: '1.2rem' }}>WE solve problems</h2>
            </div>
          </div>
          <button className="btn-icon sidebar-close-btn" onClick={() => setIsOpen(false)}>
            <HiOutlineXMark size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/dashboard' || link.to === '/admin'}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sidebar-link-icon">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
        </div>
    </aside>
    </>
  );
};

export default Sidebar;
