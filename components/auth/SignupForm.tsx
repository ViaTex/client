/**
 * Signup Form Component
 * Professional, clean design with role selection
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth.context';
import { useToast } from '@/lib/toast.context';
import { SignupFormData, Role, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_DASHBOARD_ROUTES } from '@/types/auth.types';

export function SignupForm() {
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState<'role-select' | 'form'>('role-select');
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: Role.STUDENT,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<SignupFormData>>({});

  // ====================================================================
  // AVAILABLE ROLES (ADMIN excluded - no public signup)
  // ====================================================================

  const availableRoles = [Role.STUDENT, Role.CORPORATE, Role.UNIVERSITY, Role.MENTOR];

  // Role icons mapping
  const roleIcons: Record<Role, string> = {
    [Role.STUDENT]: '🎓',
    [Role.CORPORATE]: '💼',
    [Role.UNIVERSITY]: '🏫',
    [Role.MENTOR]: '👨‍🏫',
    [Role.ADMIN]: '👤',
  };

  // ====================================================================
  // FORM VALIDATION
  // ====================================================================

  const validateForm = (): boolean => {
    const errors: Partial<SignupFormData> = {};

    // Validate full name
    if (!formData.fullName) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    } else if (formData.fullName.length > 100) {
      errors.fullName = 'Full name must not exceed 100 characters';
    }

    // Validate email
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }

    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      errors.password = 'Password must contain at least one special character';
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ====================================================================
  // FORM HANDLERS
  // ====================================================================

  const handleRoleSelect = (role: Role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
    setStep('form');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name as keyof SignupFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      clearError();
      const newUser = await signup(formData);

      // Redirect to dashboard based on role
      if (newUser?.role) {
        const dashboardRoute = ROLE_DASHBOARD_ROUTES[newUser.role] || '/dashboard';
        router.push(dashboardRoute);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      // Error is handled by auth context
    }
  };

  // ====================================================================
  // ROLE SELECTION STEP
  // ====================================================================

  if (step === 'role-select') {
    return (
      <div className="space-y-6">
        {/* Header for Role Selection */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Role</h2>
          <p className="text-sm text-gray-600">Select the role that best describes you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableRoles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleSelect(role)}
              className="p-5 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{roleIcons[role]}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">
                    {ROLE_LABELS[role]}
                  </h3>
                  <p className="text-sm text-gray-600">{ROLE_DESCRIPTIONS[role]}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ====================================================================
  // SIGNUP FORM STEP
  // ====================================================================

  return (
    <>
      {/* Header with Big Icon and Role Account Title */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => setStep('role-select')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
          >
            <span>←</span> Back
          </button>
        </div>
        
        <div className="text-center">
          {/* Big Icon */}
          <div className="text-7xl mb-4">{roleIcons[formData.role]}</div>
          
          {/* Role Account Title */}
          <h1 className="text-2xl font-bold text-gray-900">
            {ROLE_LABELS[formData.role]} Account
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 ${
              formErrors.fullName ? 'border-red-500' : 'border-gray-300'
            } disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition`}
            placeholder="Enter your full name"
          />
          {formErrors.fullName && (
            <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Business Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 ${
              formErrors.email ? 'border-red-500' : 'border-gray-300'
            } disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition`}
            placeholder="Enter your email"
          />
          {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-3 py-2.5 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 ${
                formErrors.password ? 'border-red-500' : 'border-gray-300'
              } disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition`}
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 8 characters with uppercase, lowercase, number, and special character
          </p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-3 py-2.5 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 ${
                formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md font-semibold uppercase tracking-wide hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? 'Creating account...' : 'CREATE ACCOUNT'}
        </button>
      </form>
    </>
  );
}
