import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import '@/pages/hotels.css';

export default function Navbar() {
  const { isLoggedIn, login, logout, profile } = useApp();

  return (
    <header className="hotels-navbar">
      <div className="hotels-navbar-inner">
        <Link to="/" className="hotels-brand">LUXE Hotels <span className="hotels-badge">Host Shell</span></Link>
        <nav className="hotels-nav">
          <Link to="/my-bookings">My Trips</Link>
          <Link to="/profile">Profile</Link>
        {isLoggedIn ? (
          <div className="profile-chip">
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
