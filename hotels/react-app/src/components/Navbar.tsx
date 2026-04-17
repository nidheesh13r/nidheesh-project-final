import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import '@/pages/hotels.css';

export default function Navbar() {
  const { isLoggedIn, login, logout, profile } = useApp();
  const location = useLocation();
  const isHomeActive = location.pathname === '/';
  const isTripsActive = location.pathname === '/my-bookings';
  const isProfileActive = location.pathname === '/profile';

  return (
    <header className="hotels-navbar">
      <div className="hotels-navbar-inner">
        <Link to="/" className="hotels-brand">LUXE Hotels <span className="hotels-badge">Host Shell</span></Link>
        <nav className="hotels-nav">
          <Link to="/" className={isHomeActive ? 'is-active' : ''}>Home</Link>
          <Link to="/my-bookings" className={isTripsActive ? 'is-active' : ''}>My Bookings</Link>
          <Link to="/profile" className={isProfileActive ? 'is-active' : ''}>Profile</Link>
          {isLoggedIn ? (
            <div className="profile-chip">
              <span className="profile-chip-avatar" aria-hidden="true">
                {(profile.full_name || 'G').slice(0, 1).toUpperCase()}
              </span>
              <div>
                <b>{profile.full_name || 'Guest User'}</b>
              </div>
              <button className="pill-btn pill-dark" onClick={logout}>Sign Out</button>
            </div>
          ) : (
            <button className="pill-btn pill-dark" onClick={login}>Sign In</button>
          )}
        </nav>
      </div>
    </header>
  );
}
