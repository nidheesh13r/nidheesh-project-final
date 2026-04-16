export interface TasteItem {
  food: string;
  restaurant: string;
  location: string;
  image?: string;
}

export interface LibraryItem {
  food: string;
  restaurant: string;
  location: string;
  image?: string;
  email?: string;
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

export async function searchSignatureFoods(city: string): Promise<TasteItem[]> {
  const res = await fetch(`/taste/search?city=${encodeURIComponent(city)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchHotelsWidget(city: string): Promise<any[]> {
  const res = await fetch(`/widget/hotels?city=${encodeURIComponent(city)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.hotels) ? data.hotels : [];
}

export async function fetchLibrary(email: string): Promise<LibraryItem[]> {
  const res = await fetch(`/taste/library?email=${encodeURIComponent(email)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function addToLibrary(item: LibraryItem): Promise<boolean> {
  const res = await fetch('/taste/library', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return res.ok;
}

export async function removeFromLibrary(email: string, food: string, restaurant: string): Promise<boolean> {
  const res = await fetch('/taste/library', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, food, restaurant }),
  });
  return res.ok;
}
