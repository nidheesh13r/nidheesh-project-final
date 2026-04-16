import Navbar from '@/components/Navbar';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchTasteWidget } from '@/lib/api';
import './hotels.css';

const ROOM_CLASS_OPTIONS = ['Any', 'Standard', 'Deluxe', 'Premium', 'Suite'] as const;

function roomClassFromType(roomType: string): string {
  const value = roomType.toLowerCase();
  if (value.includes('suite') || value.includes('villa') || value.includes('palace')) return 'Suite';
  if (value.includes('club') || value.includes('executive') || value.includes('premium') || value.includes('king')) return 'Premium';
  if (value.includes('luxury') || value.includes('deluxe') || value.includes('view')) return 'Deluxe';
  return 'Standard';
}

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function Index() {
  const { login, isLoggedIn, profile, city, setCity, cities, hotels } = useApp();
  const navigate = useNavigate();
  const [mfeCity, setMfeCity] = useState(city);
  const [mfeItems, setMfeItems] = useState<any[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [selectedRoomClass, setSelectedRoomClass] = useState<(typeof ROOM_CLASS_OPTIONS)[number]>('Any');
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toDateInput(d);
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return toDateInput(d);
  });
  const cityBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMfeCity(city);
  }, [city]);

  useEffect(() => {
    if (!mfeCity) return;
    fetchTasteWidget(mfeCity).then(setMfeItems);
  }, [mfeCity]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (cityBoxRef.current && target && !cityBoxRef.current.contains(target)) {
        setShowCitySuggestions(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const visibleHotels = useMemo(() => {
    if (selectedRoomClass === 'Any') return hotels;
    return hotels.filter((h: any) => roomClassFromType(h.room_type) === selectedRoomClass);
  }, [hotels, selectedRoomClass]);

  const checkOutMin = useMemo(() => {
    const d = new Date(checkIn);
    if (Number.isNaN(d.getTime())) return checkIn;
    d.setDate(d.getDate() + 1);
    return toDateInput(d);
  }, [checkIn]);

  function handleSearchClick() {
    if (!checkOut || checkOut <= checkIn) {
      setCheckOut(checkOutMin);
    }
  }

  return (
    <div className="hotels-root hotels-glass">
      <Navbar />
      <section className="hero">
        <h1>Discover your<br />perfect escape.</h1>
        <div className="search-bar">
          <div className="search-cell" ref={cityBoxRef}>
            <label>Destination</label>
            <button
              type="button"
              className="hotel-city-trigger"
              onClick={() => setShowCitySuggestions((prev) => !prev)}
            >
              <span>{city}</span>
              <span className="hotel-city-arrow">▾</span>
            </button>
            {showCitySuggestions && cities.length > 0 && (
              <div className="hotel-search-suggestions">
                {cities.map((c: string) => (
                  <button
                    key={c}
                    type="button"
                    className={`hotel-search-suggestion ${c === city ? 'hotel-search-suggestion-active' : ''}`}
                    onClick={() => {
                      setCity(c);
                      setShowCitySuggestions(false);
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="search-cell">
            <label>Check in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => {
                const value = e.target.value;
                setCheckIn(value);
                if (checkOut <= value) {
                  const d = new Date(value);
                  d.setDate(d.getDate() + 1);
                  setCheckOut(toDateInput(d));
                }
              }}
            />
          </div>
          <div className="search-cell">
            <label>Check out</label>
            <input type="date" value={checkOut} min={checkOutMin} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
          <div className="search-cell">
            <label>Room Type</label>
            <select value={selectedRoomClass} onChange={(e) => setSelectedRoomClass(e.target.value as (typeof ROOM_CLASS_OPTIONS)[number])}>
              {ROOM_CLASS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <button className="pill-btn pill-indigo" onClick={handleSearchClick}>Search</button>
        </div>
      </section>

      <main className="layout-grid">
        <section className="hotel-cards">
          {!isLoggedIn && <div className="section-card"><p>Centralized login is required.</p><button className="pill-btn pill-dark" onClick={login}>Sign In</button></div>}
          {isLoggedIn && <div className="section-card">Welcome {profile.full_name || profile.email}</div>}
          <div className="hotel-cards">
            {visibleHotels.map((h: any) => (
              <article key={h.hotel_id} className="hotel-card">
                <img className="hotel-img" src={h.image} alt={h.hotel_name} />
                <div className="hotel-body">
                  <div className="hotel-row">
                    <div>
                      <h3 style={{ margin: 0 }}>{h.hotel_name}</h3>
                      <div className="hotel-meta">{h.city} • {h.room_type}</div>
                    </div>
                    <span className="rating-badge">★ {h.rating}</span>
                  </div>
                  <div className="hotel-row">
                    <div className="perks">
                      <span>✓ Free Cancellation</span>
                      <span>✓ Pay at property</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="hotel-meta">4 nights, 2 adults</div>
                      <div style={{ fontSize: 28, fontWeight: 800 }}>${h.price_per_night}</div>
                    </div>
                  </div>
                  <div className="hotel-row">
                    <div />
                    <button
                      className="pill-btn pill-indigo"
                      onClick={() => navigate(`/booking?hotelName=${encodeURIComponent(h.hotel_name)}&city=${encodeURIComponent(h.city)}&roomType=${encodeURIComponent(selectedRoomClass === 'Any' ? h.room_type : selectedRoomClass)}&pricePerNight=${h.price_per_night}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {visibleHotels.length === 0 && (
              <div className="section-card">No hotels found for the selected room type in {city}.</div>
            )}
          </div>
        </section>
        <aside className="mfe-panel">
          <h3>Luxe Taste Explorer</h3>
          <p style={{ marginTop: 0, color: '#a1a1aa' }}>Defaulted from hotel location, but editable.</p>
          <select className="mfe-select" value={mfeCity} onChange={(e) => setMfeCity(e.target.value)}>
            {cities.map((c: string) => <option key={c}>{c}</option>)}
          </select>
          {mfeItems.map((t: any, i: number) => (
            <div key={i} className="mfe-item">
              <b>{t.title}</b>
              <p style={{ margin: '5px 0 0', color: '#a1a1aa' }}>{t.restaurant} • {t.availability}</p>
            </div>
          ))}
          <button className="pill-btn" style={{ width: '100%', marginTop: 12, background: 'linear-gradient(135deg,#e11d48,#9f1239)', color: 'white' }} onClick={() => window.open('http://localhost:5176', '_blank')}>Open Full Taste Library</button>
        </aside>
      </main>
    </div>
  );
}
