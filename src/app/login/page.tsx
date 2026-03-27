"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'Login failed');
        return;
      }

      router.push('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">OpenGrimoire admin</h1>
      <p className="text-sm text-gray-600">
        Sign in with the operator password configured on the server (
        <code className="text-xs">OPENGRIMOIRE_ADMIN_PASSWORD</code> or{' '}
        <code className="text-xs">OPENGRIMOIRE_ADMIN_PASSWORD_HASH</code>).
      </p>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="password"
          placeholder="Operator password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  );
}
