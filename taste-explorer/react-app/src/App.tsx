import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import Index from '@/pages/Index';
import ProfilePage from '@/pages/ProfilePage';
import LibraryPage from '@/pages/LibraryPage';
import SignIn from '@/pages/SignIn';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
