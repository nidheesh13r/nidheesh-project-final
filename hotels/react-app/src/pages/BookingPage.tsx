import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useApp } from '@/context/AppContext';
import './hotels.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function maxGuestsPerRoom(roomType: string): number {
  const value = roomType.toLowerCase();
  if (value.includes('suite') || value.includes('villa') || value.includes('palace')) return 4;
  if (value.includes('premium') || value.includes('executive') || value.includes('club') || value.includes('king')) return 3;
  if (value.includes('deluxe') || value.includes('luxury')) return 2;
  return 2;
}

function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

export default function BookingPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const { bookStay } = useApp();
  const hotelName = query.get('hotelName') || 'Selected Hotel';
  const city = query.get('city') || 'Miami';
  const defaultRoomType = query.get('roomType') || 'Deluxe';
  const pricePerNight = Number(query.get('pricePerNight') || 0);
  const [roomType, setRoomType] = useState(defaultRoomType);
  const [checkIn, setCheckIn] = useState(query.get('checkIn') || '2026-04-10');
  const [checkOut, setCheckOut] = useState(query.get('checkOut') || '2026-04-14');
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [govId, setGovId] = useState('');
  const [error, setError] = useState('');

  const nights = useMemo(() => {
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
    return Math.max(1, Math.ceil((end - start) / 86400000)) - 1;
  }, [checkIn, checkOut]);

  const maxPerRoom = useMemo(() => maxGuestsPerRoom(roomType), [roomType]);
  const maxGuests = maxPerRoom * rooms;

  const total = useMemo(() => {
    if (nights <= 0) return 0;
    return nights * pricePerNight * rooms;
  }, [nights, pricePerNight, rooms]);

  const roomTypeOptions = useMemo(() => {
    const base = ['Standard', 'Deluxe', 'Premium', 'Suite'];
    return Array.from(new Set([roomType, ...base]));
  }, [roomType]);

  async function handleConfirm() {
    if (nights <= 0) {
      setError('Check-out date must be after check-in date.');
      return;
    }
    if (guests < 1) {
      setError('At least one guest is required.');
      return;
    }
    if (guests > maxGuests) {
      setError(`Selected ${roomType} allows up to ${maxPerRoom} guests per room. Increase rooms or reduce guests.`);
      return;
    }
    if (!/^[0-9]{100}$/.test(govId.trim())) {
      setError('Enter a valid government ID (6-24 characters, letters, numbers or hyphen).');
      return;
    }
    setError('');
    try {
      const booking = await bookStay({
        hotel_name: hotelName,
        city,
        room_type: roomType,
        check_in: checkIn,
        check_out: checkOut,
        total_price: total,
        num_rooms: rooms,
        num_guests: guests,
        gov_id: govId.trim(),
      });

      if (!booking) {
        setError('Booking failed. Please try again.');
        return;
      }

      navigate('/my-bookings');
    } catch (err: any) {
      setError(err?.message || 'Booking failed. Please try again.');
    }
  }

  return (
    <div className="hotels-root booking-luxe">
      <Navbar />
      <main className="booking-main">
        <div className="booking-shell booking-shell-luxe">
          <section className="section-card booking-card booking-hero-card">
            <p className="booking-eyebrow">Reservation</p>
            <h1 className="booking-title">Craft Your Signature Stay</h1>
            <p className="booking-subtitle">Select dates, room type, guest count, and verify booking with your government ID.</p>
            <div className="booking-grid">
              <div className="field"><label>Hotel</label><input value={hotelName} readOnly /></div>
              <div className="field"><label>City</label><input value={city} readOnly /></div>
              <div className="field">
                <label>Room Type</label>
                <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                  {roomTypeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="field"><label>Price Per Night</label><input value={formatINR(pricePerNight)} readOnly /></div>
              <div className="field">
                <label>Check In</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
              <div className="field">
                <label>Check Out</label>
                <input type="date" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
              <div className="field">
                <label>No. of Rooms</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={rooms}
                  onChange={(e) => setRooms(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
              <div className="field">
                <label>No. of Guests</label>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, maxGuests)}
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
              <div className="field booking-id-field">
                <label>Government ID</label>
                <input
                  type="text"
                  value={govId}
                  placeholder="Passport / Aadhaar / Driver ID"
                  onChange={(e) => setGovId(e.target.value)}
                />
              </div>
            </div>
            <div className="booking-capacity">{roomType} allows up to {maxPerRoom} guests per room. Current max for {rooms} room(s): {maxGuests} guests.</div>
            {error && <div className="booking-error">{error}</div>}
          </section>

          <aside className="section-card booking-card booking-summary-card">
            <h2>Booking Summary</h2>
            <div className="booking-summary-row"><span>Nights</span><b>{nights}</b></div>
            <div className="booking-summary-row"><span>Rooms</span><b>{rooms}</b></div>
            <div className="booking-summary-row"><span>Guests</span><b>{guests}</b></div>
            <div className="booking-summary-row"><span>Rate / Night</span><b>{formatINR(pricePerNight)}</b></div>
            <div className="booking-summary-row booking-summary-total"><span>Total</span><b>{formatINR(total)}</b></div>
            <button className="pill-btn booking-confirm-btn" onClick={handleConfirm}>Confirm Elegant Booking</button>
          </aside>
        </div>
      </main>
    </div>
  );
}
