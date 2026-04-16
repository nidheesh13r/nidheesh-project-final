import { useEffect } from 'react';
import { loginRedirect } from '@/auth';

export default function SignIn() {
  useEffect(() => { loginRedirect(); }, []);
  return <p>Redirecting to centralized login…</p>;
}
