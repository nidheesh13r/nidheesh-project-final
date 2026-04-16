import Navbar from '@/components/Navbar';
import { useApp } from '@/context/AppContext';
import './hotels.css';

export default function MyBookings() {
  const { bookings, cancelStay } = useApp();

  return (
    <div className="hotels-root">
      <Navbar />
      <main style={{ padding: 24 }}>
        <h1>My Bookings</h1>
        {bookings.length === 0 ? (
          <div className="section-card">No bookings yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {bookings.map((b: any) => (
              <div key={b.booking_id} className="section-card">
                <div className="hotel-row">
                  <div>
                    <p style={{ margin: 0 }}><b>{b.hotel_name}</b> ({b.city})</p>
                    <p className="hotel-meta" style={{ margin: '6px 0 0' }}>{b.room_type} | {b.check_in} to {b.check_out}</p>
                    <p className="hotel-meta" style={{ margin: '6px 0 0' }}>Rooms: {b.num_rooms || 1} | Guests: {b.num_guests || 1}</p>
                  </div>
                  <span className="rating-badge" style={{ background: b.status === 'CANCELLED' ? '#b91c1c' : '#0f172a' }}>{b.status}</span>
                </div>
                <div className="hotel-row" style={{ marginTop: 8 }}>
                  <p style={{ margin: 0, fontWeight: 700 }}>Total: ${b.total_price}</p>
                  {b.status !== 'CANCELLED' && <button className="pill-btn pill-outline" onClick={() => cancelStay(b.booking_id)}>Cancel Booking</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
