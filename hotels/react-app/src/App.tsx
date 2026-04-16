import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import Index from '@/pages/Index';
import SignIn from '@/pages/SignIn';
import Profile from '@/pages/Profile';
import BookingPage from '@/pages/BookingPage';
import MyBookings from '@/pages/MyBookings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
