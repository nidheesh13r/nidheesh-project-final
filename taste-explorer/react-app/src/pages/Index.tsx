import Navbar from '@/components/Navbar';
import { useAppContext } from '@/context/AppContext';
import { useEffect, useRef, useState } from 'react';
import './taste.css';

export default function Index() {
  const { isLoggedIn, login, profile, cities, city, setCity, foods, hotelsWidget, saveFood } = useAppContext();
  const [restaurantInput, setRestaurantInput] = useState('');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showRestaurantSuggestions, setShowRestaurantSuggestions] = useState(false);
  const [buttonState, setButtonState] = useState<Record<string, 'idle' | 'adding' | 'added' | 'login'>>({});
  const restaurantBoxRef = useRef<HTMLDivElement | null>(null);
  const cityBoxRef = useRef<HTMLDivElement | null>(null);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const typedTerm = restaurantInput.trim().toLowerCase();
  const term = restaurantSearch.trim().toLowerCase();
  const restaurantSuggestions = Array.from(new Set(foods.map((food: any) => food.restaurant)))
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
          <h2 style={{ marginTop: 0 }}>Must-Tries in {city}</h2>
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
        <aside className="widget">
          <div className="widget-head">
            <h3 style={{ margin: 0 }}>LUXE HOTELS</h3>
            <small>MFE Connected</small>
          </div>
          <div className="widget-body">
            <p style={{ marginTop: 0, color: '#64748b' }}>Hotels near top food hubs in {city}</p>
            {hotelsWidget.map((h: any, i: number) => (
              <div key={i} className="widget-card">
                <b>{h.hotel_name}</b>
                <p style={{ margin: '6px 0 0' }}>{h.city} • ${h.price_per_night}/night</p>
              </div>
            ))}
            <button className="pill-btn pill-indigo" style={{ width: '100%', marginTop: 12 }} onClick={() => window.open('http://localhost:5174', '_blank')}>Open Hotels Webapp</button>
          </div>
        </aside>
      </main>
    </div>
  );
}
