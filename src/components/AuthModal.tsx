import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, Lock, User, ArrowRight, CheckCircle2, AlertCircle, KeyRound, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/useTranslation.tsx';
import { CaptchaBox } from './CaptchaBox.tsx';

interface AuthModalProps {
  onOpenForgotPassword?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states (Username + Password only)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // CAPTCHA
  const [captchaId, setCaptchaId] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaResetKey, setCaptchaResetKey] = useState(0);

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setCaptchaAnswer('');
    setCaptchaResetKey(k => k + 1);
  };

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    resetForm();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please enter both your username and password.');
      return;
    }

    if (!captchaAnswer.trim()) {
      setError(t.invalidCaptcha);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          captchaId,
          captchaAnswer: captchaAnswer.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        setCaptchaResetKey(k => k + 1);
        setIsLoading(false);
        return;
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError('Network or server connection failed.');
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please enter a username and password.');
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    if (!captchaAnswer.trim()) {
      setError(t.invalidCaptcha);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          captchaId,
          captchaAnswer: captchaAnswer.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setCaptchaResetKey(k => k + 1);
        setIsLoading(false);
        return;
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError('Network or server connection failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-700 mb-3 shadow-inner">
            <Server className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">{t.brandName}</h1>
          <p className="text-xs text-neutral-400 mt-1">Minecraft VDS Management Platform</p>
        </div>

        {/* Operator info pill */}
        <div className="mb-5 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-2.5 text-xs text-emerald-300/90">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-[11px] leading-snug">
            Operator access: Pre-registered superadmin <strong className="text-white font-mono">PCBC</strong> has full VDS binding & cluster operator rights.
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-neutral-950 border border-neutral-800 rounded-lg mb-6">
          <button
            type="button"
            id="tab-btn-login"
            onClick={() => handleTabChange('login')}
            className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.tabLogin}
          </button>
          <button
            type="button"
            id="tab-btn-register"
            onClick={() => handleTabChange('register')}
            className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {t.tabRegister}
          </button>
        </div>

        {/* Error / Success Notifications */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-950/40 border border-red-800/80 rounded-lg flex items-center gap-2.5 text-xs text-red-300"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg flex items-center gap-2.5 text-xs text-emerald-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forms (Username & Password Only) */}
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">{t.username}</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="login-username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="PCBC or your username"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">{t.password}</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-600 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Real CAPTCHA Challenge */}
            <CaptchaBox
              key={`login-captcha-${captchaResetKey}`}
              onCaptchaChange={(id, sol) => {
                setCaptchaId(id);
                setCaptchaAnswer(sol);
              }}
            />

            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? t.loggingIn : (
                <>
                  <span>{t.tabLogin}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">{t.username}</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="register-username-input"
                  type="text"
                  required
                  minLength={3}
                  maxLength={30}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">{t.password}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    id="register-password-input"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-600 outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">{t.confirmPassword}</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    id="register-confirm-password-input"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-600 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Real CAPTCHA Challenge */}
            <CaptchaBox
              key={`register-captcha-${captchaResetKey}`}
              onCaptchaChange={(id, sol) => {
                setCaptchaId(id);
                setCaptchaAnswer(sol);
              }}
            />

            <button
              id="register-submit-button"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? t.registering : (
                <>
                  <span>{t.tabRegister}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
