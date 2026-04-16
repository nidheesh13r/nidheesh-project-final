import { Link } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import '@/pages/taste.css';

export default function Navbar() {
  const { isLoggedIn, login, logout, profile } = useAppContext();

  return (
    <header className="taste-navbar">
      <div className="taste-navbar-inner">
      <Link to="/" className="taste-brand"><span className="taste-logo">T</span>LUXE Taste Explorer</Link>
      <nav className="taste-nav">
        <Link to="/library">Library</Link>
        <Link to="/profile">Profile</Link>
        {isLoggedIn ? (
          <>
            <span>{profile?.full_name || profile?.email}</span>
            <button className="pill-btn pill-dark" onClick={logout}>Sign Out</button>
          </>
        ) : (
          <button className="pill-btn pill-dark" onClick={login}>Member Login</button>
        )}
      </nav>
      </div>
    </header>
  );
}
