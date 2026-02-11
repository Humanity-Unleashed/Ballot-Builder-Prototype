'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAnalyticsContext } from '@/components/analytics/AnalyticsProvider';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { track } = useAnalyticsContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState('');

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setIsLoading(true);
    track('click', { element: 'sign_in' });
    try {
      await login(email, password);
      router.replace('/blueprint');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Please check your credentials and try again.';
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-base leading-6 text-gray-500">
          Sign in to continue building your civic blueprint
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1">
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          type="email"
          autoComplete="email"
          name="email"
          error={errors.email}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
          type="password"
          autoComplete="current-password"
          name="password"
          error={errors.password}
        />

        {submitError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        <div className="mt-6">
          <Button
            title={isLoading ? 'Signing In...' : 'Sign In'}
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          />
        </div>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-center py-4">
        <span className="text-sm text-gray-500">Don&apos;t have an account?&nbsp;</span>
        <Link
          href="/register"
          className="text-sm font-semibold text-blue-500 hover:text-blue-600"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
