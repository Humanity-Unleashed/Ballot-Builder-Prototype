'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [submitError, setSubmitError] = useState('');

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(email, password);
      router.replace('/blueprint');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Please try again.';
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-base leading-6 text-gray-500">
          Join Ballot Builder and start making informed voting decisions
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
          placeholder="Create a password"
          value={password}
          onChange={setPassword}
          type="password"
          autoComplete="new-password"
          name="password"
          error={errors.password}
          hint="At least 8 characters"
        />

        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          type="password"
          autoComplete="new-password"
          name="confirmPassword"
          error={errors.confirmPassword}
        />

        {submitError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        <div className="mt-6">
          <Button
            title={isLoading ? 'Creating Account...' : 'Create Account'}
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          />
        </div>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-center py-4">
        <span className="text-sm text-gray-500">Already have an account?&nbsp;</span>
        <Link
          href="/login"
          className="text-sm font-semibold text-blue-500 hover:text-blue-600"
        >
          Sign In
        </Link>
      </div>

      {/* Terms */}
      <p className="text-center text-xs leading-[18px] text-gray-400">
        By creating an account, you agree to our Terms of Service and Privacy
        Policy.
      </p>
    </div>
  );
}
