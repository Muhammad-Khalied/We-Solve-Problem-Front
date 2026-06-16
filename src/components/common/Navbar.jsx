import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowRightOnRectangle, HiOutlineBars3 } from 'react-icons/hi2';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={onMenuClick} title="Menu">
            <HiOutlineBars3 size={24} />
          </button>
          <h3 className="navbar-greeting">
            Welcome back, <span className="navbar-username">{user?.name?.split(' ')[0]}</span> 👋
          </h3>
        </div>

        <div className="navbar-right">
          {user?.streak?.current > 0 && (
            <div className="streak-badge" title="Current streak">
              🔥 {user.streak.current} day{user.streak.current !== 1 ? 's' : ''}
            </div>
          )}
          <div className="score-badge" title="Total score">
            ⭐ {user?.totalScore || 0}
          </div>
          <ThemeToggle />
          <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout">
            <HiOutlineArrowRightOnRectangle size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
