import { createContext, useContext, useEffect, useState } from 'react';
import { initAuth, loginRedirect, signOut } from '@/auth';
import * as api from '@/lib/api';

const AppContext = createContext(null as any);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '' });
  const [cities, setCities] = useState<string[]>([]);
  const [city, setCity] = useState('Miami');
  const [hotels, setHotels] = useState<any[]>([]);
  const [tasteWidget, setTasteWidget] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => { initAuth().then(setUser); }, []);

  useEffect(() => {
    api.fetchCities().then((items) => {
      setCities(items);
      if (items.length > 0) setCity(items[0]);
    });
  }, []);

  useEffect(() => {
    if (!city) return;
    api.searchHotels(city).then(setHotels);
    api.fetchTasteWidget(city).then(setTasteWidget);
  }, [city]);

  useEffect(() => {
    if (!user?.email) return;
    api.fetchMyBookings(user.email).then(setBookings);
    api.fetchProfile(user.email).then((p) => {
      if (p) setProfile(p);
    });
  }, [user]);

  useEffect(() => {
    if (!user || profile.email) return;
    setProfile({ full_name: user.user_metadata?.full_name || '', email: user.email || '', phone: '' });
  }, [user, profile.email]);

  async function bookStay(payload: any) {
    const booking = await api.createBooking({ ...payload, email: user?.email || 'guest@example.com' });
    if (booking) setBookings((prev) => [booking, ...prev]);
    return booking;
  }

  async function cancelStay(bookingId: number) {
    const ok = await api.cancelBooking(bookingId);
    if (ok) {
      setBookings((prev) => prev.map((b) => (b.booking_id === bookingId ? { ...b, status: 'CANCELLED' } : b)));
    }
    return ok;
  }

  async function saveProfile(nextProfile: { full_name: string; email: string; phone: string }) {
    const updated = await api.updateProfile(nextProfile);
    if (updated) setProfile(updated);
    return updated;
  }

  async function logout() {
    await signOut();
    setUser(null);
    setBookings([]);
    setProfile({ full_name: '', email: '', phone: '' });
  }

  return (
    <AppContext.Provider value={{ user, profile, login: loginRedirect, logout, isLoggedIn: !!user, setProfile, saveProfile, cities, city, setCity, hotels, tasteWidget, bookings, bookStay, cancelStay }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
