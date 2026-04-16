import Navbar from '@/components/Navbar';
import { useApp } from '@/context/AppContext';
import { useEffect, useState } from 'react';
import './hotels.css';

export default function Profile() {
  const { profile, isLoggedIn, saveProfile } = useApp();
  const [form, setForm] = useState(profile);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  async function handleSave() {
    await saveProfile(form);
  }

  return (
    <div className="hotels-root">
      <Navbar />
      <main style={{ padding: 24 }}>
        {!isLoggedIn ? <p>Please sign in.</p> : (
          <div className="section-card" style={{ maxWidth: 760 }}>
            <h2 style={{ marginTop: 0 }}>My Profile</h2>
            <p className="hotel-meta" style={{ marginTop: -4 }}>Basic info shown after centralized login.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label>Full Name</label>
                <input value={form.full_name || ''} onChange={(e) => setForm({ ...form, full_name: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label>Email</label>
                <input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label>Mobile</label>
                <input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1' }} />
              </div>
            </div>
            <button className="pill-btn pill-indigo" style={{ marginTop: 12 }} onClick={handleSave}>Save Profile</button>
          </div>
        )}
      </main>
    </div>
  );
}
