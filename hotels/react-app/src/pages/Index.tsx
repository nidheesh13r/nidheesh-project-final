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

function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

export default function Index() {
  const { isLoggedIn, profile, city, setCity, cities, hotels } = useApp();
  const navigate = useNavigate();
  const [mfeCity, setMfeCity] = useState(city);
  const [mfeItems, setMfeItems] = useState<any[]>([]);
  const [mfeRestaurantInput, setMfeRestaurantInput] = useState('');
  const [mfeRestaurantSearch, setMfeRestaurantSearch] = useState('');
  const [mfeHasSearched, setMfeHasSearched] = useState(false);
  const [showMfeCitySuggestions, setShowMfeCitySuggestions] = useState(false);
  const [showMfeRestaurantSuggestions, setShowMfeRestaurantSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showRoomSuggestions, setShowRoomSuggestions] = useState(false);
  const [hasHotelSearched, setHasHotelSearched] = useState(false);
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
  const roomBoxRef = useRef<HTMLDivElement | null>(null);
  const mfeCityBoxRef = useRef<HTMLDivElement | null>(null);
  const mfeRestaurantBoxRef = useRef<HTMLDivElement | null>(null);
  const checkInInputRef = useRef<HTMLInputElement | null>(null);
  const checkOutInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMfeCity(city);
  }, [city]);

  useEffect(() => {
    if (!mfeCity) return;
    fetchTasteWidget(mfeCity).then(setMfeItems);
  }, [mfeCity]);

  useEffect(() => {
    setMfeRestaurantInput('');
    setMfeRestaurantSearch('');
    setMfeHasSearched(false);
    setShowMfeCitySuggestions(false);
    setShowMfeRestaurantSuggestions(false);
  }, [mfeCity]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (cityBoxRef.current && target && !cityBoxRef.current.contains(target)) {
        setShowCitySuggestions(false);
      }
      if (roomBoxRef.current && target && !roomBoxRef.current.contains(target)) {
        setShowRoomSuggestions(false);
      }
      if (mfeRestaurantBoxRef.current && target && !mfeRestaurantBoxRef.current.contains(target)) {
        setShowMfeRestaurantSuggestions(false);
      }
      if (mfeCityBoxRef.current && target && !mfeCityBoxRef.current.contains(target)) {
        setShowMfeCitySuggestions(false);
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

  useEffect(() => {
    setHasHotelSearched(false);
  }, [city, selectedRoomClass, checkIn, checkOut]);

  const mfeTypedTerm = mfeRestaurantInput.trim().toLowerCase();
  const mfeSearchTerm = mfeRestaurantSearch.trim().toLowerCase();

  const mfeRestaurantSuggestions = useMemo(() => {
    const restaurantNames = Array.from(
      new Set(
        mfeItems
          .map((item: any) => String(item.restaurant || '').trim())
          .filter((name: string) => Boolean(name)),
      ),
    )
      .sort((a, b) => a.localeCompare(b));

    if (!mfeTypedTerm) {
      return restaurantNames.map((name) => ({ value: name, label: name }));
    }

    return restaurantNames
      .filter((name) => name.toLowerCase().includes(mfeTypedTerm))
      .map((name) => ({ value: name, label: name }));
  }, [mfeItems, mfeTypedTerm]);

  const filteredMfeItems = useMemo(() => {
    if (!mfeSearchTerm) return mfeItems;
    return mfeItems.filter((item: any) => {
      const restaurant = String(item.restaurant || '').toLowerCase();
      const title = String(item.title || '').toLowerCase();
      return restaurant.includes(mfeSearchTerm) || title.includes(mfeSearchTerm);
    });
  }, [mfeItems, mfeSearchTerm]);

  const isMfeUsingHotelDestination = mfeCity === city;
  const shouldShowMfeResults = isMfeUsingHotelDestination || mfeHasSearched;

  function runMfeSearch() {
    setMfeRestaurantSearch(mfeRestaurantInput.trim());
    setMfeHasSearched(true);
    setShowMfeRestaurantSuggestions(false);
  }

  function clearMfeSearch() {
    setMfeRestaurantInput('');
    setMfeRestaurantSearch('');
    setMfeHasSearched(false);
    setShowMfeRestaurantSuggestions(false);
  }

  function handleSearchClick() {
    if (!checkOut || checkOut <= checkIn) {
      setCheckOut(checkOutMin);
    }
    setHasHotelSearched(true);
  }

  function openDatePicker(input: HTMLInputElement | null) {
    if (!input) return;
    input.focus();
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    } else {
      input.click();
    }
  }

  return (
    <div className="hotels-root hotels-glass">
      <Navbar />
      <section className="hero">
        <h1>Discover Your Perfect Escape.</h1>
        <div className="search-bar">
          <div className="search-cell" ref={cityBoxRef}>
            <label>Destination</label>
            <button
              type="button"
              className="hotel-city-trigger"
              onClick={() => {
                setShowCitySuggestions((prev) => !prev);
                setShowRoomSuggestions(false);
              }}
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
            <div className="date-input-wrap">
              <input
                ref={checkInInputRef}
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
              <button
                type="button"
                className="date-open-btn"
                aria-label="Open check-in calendar"
                onClick={() => openDatePicker(checkInInputRef.current)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 9H4v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7ZM5 6a1 1 0 0 0-1 1v2h16V7a1 1 0 0 0-1-1H5Z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="search-cell">
            <label>Check out</label>
            <div className="date-input-wrap">
              <input ref={checkOutInputRef} type="date" value={checkOut} min={checkOutMin} onChange={(e) => setCheckOut(e.target.value)} />
              <button
                type="button"
                className="date-open-btn"
                aria-label="Open check-out calendar"
                onClick={() => openDatePicker(checkOutInputRef.current)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm13 9H4v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7ZM5 6a1 1 0 0 0-1 1v2h16V7a1 1 0 0 0-1-1H5Z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="search-cell" ref={roomBoxRef}>
            <label>Room Type</label>
            <button
              type="button"
              className="hotel-city-trigger"
              onClick={() => {
                setShowRoomSuggestions((prev) => !prev);
                setShowCitySuggestions(false);
              }}
            >
              <span>{selectedRoomClass}</span>
              <span className="hotel-city-arrow">▾</span>
            </button>
            {showRoomSuggestions && (
              <div className="hotel-search-suggestions">
                {ROOM_CLASS_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`hotel-search-suggestion ${option === selectedRoomClass ? 'hotel-search-suggestion-active' : ''}`}
                    onClick={() => {
                      setSelectedRoomClass(option);
                      setShowRoomSuggestions(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="pill-btn pill-indigo" onClick={handleSearchClick}>Search</button>
        </div>
      </section>

      <main className="layout-grid">
        <section className="hotel-cards">
          {isLoggedIn && <div className="section-card">Welcome {profile.full_name || profile.email}</div>}
          <div className="hotel-cards">
            {!hasHotelSearched && (
              <div className="section-card">Choose your destination and filters, then click Search to view hotels.</div>
            )}

            {hasHotelSearched && visibleHotels.map((h: any) => (
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
                      <div style={{ fontSize: 28, fontWeight: 800 }}>{formatINR(Number(h.price_per_night || 0))}</div>
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
            {hasHotelSearched && visibleHotels.length === 0 && (
              <div className="section-card">No hotels found for the selected room type in {city}.</div>
            )}
          </div>
        </section>
        <aside className="mfe-panel mfe-mini-explorer">
          <div className="mfe-head">
            <span className="mfe-eyebrow">Mini MFE</span>
            <h3>Luxe Taste Explorer</h3>
            <p>Search signature dishes by restaurant within the selected city.</p>
          </div>

          <div className="mfe-control-group" ref={mfeCityBoxRef}>
            <label>City</label>
            <button
              type="button"
              className="mfe-city-trigger"
              onClick={() => setShowMfeCitySuggestions((prev) => !prev)}
            >
              <span>{mfeCity}</span>
              <span className="mfe-city-arrow">▾</span>
            </button>
            {showMfeCitySuggestions && (
              <div className="mfe-suggestions mfe-city-suggestions">
                {cities.map((c: string) => (
                  <button
                    key={c}
                    type="button"
                    className={`mfe-suggestion-btn ${c === mfeCity ? 'mfe-suggestion-btn-active' : ''}`}
                    onClick={() => {
                      setMfeCity(c);
                      setShowMfeCitySuggestions(false);
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mfe-control-group" ref={mfeRestaurantBoxRef}>
            <label htmlFor="mfe-restaurant-input">Restaurant Search</label>
            <input
              id="mfe-restaurant-input"
              className="mfe-input"
              value={mfeRestaurantInput}
              placeholder="Type restaurant name"
              autoComplete="off"
              onFocus={() => setShowMfeRestaurantSuggestions(true)}
              onChange={(e) => {
                setMfeRestaurantInput(e.target.value);
                setShowMfeRestaurantSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') runMfeSearch();
              }}
            />
            {showMfeRestaurantSuggestions && mfeRestaurantSuggestions.length > 0 && (
              <div className="mfe-suggestions">
                {mfeRestaurantSuggestions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="mfe-suggestion-btn"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setMfeRestaurantInput(option.value);
                      setShowMfeRestaurantSuggestions(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mfe-actions">
            <button className="pill-btn mfe-search-btn" onClick={runMfeSearch}>Search</button>
            <button className="pill-btn pill-outline mfe-clear-btn" onClick={clearMfeSearch}>Clear</button>
          </div>

          <div className="mfe-results">
            {!shouldShowMfeResults && (
              <div className="mfe-empty-state">
                <b>Search to view results</b>
                <p>For cities other than {city}, click Search to load matching dishes.</p>
              </div>
            )}

            {shouldShowMfeResults && filteredMfeItems.map((t: any, i: number) => (
              <article key={`${t.title || 'dish'}-${i}`} className="mfe-item mfe-item-rich">
                <div className="mfe-item-top">
                  <b>{t.title}</b>
                  <span className="mfe-availability-chip">{t.availability || 'Limited'}</span>
                </div>
                <p>{t.restaurant} • {mfeCity}</p>
              </article>
            ))}

            {shouldShowMfeResults && filteredMfeItems.length === 0 && (
              <div className="mfe-empty-state">
                <b>No matches found</b>
                <p>Try a different restaurant keyword or clear your search.</p>
              </div>
            )}
          </div>

          <button
            className="pill-btn mfe-open-btn"
            onClick={() => window.open('http://localhost:5176', '_blank')}
          >
            Open Full Taste Library
          </button>
        </aside>
      </main>
    </div>
  );
}
