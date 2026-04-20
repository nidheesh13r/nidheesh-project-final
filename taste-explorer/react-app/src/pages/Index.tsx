import Navbar from '@/components/Navbar';
import { useAppContext } from '@/context/AppContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import './taste.css';

export default function Index() {
  const { isLoggedIn, login, profile, cities, city, setCity, foods, hotelsWidget, saveFood } = useAppContext();
  const [restaurantInput, setRestaurantInput] = useState('');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showRestaurantSuggestions, setShowRestaurantSuggestions] = useState(false);
  const [buttonState, setButtonState] = useState<Record<string, 'idle' | 'adding' | 'added' | 'login'>>({});
  const [checkInDate, setCheckInDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toISOString().slice(0, 10);
  });
  const [roomType, setRoomType] = useState('Any');
  const [hotelSearchTriggered, setHotelSearchTriggered] = useState(false);
  const restaurantBoxRef = useRef<HTMLDivElement | null>(null);
  const cityBoxRef = useRef<HTMLDivElement | null>(null);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const typedTerm = restaurantInput.trim().toLowerCase();
  const term = restaurantSearch.trim().toLowerCase();
  const restaurantSuggestions = Array.from<string>(
    new Set<string>(
      foods
        .map((food: any) => String(food.restaurant || '').trim())
        .filter((name: string) => Boolean(name)),
    ),
  )
    .sort((a, b) => a.localeCompare(b))
    .filter((restaurant) => restaurant.toLowerCase().startsWith(typedTerm))
    .slice(0, 10);
  const hasExactRestaurantMatch = restaurantSuggestions.some(
    (restaurant) => restaurant.toLowerCase() === typedTerm,
  );
  const filteredFoods = foods.filter((food: any) => {
    if (!term) return true;
    return String(food.restaurant || '').toLowerCase().startsWith(term);
  });

  function formatINR(value: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  const visibleHotelsWidget = useMemo(() => {
    if (roomType === 'Any') return hotelsWidget;
    return hotelsWidget.filter((hotel: any) => {
      const value = String(hotel.room_type || '').toLowerCase();
      const selected = roomType.toLowerCase();
      if (selected === 'premium') {
        return value.includes('premium') || value.includes('executive') || value.includes('club') || value.includes('king');
      }
      if (selected === 'suite') {
        return value.includes('suite') || value.includes('villa') || value.includes('palace');
      }
      return value.includes(selected);
    });
  }, [hotelsWidget, roomType]);

  const hotelResults = useMemo(() => {
    if (!hotelSearchTriggered) return [];
    return visibleHotelsWidget;
  }, [hotelSearchTriggered, visibleHotelsWidget]);

  const bookingBaseUrl = `${window.location.protocol}//${window.location.hostname}:5174/booking`;

  function buildBookingUrl(hotel: any): string {
    const params = new URLSearchParams({
      hotelName: String(hotel.hotel_name || ''),
      city: String(hotel.city || city),
      roomType: roomType === 'Any' ? String(hotel.room_type || '') : roomType,
      pricePerNight: String(hotel.price_per_night || 0),
      checkIn: checkInDate,
      checkOut: checkOutDate,
    });
    return `${bookingBaseUrl}?${params.toString()}`;
  }

  function runHotelSearch() {
    if (checkOutDate <= checkInDate) {
      const next = new Date(checkInDate);
      next.setDate(next.getDate() + 1);
      setCheckOutDate(next.toISOString().slice(0, 10));
    }
    setHotelSearchTriggered(true);
  }

  function runSearch() {
    setRestaurantSearch(restaurantInput.trim());
    setHasSearched(true);
    setShowRestaurantSuggestions(false);
    setShowCitySuggestions(false);
  }

  function foodKey(food: any) {
    return `${food.location}::${food.restaurant}::${food.food}`;
  }

  async function handleAddToLibrary(food: any) {
    const key = foodKey(food);
    if (!isLoggedIn) {
      setButtonState((prev) => ({ ...prev, [key]: 'login' }));
      login();
      return;
    }

    setButtonState((prev) => ({ ...prev, [key]: 'adding' }));
    const ok = await saveFood(food);
    setButtonState((prev) => ({ ...prev, [key]: ok ? 'added' : 'idle' }));
  }

  useEffect(() => {
    // City changes should not auto-render cards until the user explicitly searches.
    setHasSearched(false);
    setRestaurantSearch('');
    setRestaurantInput('');
    setShowRestaurantSuggestions(false);
    setShowCitySuggestions(false);
  }, [city]);

  useEffect(() => {
    setHotelSearchTriggered(false);
  }, [city, roomType, checkInDate, checkOutDate]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (cityBoxRef.current && !cityBoxRef.current.contains(target)) {
        setShowCitySuggestions(false);
      }
      if (restaurantBoxRef.current && !restaurantBoxRef.current.contains(target)) {
        setShowRestaurantSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div className="taste-root home-glass">
      <Navbar />
      <section className="hero-food">
        <h1>Savor the Heritage.</h1>
        <p>Discover the curated culinary soul of your next destination.</p>
      </section>

      <div className="search-strip">
        <div className="search-box" ref={cityBoxRef}>
          <label>City Context</label>
          <button
            type="button"
            className="city-trigger"
            onClick={() => setShowCitySuggestions((prev) => !prev)}
          >
            <span>{city}</span>
            <span className="city-trigger-arrow">▾</span>
          </button>
          {showCitySuggestions && cities.length > 0 && (
            <div className="search-suggestions city-suggestions">
              {cities.map((c: string) => (
                <button
                  key={c}
                  type="button"
                  className={`search-suggestion ${c === city ? 'search-suggestion-active' : ''}`}
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
        <div className="search-box" ref={restaurantBoxRef}>
          <label>Restaurant</label>
          <input
            value={restaurantInput}
            onChange={(e) => {
              setRestaurantInput(e.target.value);
              setShowRestaurantSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch();
            }}
            onFocus={() => setShowRestaurantSuggestions(true)}
            placeholder="Search restaurant"
            autoComplete="off"
          />
          {showRestaurantSuggestions && restaurantSuggestions.length > 0 && !hasExactRestaurantMatch && (
            <div className="search-suggestions">
              {restaurantSuggestions.map((restaurant) => (
                <button
                  type="button"
                  key={restaurant}
                  className="search-suggestion"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setRestaurantInput(restaurant);
                    setRestaurantSearch(restaurant);
                    setShowRestaurantSuggestions(false);
                  }}
                >
                  {restaurant}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="pill-btn pill-dark" onClick={runSearch}>Search</button>
      </div>

      <main className="taste-layout">
        <section>
          <h2 style={{ marginTop: 0 }}>Local Food in {city}</h2>
          {isLoggedIn && <p style={{ color: '#64748b' }}>Welcome {profile.full_name || profile.email}</p>}
          <div className="food-grid">
            {hasSearched && filteredFoods.map((f: any, i: number) => (
              <article key={i} className="food-card">
                <div className="cover" style={{ backgroundImage: `url(${f.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800'})` }} />
                <div className="food-body">
                  <span className="chip">Signature</span>
                  <h3>{f.food}</h3>
                  <p>{f.restaurant} • {f.location}</p>
                  <button
                    className="pill-btn pill-indigo"
                    onClick={() => handleAddToLibrary(f)}
                    disabled={buttonState[foodKey(f)] === 'adding' || buttonState[foodKey(f)] === 'added'}
                  >
                    {buttonState[foodKey(f)] === 'adding' && 'Adding...'}
                    {buttonState[foodKey(f)] === 'added' && 'Added'}
                    {buttonState[foodKey(f)] === 'login' && 'Login required'}
                    {(buttonState[foodKey(f)] === 'idle' || !buttonState[foodKey(f)]) && 'Add to Library'}
                  </button>
                </div>
              </article>
            ))}
            {!hasSearched && (
              <div className="food-card" style={{ gridColumn: '1 / -1' }}>
                <div className="food-body">
                  <h3>Ready to explore {city}?</h3>
                  <p>Select your city and click Search to load signature foods.</p>
                </div>
              </div>
            )}
            {hasSearched && filteredFoods.length === 0 && (
              <div className="food-card" style={{ gridColumn: '1 / -1' }}>
                <div className="food-body">
                  <h3>No matching restaurants</h3>
                  <p>Try another starting letters or clear the search to view all signature foods in {city}.</p>
                </div>
              </div>
            )}
          </div>
        </section>
        <aside className="widget hotel-widget">
          <div className="widget-head hotel-widget-head">
            <h3 style={{ margin: 0 }}>Closest Hotels</h3>
            <small className="hotel-widget-badge">MFE Connected</small>
          </div>
          <div className="widget-body hotel-widget-body">
            <div className="hotel-widget-form-grid">
              <div className="hotel-widget-field">
                <label>Area (Near Food Hub)</label>
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                  {cities.map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="hotel-widget-field">
                <label>Check In</label>
                <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
              </div>

              <div className="hotel-widget-field">
                <label>Check Out</label>
                <input type="date" min={checkInDate} value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
              </div>

              <div className="hotel-widget-field">
                <label>Room Type</label>
                <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                  <option value="Any">Any</option>
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Premium">Premium</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>
            </div>

            <button className="pill-btn hotel-widget-cta" onClick={runHotelSearch}>
              Find Hotels
            </button>

            {!hotelSearchTriggered && (
              <article className="widget-card hotel-widget-card">
                <b>Ready to find your stay?</b>
                <p>Set filters and click Find Hotels to load matching options.</p>
              </article>
            )}

            {hotelResults.map((h: any, i: number) => (
              <article key={i} className="widget-card hotel-widget-card hotel-mini-card">
                <img className="hotel-mini-image" src={h.image || '/home-hero.jpg'} alt={h.hotel_name} loading="lazy" decoding="async" />
                <div className="hotel-mini-content">
                  <div className="hotel-mini-top">
                    <div>
                      <b>{h.hotel_name}</b>
                      <p>{h.room_type} • {h.city}</p>
                    </div>
                    <span className="hotel-mini-rating">★ {h.rating}</span>
                  </div>
                  <div className="hotel-widget-price-row">
                    <strong>{formatINR(Number(h.price_per_night || 0))}</strong>
                    <span>/ night</span>
                  </div>
                  <button
                    className="pill-btn hotel-mini-book-btn"
                    onClick={() => {
                      window.location.href = buildBookingUrl(h);
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </article>
            ))}

            {hotelSearchTriggered && hotelResults.length === 0 && (
              <article className="widget-card hotel-widget-card">
                <b>No hotels available</b>
                <p>Try another city or room type to view nearby stays.</p>
              </article>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
