export interface HotelItem {
  hotel_id: number;
  hotel_name: string;
  city: string;
  room_type: string;
  rating: number;
  price_per_night: number;
  image: string;
}

export interface BookingItem {
  booking_id: number;
  hotel_name: string;
  city: string;
  room_type: string;
  check_in: string;
  check_out: string;
  num_rooms: number;
  num_guests: number;
  gov_id: string;
  total_price: number;
  status: string;
}

export interface ProfileItem {
  full_name: string;
  email: string;
  phone: string;
}

export async function fetchProfile(email: string): Promise<ProfileItem | null> {
  const res = await fetch(`/users/profile?email=${encodeURIComponent(email)}`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateProfile(profile: ProfileItem): Promise<ProfileItem | null> {
  const res = await fetch('/users/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchCities(): Promise<string[]> {
  const res = await fetch('/cities');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.cities) ? data.cities : [];
}

export async function searchHotels(city: string): Promise<HotelItem[]> {
  const query = city ? `?city=${encodeURIComponent(city)}` : '';
  const res = await fetch(`/hotels/search${query}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchAllHotels(): Promise<HotelItem[]> {
  return searchHotels('');
}

export async function fetchTasteWidget(city: string): Promise<any[]> {
  const res = await fetch(`/widget/taste?city=${encodeURIComponent(city)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.items) ? data.items : [];
}

export async function fetchMyBookings(email: string): Promise<BookingItem[]> {
  const res = await fetch(`/bookings/my?email=${encodeURIComponent(email)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createBooking(payload: any): Promise<any> {
  const res = await fetch('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.ok) return res.json();

  let detail = 'Booking failed. Please try again.';
  try {
    const data = await res.json();
    if (typeof data?.detail === 'string' && data.detail.trim()) {
      detail = data.detail;
    }
  } catch {
    // Keep fallback error message when response is not JSON.
  }

  throw new Error(detail);
}

export async function cancelBooking(bookingId: number): Promise<boolean> {
  const res = await fetch(`/bookings/${bookingId}/cancel`, { method: 'POST' });
  return res.ok;
}
