'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth.context';
import { useToast } from '@/lib/toast.context';
import { SignupFormData, Role, ROLE_LABELS, ROLE_DASHBOARD_ROUTES } from '@/types/auth.types';
import { Mail, Lock, User, ArrowRight, Building, GraduationCap, Briefcase, Globe, Phone, Linkedin } from 'lucide-react';

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, isLoading, clearError } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: Role.STUDENT,
  });

  const [formErrors, setFormErrors] = useState<Partial<SignupFormData>>({});

  const availableRoles = [
    { id: Role.STUDENT, label: 'Student', icon: GraduationCap },
    { id: Role.CORPORATE, label: 'Corporate', icon: Building },
    { id: Role.UNIVERSITY, label: 'University', icon: Building },
    { id: Role.MENTOR, label: 'Mentor', icon: Briefcase },
  ];

  // Initialize or update role from URL parameter
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const roleParam = searchParams.get('role');
    const paramValue = typeParam || roleParam;

    if (paramValue) {
      // Find matching role case-insensitively
      const matchingRole = Object.values(Role).find(
        (r) => r.toLowerCase() === paramValue.toLowerCase()
      );

      if (matchingRole) {
        setFormData((prev) => ({ ...prev, role: matchingRole }));
      }
    }
  }, [searchParams]);

  // Handle manual role toggle inside the UI and reflect it back to URL
  const handleRoleChange = (selectedRole: Role) => {
    setFormData({ ...formData, role: selectedRole });
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', selectedRole.toLowerCase());
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const validateForm = (): boolean => {
    const errors: Partial<SignupFormData> = {};

    if (!formData.fullName) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role === Role.STUDENT && formData.phone) {
      if (!/^\d{10,12}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = 'Valid phone number is required';
      }
    }

    if (formData.role === Role.MENTOR) {
      if (!formData.designation) {
        errors.designation = 'Designation is required';
      }
      if (!formData.linkedInUrl) {
        errors.linkedInUrl = 'LinkedIn URL is required';
      } else if (!formData.linkedInUrl.includes('linkedin.com')) {
        errors.linkedInUrl = 'Must be a valid LinkedIn URL';
      }
    }

    if ((formData.role === Role.CORPORATE || formData.role === Role.UNIVERSITY) && formData.websiteUrl) {
      if (!formData.websiteUrl.startsWith('http')) {
        errors.websiteUrl = 'Website URL must start with http:// or https://';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      toast.success('Registration successful!');

      if (newUser?.role) {
        const dashboardRoute = ROLE_DASHBOARD_ROUTES[newUser.role] || '/dashboard';
        router.push(dashboardRoute);
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 pt-24 md:pt-32 relative z-10 w-full min-h-screen bg-gray-50">
      <div
        className="w-full max-w-[519px] bg-white rounded-lg border border-[#AEAEAE] p-[24px]"
        style={{
          boxShadow: '2px -2px 4px 0px rgba(0, 0, 0, 0.25), -2px 2px 4px 0px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="text-center mb-6 space-y-2">
          <h1 className="text-[32px] font-semibold text-black leading-[24px] mb-2 font-['Poppins']">
            Create an Account
          </h1>
          <p className="text-sm text-gray-600">
            Join us to start your professional journey
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto space-x-1">
          {availableRoles.map((roleOpt) => {
            const Icon = roleOpt.icon;
            const isSelected = formData.role === roleOpt.id;
            return (
              <button
                key={roleOpt.id}
                type="button"
                onClick={() => handleRoleChange(roleOpt.id as Role)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${isSelected
                  ? 'bg-white text-[#00BAE8] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                  }`}
              >
                <Icon className="w-4 h-4 hidden sm:block" />
                <span>{roleOpt.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
          {/* Dynamic "Name" Field based on Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black flex items-center gap-2">
              {formData.role === Role.CORPORATE || formData.role === Role.UNIVERSITY ? (
                <Building className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
              {formData.role === Role.CORPORATE ? 'Company Name'
                : formData.role === Role.UNIVERSITY ? 'University / College Name'
                  : 'Full Name'}
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isLoading}
              placeholder={
                formData.role === Role.CORPORATE ? 'Acme Corp'
                  : formData.role === Role.UNIVERSITY ? 'Stanford University'
                    : 'John Doe'
              }
              className={`w-full h-[50px] px-4 bg-white text-gray-700 border ${formErrors.fullName ? 'border-red-500' : 'border-[#AEAEAE]'} rounded-[8px] focus:ring-1 focus:ring-primary-500 focus:outline-none`}
            />
            {formErrors.fullName && <p className="text-xs text-red-500">{formErrors.fullName}</p>}
          </div>

          {/* Dynamic "Email" Field based on Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {formData.role === Role.STUDENT ? 'Email'
                : formData.role === Role.UNIVERSITY ? 'Official Email'
                  : 'Business Email'}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="your@email.com"
              className={`w-full h-[50px] px-4 bg-white text-gray-700 border ${formErrors.email ? 'border-red-500' : 'border-[#AEAEAE]'} rounded-[8px] focus:ring-1 focus:ring-primary-500 focus:outline-none`}
            />
            {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
          </div>

          {/* Role-Specific Secondary Fields */}
          {formData.role === Role.STUDENT && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-black flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="+91 9876543210"
                className={`w-full h-[50px] px-4 bg-white text-gray-700 border ${formErrors.phone ? 'border-red-500' : 'border-[#AEAEAE]'} rounded-[8px] focus:ring-1 focus:ring-primary-500 focus:outline-none`}
              />
              {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
            </div>
          )}

          {(formData.role === Role.CORPORATE || formData.role === Role.UNIVERSITY) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-black flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website URL (Optional)
              </label>
              <input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                value={formData.websiteUrl || ''}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="https://example.com"
                className={`w-full h-[50px] px-4 bg-white text-gray-700 border ${formErrors.websiteUrl ? 'border-red-500' : 'border-[#AEAEAE]'} rounded-[8px] focus:ring-1 focus:ring-primary-500 focus:outline-none`}
              />
              {formErrors.websiteUrl && <p className="text-xs text-red-500">{formErrors.websiteUrl}</p>}
            </div>
          )}

          {formData.role === Role.MENTOR && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-black flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Designation / Job Title
                </label>
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  value={formData.designation || ''}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Senior Software Engineer"
                  className={`w-full h-[50px] px-4 bg-white border ${formErrors.designation ? 'border-red-500' : 'border-[#AEAEAE]'} rounded-[8px] focus:ring-1 focus:ring-primary-500 focus:outline-none`}
                />
                {formErrors.designation && <p className="text-xs text-red-500">{formErrors.designation}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-black flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn Profile URL
                </label>
                <input
                  id="linkedInUrl"
                  name="linkedInUrl"
                  type="url"
                  value={formData.linkedInUrl || ''}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="https://linkedin.com/in/username"
                  className={`w-full h-[50px] px-4 bg-white border ${formErrors.linkedInUrl ? 'border-red-500' : 'border-[#AEAEAE]'} rounded-[8px] focus:ring-1 focus:ring-primary-500 focus:outline-none`}
                />
                {formErrors.linkedInUrl && <p className="text-xs text-red-500">{formErrors.linkedInUrl}</p>}
              </div>
            </>
          )}

          {/* Password Fields Wrapper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Password"
                className={`w-full h-[50px] px-4 bg-white border ${formErrors.password ? 'border-red-500' : 'border-[#AEAEAE]'} rounded-[8px] focus:ring-1 focus:ring-primary-500 focus:outline-none`}
              />
              {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-black flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Confirm password"
                className={`w-full h-[50px] px-4 bg-white border ${formErrors.confirmPassword ? 'border-red-500' : 'border-[#AEAEAE]'} rounded-[8px] focus:ring-1 focus:ring-primary-500 focus:outline-none`}
              />
              {formErrors.confirmPassword && <p className="text-xs text-red-500">{formErrors.confirmPassword}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 h-[50px] text-base font-medium bg-[#00BAE8] hover:bg-[#009bc2] text-white rounded-[8px] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
            {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>

          <div className="text-center">
            <p className="text-sm text-black font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
