import Navbar from '@/components/Navbar';
import { useApp } from '@/context/AppContext';
import './hotels.css';

function statusMeta(status: string) {
  if (status === 'CANCELLED') {
    return { label: 'Cancelled', icon: '✕', tone: 'is-cancelled' };
  }

  return { label: 'Confirmed', icon: '✓', tone: 'is-confirmed' };
}

function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

export default function MyBookings() {
  const { bookings, cancelStay, allHotels } = useApp();

  const activeBookings = bookings.filter((booking: any) => booking.status !== 'CANCELLED');
  const cancelledBookings = bookings.filter((booking: any) => booking.status === 'CANCELLED');
  const totalSpent = bookings.reduce((sum: number, booking: any) => sum + Number(booking.total_price || 0), 0);

  const getBookingImage = (booking: any) => {
    const matchedHotel = allHotels.find((hotel: any) => hotel.hotel_name === booking.hotel_name && hotel.city === booking.city);
    return matchedHotel?.image || '/home-hero.jpg';
  };

  return (
    <div className="hotels-root bookings-page">
      <Navbar />
      <main className="bookings-main">
        <section className="bookings-hero section-card">
          <div>
            <p className="bookings-kicker">Luxe travel dashboard</p>
            <h1 className="bookings-title">My Bookings</h1>
          </div>
          <div className="bookings-avatar" aria-hidden="true">
            {bookings.length ? bookings.length.toString().slice(0, 2) : '0'}
          </div>
        </section>

        <section className="bookings-summary-grid">
          <article className="bookings-summary-card">
            <span>Total Trips</span>
            <strong>{bookings.length}</strong>
          </article>
          <article className="bookings-summary-card">
            <span>Confirmed</span>
            <strong>{activeBookings.length}</strong>
          </article>
          <article className="bookings-summary-card">
            <span>Cancelled</span>
            <strong>{cancelledBookings.length}</strong>
          </article>
          <article className="bookings-summary-card">
            <span>Total Spent</span>
            <strong>{formatINR(totalSpent)}</strong>
          </article>
        </section>

        {bookings.length === 0 ? (
          <div className="bookings-empty section-card">
            <div className="bookings-empty-icon">✦</div>
            <h2>No bookings yet</h2>
            <p>Your future trips will appear here once you complete a reservation.</p>
          </div>
        ) : (
          <div className="bookings-groups">
            <section className="bookings-group">
              <div className="bookings-group-header">
                <div>
                  <p className="bookings-group-kicker">Confirmed stays</p>
                  <h2>Active bookings</h2>
                </div>
                <span className="bookings-group-count">{activeBookings.length}</span>
              </div>

              <div className="bookings-list">
                {activeBookings.map((booking: any) => {
                  const meta = statusMeta(booking.status);
                  const bookingImage = getBookingImage(booking);
                  return (
                    <article key={booking.booking_id} className="booking-card booking-card-active booking-card-compact">
                      <div className="booking-card-media booking-card-media-square">
                        <img className="booking-card-image" src={bookingImage} alt={booking.hotel_name} loading="lazy" decoding="async" />
                      </div>
                      <div className="booking-card-body">
                        <div className="booking-card-top">
                          <div>
                            <p className="booking-card-location">{booking.city}</p>
                            <h3 className="booking-card-title">{booking.hotel_name}</h3>
                            <p className="booking-card-copy">{booking.room_type} · {booking.check_in} to {booking.check_out}</p>
                          </div>
                          <span className={`booking-badge ${meta.tone}`}>
                            <span>{meta.icon}</span>
                            {meta.label}
                          </span>
                        </div>

                        <div className="booking-card-footer">
                          <div>
                            <p className="booking-card-total-label">Total price</p>
                            <p className="booking-card-total">{formatINR(Number(booking.total_price || 0))}</p>
                          </div>
                          <button className="booking-cancel-btn" onClick={() => cancelStay(booking.booking_id)}>
                            Cancel Booking
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {cancelledBookings.length > 0 && (
              <section className="bookings-group">
                <div className="bookings-group-header">
                  <div>
                    <p className="bookings-group-kicker">Cancelled stays</p>
                    <h2>Past bookings</h2>
                  </div>
                  <span className="bookings-group-count">{cancelledBookings.length}</span>
                </div>

                <div className="bookings-list">
                  {cancelledBookings.map((booking: any) => {
                    const meta = statusMeta(booking.status);
                    const bookingImage = getBookingImage(booking);
                    return (
                      <article key={booking.booking_id} className="booking-card booking-card-cancelled booking-card-compact">
                        <div className="booking-card-media booking-card-media-square">
                          <img className="booking-card-image" src={bookingImage} alt={booking.hotel_name} loading="lazy" decoding="async" />
                        </div>
                        <div className="booking-card-body">
                          <div className="booking-card-top">
                            <div>
                              <p className="booking-card-location">{booking.city}</p>
                              <h3 className="booking-card-title">{booking.hotel_name}</h3>
                              <p className="booking-card-copy">{booking.room_type} · {booking.check_in} to {booking.check_out}</p>
                            </div>
                            <span className={`booking-badge ${meta.tone}`}>
                              <span>{meta.icon}</span>
                              {meta.label}
                            </span>
                          </div>

                          <div className="booking-card-footer booking-card-footer-muted">
                            <div>
                              <p className="booking-card-total-label">Total price</p>
                              <p className="booking-card-total">{formatINR(Number(booking.total_price || 0))}</p>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        <section className="bookings-footer-card section-card">
          <p className="bookings-group-kicker">Travel support</p>
          <h2>Need to adjust plans?</h2>
          <p>Review your active trips above or head back to search for a new stay when your itinerary changes.</p>
        </section>
      </main>
    </div>
  );
}
