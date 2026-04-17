import Navbar from '@/components/Navbar';
import { useApp } from '@/context/AppContext';
import { useEffect, useMemo, useState } from 'react';
import './hotels.css';

type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
};

function normalize(value: string): string {
  return String(value || '').trim();
}

export default function Profile() {
  const { profile, isLoggedIn, saveProfile } = useApp();
  const [form, setForm] = useState<ProfileForm>(profile);
  const [touched, setTouched] = useState<{ full_name: boolean; email: boolean; phone: boolean }>({
    full_name: false,
    email: false,
    phone: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setForm(profile);
    setTouched({ full_name: false, email: false, phone: false });
  }, [profile]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const normalizedProfile = useMemo(() => ({
    full_name: normalize(profile.full_name),
    email: normalize(profile.email),
    phone: normalize(profile.phone),
  }), [profile]);

  const normalizedForm = useMemo(() => ({
    full_name: normalize(form.full_name),
    email: normalize(form.email),
    phone: normalize(form.phone),
  }), [form]);

  const validation = useMemo(() => {
    const nameError = normalizedForm.full_name.length < 2 ? 'Please enter your full name.' : '';
    const emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedForm.email) ? 'Enter a valid email address.' : '';
    const phoneDigits = normalizedForm.phone.replace(/\D/g, '');
    const phoneError = phoneDigits.length < 7 ? 'Enter a valid mobile number.' : '';
    return {
      full_name: nameError,
      email: emailError,
      phone: phoneError,
    };
  }, [normalizedForm]);

  const hasChanges = useMemo(() => (
    normalizedForm.full_name !== normalizedProfile.full_name
    || normalizedForm.email !== normalizedProfile.email
    || normalizedForm.phone !== normalizedProfile.phone
  ), [normalizedForm, normalizedProfile]);

  const hasErrors = Boolean(validation.full_name || validation.email || validation.phone);
  const canSave = hasChanges && !hasErrors && !isSaving;

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function markTouched(field: keyof ProfileForm) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSave() {
    if (!canSave) return;
    setIsSaving(true);
    const updated = await saveProfile({
      full_name: normalizedForm.full_name,
      email: normalizedForm.email,
      phone: normalizedForm.phone,
    });
    setIsSaving(false);

    if (updated) {
      setToastMessage('Profile saved successfully.');
      setTouched({ full_name: false, email: false, phone: false });
      return;
    }
    setToastMessage('Profile update failed. Please try again.');
  }

  return (
    <div className="hotels-root profile-page">
      <Navbar />
      <main className="profile-main">
        {!isLoggedIn ? (
          <div className="profile-shell">
            <section className="profile-card profile-card-main">
              <h1 className="profile-title">Please sign in</h1>
              <p className="profile-subtitle">Sign in to manage your profile details and hotel preferences.</p>
            </section>
          </div>
        ) : (
          <div className="profile-shell">
            <section className="profile-card profile-card-main">
              <div className="profile-hero">
                <div>
                  <p className="profile-kicker">Luxe Member Profile</p>
                  <h1 className="profile-title">Personal Details</h1>
                  <p className="profile-subtitle">Keep your information up to date for a seamless booking experience.</p>
                </div>
                <div className="profile-avatar" aria-hidden="true">
                  {normalize(form.full_name).slice(0, 1).toUpperCase() || 'G'}
                </div>
              </div>

              <div className="profile-grid">
                <div className={`profile-field ${touched.full_name && validation.full_name ? 'is-error' : ''} ${touched.full_name && !validation.full_name ? 'is-success' : ''}`}>
                  <label className="profile-floating-wrap">
                    <span className="profile-input-icon" aria-hidden="true">👤</span>
                    <input
                      value={form.full_name || ''}
                      onChange={(e) => updateField('full_name', e.target.value)}
                      onBlur={() => markTouched('full_name')}
                      placeholder=" "
                    />
                    <span className="profile-floating-label">Full Name</span>
                  </label>
                  <p className={`profile-validation ${validation.full_name ? 'is-error' : 'is-success'}`}>
                    {touched.full_name ? (validation.full_name || 'Looks good.') : ' '}
                  </p>
                </div>

                <div className={`profile-field ${touched.email && validation.email ? 'is-error' : ''} ${touched.email && !validation.email ? 'is-success' : ''}`}>
                  <label className="profile-floating-wrap">
                    <span className="profile-input-icon" aria-hidden="true">✉</span>
                    <input
                      value={form.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      onBlur={() => markTouched('email')}
                      placeholder=" "
                    />
                    <span className="profile-floating-label">Email</span>
                  </label>
                  <p className={`profile-validation ${validation.email ? 'is-error' : 'is-success'}`}>
                    {touched.email ? (validation.email || 'Looks good.') : ' '}
                  </p>
                </div>

                <div className={`profile-field profile-field-full ${touched.phone && validation.phone ? 'is-error' : ''} ${touched.phone && !validation.phone ? 'is-success' : ''}`}>
                  <label className="profile-floating-wrap">
                    <span className="profile-input-icon" aria-hidden="true">☎</span>
                    <input
                      value={form.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      onBlur={() => markTouched('phone')}
                      placeholder=" "
                    />
                    <span className="profile-floating-label">Mobile</span>
                  </label>
                  <p className={`profile-validation ${validation.phone ? 'is-error' : 'is-success'}`}>
                    {touched.phone ? (validation.phone || 'Looks good.') : ' '}
                  </p>
                </div>
              </div>

              <div className="profile-actions">
                <button className="profile-save-btn" onClick={handleSave} disabled={!canSave}>
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
                <p className="profile-meta">{hasChanges ? 'You have unsaved changes.' : 'All changes saved.'}</p>
              </div>
            </section>
          </div>
        )}

        {toastMessage && (
          <div className="profile-toast" role="status" aria-live="polite">
            {toastMessage}
          </div>
        )}
      </main>
    </div>
  );
}
