import React, { useState } from 'react';
import { 
  Share2, Eye, EyeOff, Mail, Lock, ArrowRight, 
  Server, Network, Database, Shield, Activity 
} from 'lucide-react';

interface LoginPageProps {
  onDemoAccess: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onDemoAccess, onLogin }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      setIsSubmitting(true);
      setAuthError('');
      try {
        await onLogin(email.trim(), password);
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-slate-50 login-pattern flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      
      {/* Subtle background infrastructure illustration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-right cluster */}
        <div className="absolute top-[12%] right-[8%] opacity-[0.04]">
          <Server className="w-20 h-20 text-blue-600" />
        </div>
        <div className="absolute top-[8%] right-[18%] opacity-[0.03]">
          <Network className="w-16 h-16 text-blue-500" />
        </div>
        {/* Bottom-left cluster */}
        <div className="absolute bottom-[15%] left-[6%] opacity-[0.04]">
          <Database className="w-18 h-18 text-blue-600" />
        </div>
        <div className="absolute bottom-[10%] left-[16%] opacity-[0.03]">
          <Shield className="w-14 h-14 text-blue-500" />
        </div>
        {/* Center-left */}
        <div className="absolute top-[45%] left-[3%] opacity-[0.025]">
          <Activity className="w-24 h-24 text-blue-400" />
        </div>
        
        {/* Connecting lines — very subtle */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <line x1="15%" y1="50%" x2="85%" y2="15%" stroke="#2563eb" strokeWidth="0.5" opacity="0.04" strokeDasharray="8,8" />
          <line x1="10%" y1="85%" x2="50%" y2="50%" stroke="#2563eb" strokeWidth="0.5" opacity="0.03" strokeDasharray="8,8" />
          <line x1="50%" y1="50%" x2="90%" y2="80%" stroke="#0891b2" strokeWidth="0.5" opacity="0.03" strokeDasharray="8,8" />
        </svg>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/20 mb-5">
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-[1.65rem] font-bold text-slate-800 tracking-tight leading-tight">
            Autonomous Infrastructure
            <br />
            <span className="text-blue-600">Digital Twin</span>
          </h1>
          <p className="mt-2.5 text-sm text-slate-500 font-medium tracking-wide">
            Monitor · Predict · Simulate · Stay Resilient
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-7 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Sign In</h2>
          <p className="text-sm text-slate-500 mb-6">Access the infrastructure monitoring dashboard</p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="mb-4">
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4.5 h-4.5 text-slate-400" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onBlur={() => { if (email) validateEmail(email); }}
                  placeholder="you@enterprise.com"
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50/80 focus:bg-white outline-none transition-all ${
                    emailError 
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                      : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
              </div>
              {emailError && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4.5 h-4.5 text-slate-400" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  onBlur={() => { if (password) validatePassword(password); }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full pl-11 pr-12 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50/80 focus:bg-white outline-none transition-all ${
                    passwordError 
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                      : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{passwordError}</p>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {authError && (
              <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {authError}
              </p>
            )}
            <p className="mt-4 text-xs text-slate-400 text-center leading-relaxed">
              Sign in with your registered account.
              <br />
              Use Demo Access to explore simulated telemetry.
            </p>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Demo Access Button */}
          <button
            onClick={onDemoAccess}
            id="demo-access-btn"
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200/70 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
          >
            <Activity className="w-4 h-4" />
            <span>Demo Access</span>
            <span className="text-[10px] font-medium text-blue-500 bg-blue-100 border border-blue-200 rounded px-1.5 py-0.5 ml-1 uppercase tracking-wide">
              No Login Required
            </span>
          </button>

          <p className="mt-3 text-[11px] text-slate-400 text-center">
            Demo Access opens the dashboard with simulated telemetry data.
            <br />
            This is not authenticated access and is for demonstration only.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Autonomous Infrastructure Digital Twin &mdash; Predictive Simulation &amp; Resilience Platform
        </p>
      </div>
    </div>
  );
};
