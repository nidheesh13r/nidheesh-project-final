import { createContext, useContext, useEffect, useState } from 'react';
import { initAuth, loginRedirect, signOut } from '@/auth';
import * as api from '@/lib/api';

const AppContext = createContext(null as any);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '' });
  const [library, setLibrary] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [city, setCity] = useState('Mumbai');
  const [foods, setFoods] = useState<any[]>([]);
  const [hotelsWidget, setHotelsWidget] = useState<any[]>([]);

  useEffect(() => { initAuth().then(setUser); }, []);

  useEffect(() => {
    api.fetchCities().then((items) => {
      setCities(items);
      if (items.length > 0) setCity(items[0]);
    });
  }, []);

  useEffect(() => {
    if (!city) return;
    let alive = true;

    api.searchSignatureFoods(city)
      .then((items) => {
        if (alive) setFoods(items);
      })
      .catch(() => {
        if (alive) setFoods([]);
      });

    api.fetchHotelsWidget(city)
      .then((items) => {
        if (alive) setHotelsWidget(items);
      })
      .catch(() => {
        if (alive) setHotelsWidget([]);
      });

    return () => {
      alive = false;
    };
  }, [city]);

  useEffect(() => {
    if (!user?.email) return;
    api.fetchLibrary(user.email).then(setLibrary);
    api.fetchProfile(user.email).then((p) => {
      if (p) setProfile(p);
    });
  }, [user]);

  useEffect(() => {
    if (!user || profile.email) return;
    setProfile({ full_name: user.user_metadata?.full_name || '', email: user.email || '', phone: '' });
  }, [user, profile.email]);

  async function saveFood(item: any) {
    // Library writes are allowed only for authenticated users.
    if (!user?.email) return false;
    const ok = await api.addToLibrary({ ...item, email: user.email });
    if (ok) setLibrary((prev) => [item, ...prev]);
    return ok;
  }

  async function removeFood(food: string, restaurant: string) {
    if (!user?.email) return false;
    const ok = await api.removeFromLibrary(user.email, food, restaurant);
    if (ok) {
      setLibrary((prev) => prev.filter((item) => !(item.food === food && item.restaurant === restaurant)));
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
    setLibrary([]);
    setProfile({ full_name: '', email: '', phone: '' });
  }

  return (
    <AppContext.Provider value={{ user, profile, library, setLibrary, login: loginRedirect, logout, signOut: logout, isLoggedIn: !!user, setProfile, saveProfile, cities, city, setCity, foods, hotelsWidget, saveFood, removeFood }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
