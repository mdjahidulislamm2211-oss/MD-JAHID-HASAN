import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowLeft, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { GadzonicLogo } from '../GadzonicLogo.js';

interface AdminLoginProps {
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToStore }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityCode, setShowSecurityCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !securityCode.trim()) {
      setError('Please provide administrator email, password, and secret security code.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await login(email.trim(), password, securityCode.trim());
    } catch (err: any) {
      setError(err.message || 'Access denied: Invalid credentials or secret security code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 overflow-hidden text-white">
        
        {/* Brand Banner */}
        <div className="bg-neutral-950 p-6 sm:p-8 text-center relative border-b border-neutral-800/80">
          <button
            onClick={onBackToStore}
            className="absolute top-4 left-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors inline-flex items-center gap-1 text-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          <div className="flex justify-center mb-3">
            <GadzonicLogo size="lg" imageSrc="/src/assets/images/gadzonic_logo_1792334338384.jpg" className="[&_span]:text-white" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-[11px] font-mono text-cyan-400">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>RESTRICTED ACCESS PORTAL</span>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            Multi-factor verification required for console authentication
          </p>
        </div>

        {/* Form Body - Completely zero credentials revealed */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-950/70 border border-rose-800 text-xs text-rose-300 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Admin Email */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@gadzonic.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white placeholder-neutral-500"
                />
              </div>
            </div>

            {/* Field 2: Admin Password */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-neutral-950 border border-neutral-700 rounded-lg focus:outline-none focus:border-cyan-400 text-white placeholder-neutral-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field 3: Secret Master Security Code (Confidential) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Secret Security Code (গোপন কোড) *</span>
                </label>
              </div>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showSecurityCode ? 'text' : 'password'}
                  required
                  value={securityCode}
                  onChange={e => setSecurityCode(e.target.value)}
                  placeholder="Enter Secret Security Code..."
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-neutral-950 border border-cyan-800/80 rounded-lg focus:outline-none focus:border-cyan-400 text-white placeholder-neutral-600 font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowSecurityCode(!showSecurityCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                >
                  {showSecurityCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                Confidential security PIN required for administrative authorization.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-bold text-neutral-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 disabled:opacity-50 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950"
              >
                <ShieldCheck className="w-4 h-4 text-neutral-950" />
                <span>{loading ? 'Authenticating...' : 'Verify & Enter Console'}</span>
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-800 text-center">
            <button
              onClick={onBackToStore}
              className="text-xs text-neutral-400 hover:text-white font-medium cursor-pointer transition-colors"
            >
              Return to Public Marketplace
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
