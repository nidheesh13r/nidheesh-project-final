import Navbar from '@/components/Navbar';
import { useAppContext } from '@/context/AppContext';
import { useEffect, useState } from 'react';
import './taste.css';

export default function ProfilePage() {
  const { profile, isLoggedIn, saveProfile } = useAppContext();
  const [form, setForm] = useState(profile);
  const initials = (form.full_name || form.email || 'U')
    .split(' ')
    .map((part: string) => part[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  async function handleSave() {
    await saveProfile(form);
  }

  return (
    <div className="taste-root">
      <Navbar />
      <main className="profile-shell">
        {!isLoggedIn ? (
          <section className="profile-auth-card">
            <h2>Member Access Required</h2>
            <p>Please sign in to manage your Taste Explorer profile details.</p>
          </section>
        ) : (
          <section className="profile-premium-card">
            <div className="profile-premium-head">
              <div className="profile-avatar">{initials}</div>
              <div>
                <p className="profile-kicker">LUXE MEMBER</p>
                <h2>My Profile</h2>
                <p className="profile-sub">Curate your identity across the Luxe travel ecosystem.</p>
              </div>
            </div>

            <div className="profile-metrics">
              <article>
                <span>Account Status</span>
                <strong>Verified</strong>
              </article>
              <article>
                <span>Connected Experience</span>
                <strong>Taste Explorer</strong>
              </article>
              <article>
                <span>Profile Sync</span>
                <strong>Centralized Login</strong>
              </article>
            </div>

            <div className="profile-fields">
              <div>
                <label>Full Name</label>
                <input
                  className="profile-input"
                  value={form.full_name || ''}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  className="profile-input"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label>Mobile</label>
                <input
                  className="profile-input"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <button className="pill-btn pill-indigo profile-save-btn" onClick={handleSave}>Save Profile</button>
          </section>
        )}
      </main>
    </div>
  );
}
