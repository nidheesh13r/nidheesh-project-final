import Navbar from '@/components/Navbar';
import { useAppContext } from '@/context/AppContext';
import './taste.css';

export default function LibraryPage() {
  const { library, removeFood } = useAppContext();
  const grouped: Record<string, any[]> = library.reduce((acc: Record<string, any[]>, item: any) => {
    const key = item.location || 'Unknown';
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, any[]>);
  const totalSaved = library.length;
  const cityCount = Object.keys(grouped).length;

  return (
    <div className="taste-root">
      <Navbar />
      <main className="library-shell">
        <section className="library-hero">
          <p className="library-kicker">Royal Collection</p>
          <h1>My Flavor Treasury</h1>
          <p>Every signature dish you saved, curated like a private culinary vault.</p>
          <div className="library-stats">
            <article>
              <span>Saved Dishes</span>
              <strong>{totalSaved}</strong>
            </article>
            <article>
              <span>City Chapters</span>
              <strong>{cityCount}</strong>
            </article>
          </div>
        </section>

        {Object.keys(grouped).length === 0 ? (
          <section className="library-empty-card">
            <h3>Your library is empty</h3>
            <p>Save signature foods from the Discover page to build your royal collection.</p>
          </section>
        ) : (
          <div className="library-city-list">
            {Object.entries(grouped).map(([location, items]) => (
              <section key={location} className="library-city-card">
                <div className="library-city-head">
                  <h3>{location}</h3>
                  <span>{items.length} items</span>
                </div>
                <div className="library-grid-rich">
                  {items.map((item: any, index: number) => (
                    <article key={`${location}-${index}`} className="library-item-card">
                      <button
                        className="lib-remove-btn"
                        onClick={() => removeFood(item.food, item.restaurant)}
                        title="Remove from library"
                        type="button"
                      >
                        Remove
                      </button>
                      <div className="library-item-top">
                        <span>Signature</span>
                        <small>#{index + 1}</small>
                      </div>
                      <h4>{item.food}</h4>
                      <p>{item.restaurant}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
