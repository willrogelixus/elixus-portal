
import React, { useState, useEffect } from 'react';
import { AppState, FormData, INITIAL_FORM_DATA } from './types';
import CircuitBackground from './components/CircuitBackground';
import Logo from './components/Logo';
import {
  ChevronRight,
  CheckCircle,
  Lock,
  Mail,
  User,
  ShieldCheck,
  FileText,
  Globe,
  Building2,
  UserCheck,
  Briefcase,
  FileCode,
  ArrowLeft,
  Circle,
  Check,
  Activity,
  Clock,
  ShieldAlert,
  Terminal,
  Target,
  MessageSquare,
  Calendar,
  TrendingUp,
  RefreshCw,
  Bell,
  Cpu,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { signIn, signUp, signOut, getSession, getPortalUserData, logActivity, onAuthStateChange, resetPassword, updatePassword, ensurePortalClient } from './lib/auth';
import type { PortalUserData } from './lib/auth';
import { supabase } from './lib/supabase';
import type { PortalA2PSubmissionInsert } from './lib/database.types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", 
  "Antigua and Barbuda", "Argentina", "Armenia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", 
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", 
  "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Cape Verde", "Central African Republic", "Chad", "Chile", 
  "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", 
  "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", 
  "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", 
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", 
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", 
  "Kenya", "Kiribati", "North Korea", "South Korea", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", 
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", 
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", 
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", 
  "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", 
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", 
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", 
  "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", 
  "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", 
  "United Arab Emirates", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// --- Sub-components for Dashboard ---

const StatsCard: React.FC<{ icon: React.ReactNode, value: string, label: string, trend: string }> = ({ icon, value, label, trend }) => (
  <div className="glass-panel p-6 rounded-2xl border-white/5 hover:border-[#1597aa]/30 transition-all duration-300 group flex flex-col justify-between h-full">
    <div className="flex justify-between items-start mb-8">
      <div className="p-3 bg-[#1597aa]/10 rounded-xl text-[#1597aa] group-hover:shadow-[0_0_15px_rgba(21,151,170,0.3)] transition-all">
        {icon}
      </div>
      <div className="bg-[#1597aa]/5 px-2 py-1 rounded border border-[#1597aa]/10">
        <span className="text-[9px] font-futuristic text-[#1597aa] uppercase tracking-widest whitespace-nowrap">{trend}</span>
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-4xl font-futuristic text-white glow-text">{value}</h3>
      <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium leading-relaxed">{label}</p>
    </div>
  </div>
);

const Timeline: React.FC<{ currentPhase: number; goLiveDate?: string | null }> = ({ currentPhase, goLiveDate }) => {
  const stepLabels = ["Account Setup", "A2P Registration", "System Integration", "Testing & QA", "Go Live"];
  const steps = stepLabels.map((label, idx) => {
    const phase = idx + 1;
    return {
      label,
      status: phase < currentPhase ? "complete" : phase === currentPhase ? "in-progress" : "pending",
    };
  });
  const progressWidth = currentPhase <= 1 ? '12.5%' : `${((currentPhase - 1) / (steps.length - 1)) * 100}%`;
  const formattedGoLive = goLiveDate ? new Date(goLiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';

  return (
    <div className="glass-panel p-8 rounded-2xl border-white/10 mb-8 overflow-hidden">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-sm font-futuristic text-white uppercase tracking-widest flex items-center gap-2">
          <Globe size={16} className="text-[#1597aa]" />
          Implementation Journey
        </h3>
        <span className="text-[10px] font-futuristic text-white/40 uppercase tracking-widest hidden sm:inline">Est. Go-Live: {formattedGoLive}</span>
      </div>

      <div className="relative flex justify-between items-center w-full px-2">
        {/* Connecting Lines */}
        <div className="absolute top-[20px] left-0 w-full h-[2px] bg-white/5 z-0" />
        <div
          className="absolute top-[20px] left-0 h-[2px] bg-[#1597aa] z-0 transition-all duration-1000"
          style={{ width: progressWidth }}
        />
        
        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center gap-6 w-1/5 min-w-0">
            <div className="relative flex-shrink-0">
              {step.status === 'in-progress' && (
                <div className="absolute inset-[-3px] rounded-full border-2 border-[#1597aa]/60 animate-pulse" />
              )}
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                step.status === 'complete' ? 'bg-[#1597aa] border-[#1597aa] text-white shadow-[0_0_15px_#1597aa]' :
                step.status === 'in-progress' ? 'bg-[#0a0f1a] border-[#1597aa] text-[#1597aa] shadow-[0_0_20px_rgba(21,151,170,0.4)]' :
                'bg-[#0d1117] border-white/10 text-white/20'
              }`}>
                {step.status === 'complete' ? <Check size={18} /> : <span className="text-[10px] font-futuristic">{idx + 1}</span>}
              </div>
            </div>
            <div className="h-10 flex items-start justify-center">
              <span className={`text-[8px] sm:text-[9px] font-futuristic uppercase text-center leading-[1.4] tracking-[0.05em] max-w-[70px] sm:max-w-[100px] break-words ${
                step.status === 'complete' ? 'text-white' : 
                step.status === 'in-progress' ? 'text-[#1597aa]' : 
                'text-white/20'
              }`}>
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Page Components ---

const HUDFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative w-full h-full p-4 md:p-8">
    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#1597aa]/40 rounded-tl-sm pointer-events-none" />
    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#1597aa]/40 rounded-tr-sm pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#1597aa]/40 rounded-bl-sm pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#1597aa]/40 rounded-br-sm pointer-events-none" />
    <div className="absolute top-2 left-10 text-[8px] font-futuristic text-[#1597aa]/30 tracking-[0.4em] pointer-events-none">SECURE_LINK_ACTIVE // PORT: 8080</div>
    <div className="absolute bottom-2 right-10 text-[8px] font-futuristic text-[#1597aa]/30 tracking-[0.4em] pointer-events-none">ELX_SYSTEM_KERNEL_4.2.0</div>
    {children}
  </div>
);

const IntroVideo: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);
  const handleFinish = () => {
    if (fading) return;
    setFading(true);
    setTimeout(onComplete, 1000);
  };
  return (
    <div className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute top-10 flex flex-col items-center z-10 animate-pulse">
        <Logo iconOnly className="scale-125 mb-4" />
        <span className="font-futuristic text-xs tracking-[0.5em] text-[#1597aa]">ESTABLISHING SECURE CONNECTION...</span>
      </div>
      <video autoPlay muted playsInline onEnded={handleFinish} className="w-full h-full object-cover opacity-60">
        <source src="/elixus-hud.mp4" type="video/mp4" />
      </video>
      <button onClick={handleFinish} className="absolute bottom-10 right-10 text-[#1597aa] font-futuristic tracking-widest text-sm hover:text-white transition-colors duration-300 flex items-center gap-2 group z-10 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-[#1597aa]/20">
        SKIP INITIALIZATION <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

const AuthPage: React.FC<{ onAuth: (user: SupabaseUser) => void }> = ({ onAuth }) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'signupSuccess' | 'resetSent'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchView = (v: 'login' | 'signup' | 'forgot') => { setError(null); setView(v); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (view === 'login') {
        const result = await signIn({ email, password });
        if (result.error) {
          setError(result.error.message);
        } else if (result.user) {
          onAuth(result.user);
        }
      } else if (view === 'signup') {
        const result = await signUp({ email, password });
        if (result.error) {
          setError(result.error.message);
        } else {
          setView('signupSuccess');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await resetPassword(email);
      if (resetError) {
        setError(resetError.message);
      } else {
        setView('resetSent');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl glow-border relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[#1597aa] to-transparent opacity-50" />
        <div className="flex flex-col items-center mb-10">
          <Logo className="mb-6" />
          <h2 className="text-xl font-futuristic text-white/90 text-center tracking-tight">Welcome to the <span className="text-[#1597aa]">Elixus Portal</span></h2>
          <p className="text-white/40 text-sm mt-2">
            {view === 'forgot' ? 'Reset your password' : view === 'resetSent' ? 'Check your inbox' : 'Access your secure command center'}
          </p>
        </div>

        {/* Sign-up success */}
        {view === 'signupSuccess' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center"><CheckCircle size={48} className="text-[#1597aa]" /></div>
            <h3 className="text-lg font-futuristic text-white">Check Your Email</h3>
            <p className="text-white/50 text-sm">We've sent a confirmation link to <span className="text-[#1597aa]">{email}</span>. Please verify your email to sign in.</p>
            <button onClick={() => switchView('login')} className="text-[#1597aa] hover:text-white text-sm transition-colors font-futuristic">BACK TO SIGN IN</button>
          </div>
        )}

        {/* Password reset email sent */}
        {view === 'resetSent' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center"><Mail size={48} className="text-[#1597aa]" /></div>
            <h3 className="text-lg font-futuristic text-white">Reset Link Sent</h3>
            <p className="text-white/50 text-sm">We've sent a password reset link to <span className="text-[#1597aa]">{email}</span>. Check your email and follow the instructions.</p>
            <button onClick={() => switchView('login')} className="text-[#1597aa] hover:text-white text-sm transition-colors font-futuristic">BACK TO SIGN IN</button>
          </div>
        )}

        {/* Forgot password form */}
        {view === 'forgot' && (
          <>
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Email Address</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/20 focus:border-[#1597aa] focus:ring-1 focus:ring-[#1597aa]/50 transition-all outline-none" placeholder="e.g. name@company.com" /></div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#1597aa] hover:bg-[#127e8d] text-white font-futuristic font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(21,151,170,0.3)] hover:shadow-[0_0_25px_rgba(21,151,170,0.5)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>SEND RESET LINK<ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
            <div className="mt-8 text-center"><button onClick={() => switchView('login')} className="text-white/40 hover:text-[#1597aa] text-sm transition-colors">BACK TO SIGN IN</button></div>
          </>
        )}

        {/* Login / Signup form */}
        {(view === 'login' || view === 'signup') && (
          <>
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Email Address</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/20 focus:border-[#1597aa] focus:ring-1 focus:ring-[#1597aa]/50 transition-all outline-none" placeholder="e.g. name@company.com" /></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Password</label>
                  {view === 'login' && <button type="button" onClick={() => switchView('forgot')} className="text-[10px] font-futuristic text-white/30 hover:text-[#1597aa] transition-colors uppercase tracking-wider">Forgot Password?</button>}
                </div>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/20 focus:border-[#1597aa] focus:ring-1 focus:ring-[#1597aa]/50 transition-all outline-none" placeholder="••••••••" /></div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#1597aa] hover:bg-[#127e8d] text-white font-futuristic font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(21,151,170,0.3)] hover:shadow-[0_0_25px_rgba(21,151,170,0.5)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>{view === 'login' ? 'INITIALIZE SYSTEM' : 'CREATE PROTOCOL'}<ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
            <div className="mt-8 text-center"><button onClick={() => switchView(view === 'login' ? 'signup' : 'login')} className="text-white/40 hover:text-[#1597aa] text-sm transition-colors">{view === 'login' ? "DON'T HAVE AN ACCOUNT? SIGN UP" : "ALREADY HAVE AN ACCOUNT? SIGN IN"}</button></div>
          </>
        )}
      </div>
    </div>
  );
};

const ResetPasswordPage: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await updatePassword(newPassword);
      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        await signOut();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl glow-border relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[#1597aa] to-transparent opacity-50" />
        <div className="flex flex-col items-center mb-10">
          <Logo className="mb-6" />
          <h2 className="text-xl font-futuristic text-white/90 text-center tracking-tight">{success ? 'Password Updated' : 'Set New Password'}</h2>
          <p className="text-white/40 text-sm mt-2">{success ? 'You can now sign in with your new password' : 'Enter and confirm your new password'}</p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center"><CheckCircle size={48} className="text-[#1597aa]" /></div>
            <p className="text-white/50 text-sm">Your password has been updated successfully.</p>
            <button onClick={onComplete} className="w-full bg-[#1597aa] hover:bg-[#127e8d] text-white font-futuristic font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(21,151,170,0.3)] hover:shadow-[0_0_25px_rgba(21,151,170,0.5)] transition-all flex items-center justify-center gap-2 group">
              BACK TO SIGN IN <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">New Password</label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} /><input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/20 focus:border-[#1597aa] focus:ring-1 focus:ring-[#1597aa]/50 transition-all outline-none" placeholder="••••••••" /></div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Confirm New Password</label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} /><input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-white/20 focus:border-[#1597aa] focus:ring-1 focus:ring-[#1597aa]/50 transition-all outline-none" placeholder="••••••••" /></div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#1597aa] hover:bg-[#127e8d] text-white font-futuristic font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(21,151,170,0.3)] hover:shadow-[0_0_25px_rgba(21,151,170,0.5)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>UPDATE PASSWORD<ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const DashboardPage: React.FC<{ isA2pComplete: boolean; onStartA2p: () => void; userData: PortalUserData | null; onSignOut: () => void }> = ({ isA2pComplete, onStartA2p, userData, onSignOut }) => {
  const currentPhase = userData?.systemStatus?.current_phase ?? 1;
  const progressPercentage = Math.round((currentPhase / 5) * 100);
  const goLiveDate = userData?.systemStatus?.estimated_go_live;

  return (
    <HUDFrame>
      <div className="max-w-6xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-2 duration-1000">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#1597aa] animate-pulse" />
              <span className="text-[10px] font-futuristic tracking-[0.4em] text-[#1597aa] uppercase">Operational Control</span>
              <span className="text-[10px] text-white/20 font-futuristic">•</span>
              <span className="text-[10px] font-futuristic tracking-[0.4em] text-white/40 uppercase">Agency Status: Active</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-futuristic text-white glow-text tracking-tighter uppercase">
              Command <span className="text-[#1597aa]">Terminal</span>
            </h1>
          </div>

          <div className="flex flex-col items-end gap-3 min-w-[300px]">
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center text-[10px] font-futuristic text-[#1597aa] tracking-widest uppercase">
                <span>Overall Progress</span>
                <span className="ml-4">{progressPercentage}% Synchronized</span>
              </div>
              <button onClick={onSignOut} className="flex items-center gap-1.5 text-white/30 hover:text-red-400 transition-colors text-[10px] font-futuristic tracking-widest uppercase">
                <LogOut size={12} /> Sign Out
              </button>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
              <div
                className="h-full bg-[#1597aa] rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_#1597aa] animate-pulse"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Performance Overview Row */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[10px] font-futuristic text-[#1597aa] uppercase tracking-[0.3em] flex items-center gap-2">
              <Terminal size={12} /> Performance Overview
            </h2>
            <RefreshCw size={12} className="text-white/20 cursor-pointer hover:text-[#1597aa] transition-colors" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard icon={<Target size={28} />} value="47" label="Leads Captured" trend="+12% this month" />
            <StatsCard icon={<MessageSquare size={28} />} value="23" label="Active Chats" trend="Currently open" />
            <StatsCard icon={<Calendar size={28} />} value="18" label="Booked Calls" trend="8 pending" />
            <StatsCard icon={<TrendingUp size={28} />} value="$24.5k" label="Pipeline Value" trend="+5.2k growth" />
          </div>
        </div>

        <Timeline currentPhase={currentPhase} goLiveDate={goLiveDate} />

        {/* Pending Initializations */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <ShieldAlert size={16} className="text-[#1597aa]" />
            <h2 className="text-xs font-futuristic text-[#1597aa] uppercase tracking-[0.3em]">Pending Initializations</h2>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-[#1597aa]/30 to-transparent" />
          </div>

          <div
            onClick={onStartA2p}
            className={`group relative glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-500 cursor-pointer overflow-hidden border-white/5 hover:border-[#1597aa]/30 hover:bg-[#1597aa]/5 ${!isA2pComplete ? 'shadow-[0_0_40px_rgba(21,151,170,0.08)] border-[#1597aa]/20' : 'opacity-80'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#1597aa]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex gap-8 relative z-10">
              <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500 ${isA2pComplete ? 'bg-[#1597aa]/20 text-[#1597aa]' : 'bg-[#1597aa]/10 border border-[#1597aa]/30 text-[#1597aa]'}`}>
                {isA2pComplete ? <Check size={28} /> : <ShieldCheck size={28} />}
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-futuristic text-white group-hover:text-[#1597aa] transition-colors">A2P REGISTRATION</h3>
                <p className="text-white/40 text-sm max-w-lg leading-relaxed">Complete compliance protocol for carrier integration.</p>
              </div>
            </div>
            <button className={`relative z-10 font-futuristic px-10 py-4 rounded-xl text-xs tracking-widest transition-all duration-300 border ${isA2pComplete ? 'bg-white/5 border-white/10 text-white/30' : 'bg-[#1597aa] border-transparent text-white shadow-[0_0_20px_rgba(21,151,170,0.2)] group-hover:scale-105'}`}>
              {isA2pComplete ? 'VIEW MODULE' : 'START INTEGRATION'}
            </button>
          </div>
        </div>

        {/* Main Grid: Feed + Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

          {/* Left Column: Activity Feed (Wider) */}
          <div className="lg:col-span-2 glass-panel rounded-2xl border-white/5 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xs font-futuristic text-white uppercase tracking-widest flex items-center gap-2">
                <Bell size={14} className="text-[#1597aa]" /> Recent Activity
              </h3>
            </div>
            <div className="p-6 space-y-6 max-h-[350px] overflow-y-auto custom-scrollbar">
              {[
                { event: "A2P Registration form submitted", time: "2 hours ago", status: "info" },
                { event: "Account verified by compliance team", time: "Yesterday", status: "success" },
                { event: "CRM Integration token generated", time: "Yesterday", status: "info" },
                { event: "Welcome kit dispatched to agent email", time: "2 days ago", status: "info" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start border-l-2 border-[#1597aa]/20 pl-4 py-1 hover:border-[#1597aa] transition-colors group">
                  <div className="flex-1">
                    <p className="text-sm text-white/80 group-hover:text-white transition-colors">{item.event}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{item.time}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#1597aa]/50" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: System Status + Appointments */}
          <div className="space-y-8">
            {/* System Status */}
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-xs font-futuristic text-white uppercase tracking-widest flex items-center gap-2 mb-8">
                <Cpu size={14} className="text-[#1597aa]" /> System Status
              </h3>
              <div className="space-y-5">
                {(() => {
                  const ss = userData?.systemStatus;
                  const statusDisplay = (val: string | undefined) => {
                    if (!val) return { label: 'Pending', color: 'bg-white/20' };
                    switch (val) {
                      case 'connected': case 'active': case 'approved': return { label: val.charAt(0).toUpperCase() + val.slice(1), color: 'bg-green-500' };
                      case 'in_progress': return { label: 'In Progress', color: 'bg-amber-500 animate-pulse' };
                      default: return { label: 'Pending', color: 'bg-white/20' };
                    }
                  };
                  return [
                    { name: "CRM Integration", ...statusDisplay(ss?.crm_integration) },
                    { name: "SMS Registration", ...statusDisplay(ss?.sms_registration) },
                    { name: "Workflow Core", ...statusDisplay(ss?.workflow_automation) },
                    { name: "Calendar Sync", ...statusDisplay(ss?.calendar_sync) },
                  ];
                })().map((sys, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-white/60">{sys.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 uppercase tracking-tighter">{sys.label}</span>
                      <div className={`w-2 h-2 rounded-full ${sys.color} shadow-[0_0_8px_currentColor]`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-xs font-futuristic text-white uppercase tracking-widest flex items-center gap-2 mb-8">
                <Calendar size={14} className="text-[#1597aa]" /> Appointments
              </h3>
              <div className="space-y-4">
                {[
                  { title: "Onboarding Call", date: "Tomorrow, 2:00 PM" },
                  { title: "System Walkthrough", date: "Feb 10, 10:00 AM" }
                ].map((apt, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-[#1597aa]/30 transition-all cursor-pointer group">
                    <p className="text-[11px] font-futuristic text-white group-hover:text-[#1597aa] transition-colors">{apt.title}</p>
                    <p className="text-[10px] text-white/40 mt-1.5">{apt.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HUDFrame>
  );
};

const OnboardingPage: React.FC<{ onBack: () => void; onSubmit: () => void; userId: string }> = ({ onBack, onSubmit, userId }) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [activeSections, setActiveSections] = useState<number[]>([1]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const toggleSection = (id: number) => { setActiveSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]); };
  const handleInputChange = (field: keyof FormData, value: string) => { setFormData(prev => ({ ...prev, [field]: value })); };
  const validate = () => {
    const required: (keyof FormData)[] = [ 'legalBusinessName', 'streetAddress', 'city', 'stateProvince', 'zipPostalCode', 'businessPhone', 'businessEmail', 'businessWebsite', 'firstName', 'lastName', 'directEmail', 'jobTitle', 'directPhone', 'legalEntityType', 'businessIndustry', 'taxIdEin', 'privacyPolicyUrl', 'termsConditionsUrl', 'optInFormUrl' ];
    return required.every(key => !!formData[key]);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const submission: PortalA2PSubmissionInsert = {
      client_id: userId,
      legal_business_name: formData.legalBusinessName,
      street_address: formData.streetAddress,
      city: formData.city,
      state: formData.stateProvince,
      zip: formData.zipPostalCode,
      country: formData.country,
      business_phone: formData.businessPhone,
      business_email: formData.businessEmail,
      business_website: formData.businessWebsite || null,
      rep_first_name: formData.firstName,
      rep_last_name: formData.lastName,
      rep_email: formData.directEmail,
      rep_job_title: formData.jobTitle === 'Other' ? formData.jobTitleOther : formData.jobTitle,
      rep_phone: formData.directPhone,
      business_type: formData.legalEntityType === 'Other' ? formData.legalEntityOther : formData.legalEntityType,
      business_industry: formData.businessIndustry === 'Other' ? formData.industryOther : formData.businessIndustry,
      tax_id: formData.taxIdEin,
      privacy_policy_url: formData.privacyPolicyUrl || null,
      terms_url: formData.termsConditionsUrl || null,
      opt_in_url: formData.optInFormUrl || null,
    };

    const { error } = await supabase
      .from('portal_a2p_submissions')
      .insert(submission as unknown as Record<string, unknown>);

    if (error) {
      console.error('Error submitting A2P form:', error);
      setSubmitError(error.message);
      setIsSubmitting(false);
      return;
    }

    await logActivity(userId, 'a2p_submitted', 'A2P registration form submitted');
    onSubmit();
  };
  const SectionHeader: React.FC<{ id: number; title: string; icon: React.ReactNode }> = ({ id, title, icon }) => (
    <button type="button" onClick={() => toggleSection(id)} className="w-full flex items-center justify-between p-5 bg-[#0d1117] border-b border-white/5 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-4"><div className={`p-2 rounded-lg ${activeSections.includes(id) ? 'bg-[#1597aa]/20 text-[#1597aa]' : 'bg-white/5 text-white/40'}`}>{icon}</div><h3 className={`font-futuristic text-sm tracking-wide ${activeSections.includes(id) ? 'text-white' : 'text-white/60'}`}>{title}</h3></div>
      <ChevronRight size={20} className={`text-white/20 transition-transform duration-300 ${activeSections.includes(id) ? 'rotate-90 text-[#1597aa]' : ''}`} />
    </button>
  );

  return (
    <div className="min-h-screen py-10 md:py-20 px-6 max-w-4xl mx-auto animate-in fade-in duration-1000">
      <div className="mb-10">
        <button onClick={onBack} className="flex items-center gap-2 text-[#1597aa]/60 hover:text-[#1597aa] transition-colors mb-6 text-xs font-futuristic"><ArrowLeft size={14} /> BACK TO COMMAND CENTER</button>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <Logo className="scale-75 origin-left" /><div className="text-right"><h1 className="text-2xl font-futuristic text-white glow-text uppercase tracking-tight">A2P REGISTRATION</h1><p className="text-white/40 text-[10px] mt-1 uppercase tracking-[0.3em]">Compliance Protocol v1.0 // ACTIVE</p></div>
        </div>
      </div>
      <div className="mb-10 flex items-center gap-4">
        <div className="flex gap-2 flex-1">{[1, 2, 3, 4].map((step) => (<div key={step} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${activeSections.includes(step) ? 'bg-[#1597aa] shadow-[0_0_10px_#1597aa]' : 'bg-white/10'}`} />))}</div>
        <button type="button" onClick={() => { setFormData({ legalBusinessName: 'Acme Solutions LLC', streetAddress: '123 Innovation Drive', city: 'Austin', stateProvince: 'Texas', zipPostalCode: '73301', country: 'United States', businessPhone: '+1 (555) 123-4567', businessEmail: 'info@acmesolutions.com', businessWebsite: 'https://acmesolutions.com', firstName: 'John', lastName: 'Smith', directEmail: 'john.smith@acmesolutions.com', jobTitle: 'CEO', jobTitleOther: '', directPhone: '+1 (555) 987-6543', legalEntityType: 'LLC', legalEntityOther: '', businessIndustry: 'Technology', industryOther: '', taxIdEin: '12-3456789', privacyPolicyUrl: 'https://acmesolutions.com/privacy', termsConditionsUrl: 'https://acmesolutions.com/terms', optInFormUrl: 'https://acmesolutions.com/opt-in' }); setActiveSections([1, 2, 3, 4]); }} className="text-[9px] font-futuristic text-amber-400/60 hover:text-amber-400 border border-amber-400/20 hover:border-amber-400/50 px-3 py-1 rounded-full transition-all uppercase tracking-widest flex-shrink-0">Magic Fill</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-panel rounded-2xl overflow-hidden border-white/10">
          <SectionHeader id={1} title="LEGAL BUSINESS DETAILS" icon={<Building2 size={20} />} />
          <div className={`transition-all duration-500 overflow-hidden ${activeSections.includes(1) ? 'max-h-[2000px] p-6' : 'max-h-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-full space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Legal Business Name <span className="text-[#1597aa]">*</span></label>
                <input type="text" value={formData.legalBusinessName} onChange={(e) => handleInputChange('legalBusinessName', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="" />
                <p className="text-[10px] text-white/30 italic">Exactly as on registration/incorporation docs</p>
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Street Address <span className="text-[#1597aa]">*</span></label>
                <div className="relative"><Globe className="absolute left-3 top-3.5 text-white/30" size={16} /><input type="text" value={formData.streetAddress} onChange={(e) => handleInputChange('streetAddress', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="" /></div>
                <p className="text-[10px] text-white/30 italic">No PO Boxes</p>
              </div>
              <div className="space-y-2"><label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">City <span className="text-[#1597aa]">*</span></label><input type="text" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="" /></div>
              <div className="space-y-2"><label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">State/Province <span className="text-[#1597aa]">*</span></label><input type="text" value={formData.stateProvince} onChange={(e) => handleInputChange('stateProvince', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="" /></div>
              <div className="space-y-2"><label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">ZIP / Postal Code <span className="text-[#1597aa]">*</span></label><input type="text" value={formData.zipPostalCode} onChange={(e) => handleInputChange('zipPostalCode', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="" /></div>
              <div className="space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Country <span className="text-[#1597aa]">*</span></label>
                <select value={formData.country} onChange={(e) => handleInputChange('country', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all">{COUNTRIES.map(country => (<option key={country} value={country}>{country}</option>))}</select>
              </div>
              <div className="space-y-2"><label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Business Phone <span className="text-[#1597aa]">*</span></label><input type="tel" value={formData.businessPhone} onChange={(e) => handleInputChange('businessPhone', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="e.g. +1 (555) 000-0000" /></div>
              <div className="space-y-2"><label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Business Email <span className="text-[#1597aa]">*</span></label><input type="email" value={formData.businessEmail} onChange={(e) => handleInputChange('businessEmail', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="e.g. info@company.com" /></div>
              <div className="space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Business Website URL <span className="text-[#1597aa]">*</span></label>
                <input type="url" value={formData.businessWebsite} onChange={(e) => handleInputChange('businessWebsite', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="" />
                <p className="text-[10px] text-white/30 italic">Must be live and working</p>
              </div>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-2xl overflow-hidden border-white/10">
          <SectionHeader id={2} title="AUTHORISED REPRESENTATIVE" icon={<UserCheck size={20} />} />
          <div className={`transition-all duration-500 overflow-hidden ${activeSections.includes(2) ? 'max-h-[2000px] p-6' : 'max-h-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">First Name <span className="text-[#1597aa]">*</span></label><input type="text" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="" /></div>
              <div className="space-y-2"><label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Last Name <span className="text-[#1597aa]">*</span></label><input type="text" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="" /></div>
              <div className="col-span-full space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Direct Email Address <span className="text-[#1597aa]">*</span></label>
                <input type="email" value={formData.directEmail} onChange={(e) => handleInputChange('directEmail', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="" />
                <p className="text-[10px] text-white/30 italic">Personal email, not info@ or support@</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Job Title <span className="text-[#1597aa]">*</span></label>
                <select value={formData.jobTitle} onChange={(e) => handleInputChange('jobTitle', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all"><option value="">Select Title</option><option>Owner</option><option>CEO</option><option>Director</option><option>Manager</option><option>Other</option></select>
                <p className="text-[10px] text-white/30 italic">If not listed, select 'Other' and specify below</p>
              </div>
              {formData.jobTitle === 'Other' && (<div className="space-y-2 animate-in slide-in-from-top-2 duration-300"><label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Specify Job Title</label><input type="text" value={formData.jobTitleOther} onChange={(e) => handleInputChange('jobTitleOther', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="e.g. Chief Innovation Officer" /></div>)}
              <div className="space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Direct Phone Number <span className="text-[#1597aa]">*</span></label>
                <input type="tel" value={formData.directPhone} onChange={(e) => handleInputChange('directPhone', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="e.g. +1 (555) 123-4567" />
                <p className="text-[10px] text-white/30 italic">Mobile or direct office line</p>
              </div>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-2xl overflow-hidden border-white/10">
          <SectionHeader id={3} title="BUSINESS CLASSIFICATION" icon={<Briefcase size={20} />} />
          <div className={`transition-all duration-500 overflow-hidden ${activeSections.includes(3) ? 'max-h-[2000px] p-6' : 'max-h-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Legal Entity Type <span className="text-[#1597aa]">*</span></label>
                <select value={formData.legalEntityType} onChange={(e) => handleInputChange('legalEntityType', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all"><option value="">Select Entity</option><option>Corporation</option><option>LLC</option><option>Sole Proprietor</option><option>Partnership</option><option>Non-Profit</option><option>Other</option></select>
                <p className="text-[10px] text-white/30 italic">If not listed, select 'Other' and specify</p>
              </div>
              {formData.legalEntityType === 'Other' && (<div className="space-y-2 animate-in slide-in-from-top-2 duration-300"><label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Specify Entity Type</label><input type="text" value={formData.legalEntityOther} onChange={(e) => handleInputChange('legalEntityOther', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="e.g. Government Agency" /></div>)}
              <div className="space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Business Industry <span className="text-[#1597aa]">*</span></label>
                <select value={formData.businessIndustry} onChange={(e) => handleInputChange('businessIndustry', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all"><option value="">Select Industry</option><option>Healthcare</option><option>Legal</option><option>Finance</option><option>Real Estate</option><option>Home Services</option><option>Marketing/Advertising</option><option>Technology</option><option>Retail</option><option>Education</option><option>Other</option></select>
                <p className="text-[10px] text-white/30 italic">If not listed, select 'Other' and specify</p>
              </div>
              {formData.businessIndustry === 'Other' && (<div className="space-y-2 animate-in slide-in-from-top-2 duration-300"><label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Specify Industry</label><input type="text" value={formData.industryOther} onChange={(e) => handleInputChange('industryOther', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="e.g. Renewable Energy" /></div>)}
              <div className="col-span-full space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Tax ID / EIN <span className="text-[#1597aa]">*</span></label>
                <input type="text" value={formData.taxIdEin} onChange={(e) => handleInputChange('taxIdEin', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="e.g. 12-3456789" />
                <p className="text-[10px] text-white/30 italic">For US businesses, this is your Employer Identification Number (EIN)</p>
              </div>
            </div>
          </div>
        </div>
        <div className="glass-panel rounded-2xl overflow-hidden border-white/10">
          <SectionHeader id={4} title="COMPLIANCE ASSETS" icon={<ShieldCheck size={20} />} />
          <div className={`transition-all duration-500 overflow-hidden ${activeSections.includes(4) ? 'max-h-[2000px] p-6' : 'max-h-0'}`}>
            <div className="space-y-6">
              <div className="space-y-2"><label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Privacy Policy URL <span className="text-[#1597aa]">*</span></label><input type="url" value={formData.privacyPolicyUrl} onChange={(e) => handleInputChange('privacyPolicyUrl', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="" /></div>
              <div className="space-y-2"><label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Terms & Conditions URL <span className="text-[#1597aa]">*</span></label><input type="url" value={formData.termsConditionsUrl} onChange={(e) => handleInputChange('termsConditionsUrl', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="" /></div>
              <div className="space-y-2">
                <label className="text-xs font-futuristic text-[#1597aa] uppercase tracking-wider block">Opt-In Form Page URL <span className="text-[#1597aa]">*</span></label>
                <input type="url" value={formData.optInFormUrl} onChange={(e) => handleInputChange('optInFormUrl', e.target.value)} className="w-full bg-[#0d1117] border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[#1597aa] outline-none transition-all" placeholder="" />
                <div className="mt-3 bg-white/[0.03] border border-white/5 rounded-lg p-4 text-[11px] leading-relaxed text-white/50 space-y-2">
                  <p className="font-bold text-white/70 uppercase">Opt-in page requirements:</p>
                  <ul className="list-disc pl-4 space-y-1"><li>Collect at least name and phone</li><li>Clearly show your business name</li><li>Explicit opt-in checkbox for SMS with consent wording</li><li>Mention message frequency, data rates, and opt-out instructions (STOP/HELP)</li></ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        {submitError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{submitError}</p>
          </div>
        )}
        <button type="submit" disabled={!validate() || isSubmitting} className={`w-full py-5 rounded-xl font-futuristic font-bold text-lg tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${validate() && !isSubmitting ? 'bg-[#1597aa] text-white shadow-[0_0_30px_rgba(21,151,170,0.4)] hover:shadow-[0_0_40px_rgba(21,151,170,0.6)]' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}>{isSubmitting ? (<div className="w-6 h-6 border-2 border-[#1597aa] border-t-transparent rounded-full animate-spin" />) : (<>TRANSMIT REGISTRATION<ChevronRight size={22} /></>)}</button>
      </form>
    </div>
  );
};

const ConfirmationPage: React.FC<{ onReturn: () => void }> = ({ onReturn }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="max-w-xl glass-panel p-12 rounded-3xl glow-border relative animate-in fade-in zoom-in duration-1000">
        <div className="flex justify-center mb-8"><div className="relative"><div className="absolute inset-0 bg-[#1597aa] blur-3xl opacity-20 animate-pulse" /><div className="relative w-24 h-24 rounded-full border-4 border-[#1597aa] flex items-center justify-center text-[#1597aa] shadow-[0_0_30px_rgba(21,151,170,0.3)]"><CheckCircle size={56} /></div></div></div>
        <h1 className="text-3xl font-futuristic text-white mb-4 glow-text uppercase tracking-tight">Submission Received</h1>
        <p className="text-white/60 leading-relaxed mb-10">Thank you for completing your A2P registration. Our systems are now validating your compliance assets. We'll review your information and be in touch within <span className="text-[#1597aa]">1-2 business days</span>.</p>
        <button onClick={onReturn} className="bg-transparent border border-[#1597aa]/30 hover:border-[#1597aa] text-[#1597aa] font-futuristic py-4 px-10 rounded-xl transition-all hover:bg-[#1597aa]/10">RETURN TO DASHBOARD</button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppState>('AUTH');
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<PortalUserData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const isA2pComplete = userData?.a2pSubmission !== null && userData?.a2pSubmission !== undefined;

  // Check for existing session on mount and listen for auth changes
  useEffect(() => {
    // Detect password recovery from URL before Supabase processes it into a session
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    const isRecoveryUrl = hashParams.get('type') === 'recovery' || queryParams.get('type') === 'recovery';

    const unsubscribe = onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentStep('RESET_PASSWORD');
        setInitialLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setUserData(null);
        setCurrentStep('AUTH');
      }
    });

    if (isRecoveryUrl) {
      // Recovery link clicked — show reset form, don't check session
      setCurrentStep('RESET_PASSWORD');
      setInitialLoading(false);
    } else {
      getSession().then(async (session) => {
        if (session?.user) {
          await ensurePortalClient(session.user.id, session.user.email || '');
          setUserId(session.user.id);
          setCurrentStep('DASHBOARD');
        }
        setInitialLoading(false);
      });
    }

    return unsubscribe;
  }, []);

  // Fetch user data when navigating to dashboard
  useEffect(() => {
    if (currentStep === 'DASHBOARD' && userId) {
      getPortalUserData(userId).then((data) => {
        if (data) setUserData(data);
      });
    }
  }, [currentStep, userId]);

  // Protected route: redirect to AUTH if not authenticated (except reset password page)
  useEffect(() => {
    if (!initialLoading && currentStep !== 'AUTH' && currentStep !== 'RESET_PASSWORD' && !userId) {
      setCurrentStep('AUTH');
    }
  }, [currentStep, userId, initialLoading]);

  const handleAuth = async (user: SupabaseUser) => {
    await ensurePortalClient(user.id, user.email || '');
    setUserId(user.id);
    setCurrentStep('INTRO');
  };

  const handleIntroComplete = () => setCurrentStep('DASHBOARD');

  const handleFormSubmit = () => {
    setCurrentStep('CONFIRMATION');
    // Re-fetch user data so dashboard shows updated A2P status
    if (userId) {
      getPortalUserData(userId).then((data) => {
        if (data) setUserData(data);
      });
    }
  };

  const returnToDashboard = () => setCurrentStep('DASHBOARD');
  const startA2p = () => setCurrentStep('FORM');

  const handleSignOut = async () => {
    await signOut();
  };

  const handlePasswordResetComplete = () => {
    setUserId(null);
    setUserData(null);
    setCurrentStep('AUTH');
  };

  if (initialLoading) {
    return (
      <div className="relative w-full min-h-screen overflow-x-hidden">
        <CircuitBackground />
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Logo iconOnly className="scale-125 animate-pulse" />
            <div className="w-8 h-8 border-2 border-[#1597aa] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      <CircuitBackground />
      {currentStep === 'INTRO' && (<IntroVideo onComplete={handleIntroComplete} />)}
      <div className={`transition-opacity duration-1000 ${currentStep === 'INTRO' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {currentStep === 'AUTH' && <AuthPage onAuth={handleAuth} />}
        {currentStep === 'RESET_PASSWORD' && <ResetPasswordPage onComplete={handlePasswordResetComplete} />}
        {currentStep === 'DASHBOARD' && <DashboardPage isA2pComplete={isA2pComplete} onStartA2p={startA2p} userData={userData} onSignOut={handleSignOut} />}
        {currentStep === 'FORM' && userId && <OnboardingPage onBack={returnToDashboard} onSubmit={handleFormSubmit} userId={userId} />}
        {currentStep === 'CONFIRMATION' && <ConfirmationPage onReturn={returnToDashboard} />}
      </div>
      <div className="fixed bottom-6 left-6 opacity-30 pointer-events-none select-none z-0"><div className="flex items-center gap-2"><div className="w-1 h-1 bg-[#1597aa] rounded-full animate-pulse" /><span className="text-[10px] font-futuristic tracking-[0.3em] text-white">ELIXUS CORE V4.2.0</span></div></div>
    </div>
  );
};

export default App;
