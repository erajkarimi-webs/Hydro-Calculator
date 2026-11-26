import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, Mail, Lock, User, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { user, login, register, logout, quickProLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'login') {
      const res = login(email, password);
      if (res.success) {
        setSuccessMsg('Signed in successfully with Pro privileges!');
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message || 'Login failed. Please check your credentials.');
      }
    } else {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name or title.');
        return;
      }
      const res = register(name, email, password);
      if (res.success) {
        setSuccessMsg('Account created! Pro privileges unlocked.');
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    }
  };

  const handleProMasterLogin = () => {
    quickProLogin();
    setSuccessMsg('Signed in as Eng. Eraj Karimi (Pro Lifetime Access)!');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          /* Profile Card if already logged in */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center mx-auto text-teal-600 dark:text-teal-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AquaCalc Pro Lifetime Access</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {user.name}
              </h3>
              <p className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">
                {user.email}
              </p>
              {user.role && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {user.role} {user.organization ? `· ${user.organization}` : ''}
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-left text-xs space-y-2 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Advanced Engineering Kinetic &amp; Sensitivity Inputs Unlocked</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Unrestricted PDF, Word (.doc) and PNG Report Exports</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Process Diagrams with Dynamic Equipment Sizing</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={logout}
                className="w-1/2 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Sign Out
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Continue Calculating
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="p-8">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-2">
                <span>AquaCalc Member Portal</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {mode === 'login' ? 'Sign in to AquaCalc' : 'Create Engineering Account'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'login'
                  ? 'Access your saved calculations, detailed options, and Pro reports.'
                  : 'Register free to unlock advanced engineering parameters and multi-format reports.'}
              </p>
            </div>

            {/* Quick Demo Pro Account Button */}
            <div className="mb-5 p-3.5 bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-sky-500/10 rounded-xl border border-amber-300/40 dark:border-amber-700/40">
              <div className="flex items-center justify-between gap-3">
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Eng. Eraj Karimi Pro Account</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    erajkarimi@gmail.com · Full Pro Access
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleProMasterLogin}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  Quick Sign In
                </button>
              </div>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">Or enter credentials</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 mb-4 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs text-teal-700 dark:text-teal-300">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name &amp; Title
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Eng. Sarah Miller, P.E."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@agency.gov or university.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer mt-2"
              >
                {mode === 'login' ? 'Sign In & Unlock Pro Features' : 'Create Account & Start Calculating'}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
              {mode === 'login' ? (
                <>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                    }}
                    className="font-semibold text-teal-600 hover:underline cursor-pointer"
                  >
                    Register free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                    }}
                    className="font-semibold text-teal-600 hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
