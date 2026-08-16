import React, { useState } from 'react';
import { useCctv } from '../context/CctvContext';
import { authService } from '../services/authService';
import type { UserAccount } from '../types/cctv';
import { 
  X, 
  ShieldCheck, 
  Building2, 
  User, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight,
  Database,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AuthModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { currentUser, login, logout, showToast } = useCctv();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup_owner' | 'public'>('signin');
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInRole, setSignInRole] = useState<'admin' | 'private_owner'>('admin');
  
  // Sign Up (Private Owner) state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpOrganization, setSignUpOrganization] = useState('');

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle Supabase Sign In (For existing Admins and Private Owners)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (authService.isConfigured()) {
        const res = await authService.signIn({ email: signInEmail, password: signInPassword });
        if (!res.success) {
          setAuthError(res.error || 'Authentication failed. Check your email & password.');
          return;
        }
        if (res.user) {
          login(res.user);
          showToast(`Welcome back, ${res.user.name}!`, 'success');
          onClose();
          return;
        }
      }

      // Offline / Local Demo Fallback Mode
      const isAdmin = signInRole === 'admin';
      const fallbackUser: UserAccount = {
        id: `USR-${Math.floor(100 + Math.random() * 900)}`,
        name: isAdmin ? 'Officer Gutu Meteku' : (signInEmail.split('@')[0] || 'Private Camera Owner'),
        email: signInEmail || `${signInRole}@guardiangis.org`,
        role: signInRole,
        organization: isAdmin ? 'Metropolitan Police Dept' : 'Private Property Security',
      };

      login(fallbackUser);
      showToast(`Authenticated (Local Fallback): ${fallbackUser.name}`, 'info');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Supabase Sign Up (Private Camera Owner Self-Registration)
  const handleSignUpOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (authService.isConfigured()) {
        const res = await authService.signUp({
          email: signUpEmail,
          password: signUpPassword,
          name: signUpName,
          role: 'private_owner',
          organization: signUpOrganization || 'Private Camera Owner Entity',
        });

        if (!res.success) {
          setAuthError(res.error || 'Failed to register Private Owner account.');
          return;
        }

        if (res.user) {
          login(res.user);
          showToast(`Account registered successfully! Welcome ${res.user.name}`, 'success');
          onClose();
          return;
        }
      }

      // Offline / Local Fallback Mode
      const fallbackUser: UserAccount = {
        id: `USR-${Math.floor(100 + Math.random() * 900)}`,
        name: signUpName || 'Private Owner',
        email: signUpEmail,
        role: 'private_owner',
        organization: signUpOrganization || 'Private Property Entity',
      };

      login(fallbackUser);
      showToast(`Private Owner registered (Local Fallback Mode): ${fallbackUser.name}`, 'success');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Guest Civilian Access (No Auth Required)
  const handleGuestAccess = () => {
    const guestUser: UserAccount = {
      id: 'USR-PUB-01',
      name: 'Public Citizen (Guest)',
      email: 'citizen@public.org',
      role: 'public',
      organization: 'General Public Civilian',
    };
    login(guestUser);
    showToast('Browsing as Public Guest Civilian (No authentication required)', 'info');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-panel" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '560px', 
          width: '100%', 
          padding: '2rem', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border-color)', 
          boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}>
              <KeyRound size={22} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>GuardianGIS Portal</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Authentication & Access Portal</p>
            </div>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Active Session Card if already logged in */}
        {currentUser && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={20} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>
                  Active User: {currentUser.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>
                  Role: <strong>{currentUser.role.replace('_', ' ').toUpperCase()}</strong>
                </div>
              </div>
            </div>

            <button 
              className="btn btn-danger btn-sm"
              onClick={() => { logout(); showToast('Signed out of session.', 'info'); }}
              style={{ fontSize: '0.75rem' }}
            >
              Sign Out
            </button>
          </div>
        )}

        {/* 3-Tab Navigation Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'signin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem', border: 'none' }}
            onClick={() => { setActiveTab('signin'); setAuthError(null); }}
          >
            <LogIn size={15} /> Sign In
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'signup_owner' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem', border: 'none' }}
            onClick={() => { setActiveTab('signup_owner'); setAuthError(null); }}
          >
            <UserPlus size={15} /> Register Owner
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'public' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, fontSize: '0.82rem', padding: '0.5rem', border: 'none' }}
            onClick={() => { setActiveTab('public'); setAuthError(null); }}
          >
            <User size={15} /> Guest Mode
          </button>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="#ef4444" />
            <span>{authError}</span>
          </div>
        )}

        {/* TAB 1: SIGN IN FORM */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn}>
            <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', marginBottom: '1.25rem', fontSize: '0.78rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={14} color="#60a5fa" />
              <span>Sign in with your pre-provisioned Supabase Admin credentials or registered Private Owner account.</span>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Sign In Role Access Level *</label>
              <select 
                className="form-select" 
                value={signInRole} 
                onChange={e => setSignInRole(e.target.value as 'admin' | 'private_owner')}
              >
                <option value="admin">👮 System Admin</option>
                <option value="private_owner">🏢 Private Camera Owner</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="officer.gutu@police.gov or owner@property.com"
                  value={signInEmail}
                  onChange={e => setSignInEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  className="form-input" 
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={e => setSignInPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem', fontWeight: 700 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Account'}
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER PRIVATE CAMERA OWNER */}
        {activeTab === 'signup_owner' && (
          <form onSubmit={handleSignUpOwner}>
            <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', marginBottom: '1.25rem', fontSize: '0.78rem', color: '#d8b4fe', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={14} color="#c084fc" />
              <span>Register a Private Camera Owner account to add and manage CCTV feeds.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div>
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Dawit Tadesse"
                  value={signUpName}
                  onChange={e => setSignUpName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Email Address *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="owner@property.com"
                  value={signUpEmail}
                  onChange={e => setSignUpEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Password *</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={e => setSignUpPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Property / Organization</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Abyssinia Hotel Security"
                  value={signUpOrganization}
                  onChange={e => setSignUpOrganization(e.target.value)}
                />
              </div>
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              🛡️ <em>System Admin accounts are provisioned exclusively in Supabase by system managers.</em>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem', fontWeight: 700 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Register Private Owner Account'}
            </button>
          </form>
        )}

        {/* TAB 3: PUBLIC GUEST ACCESS */}
        {activeTab === 'public' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <User size={28} color="#6ee7b7" />
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              General Public Civilian Mode
            </h4>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              No sign in or registration required! Explore public surveillance maps, search active public cameras, and submit incident reports freely.
            </p>

            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleGuestAccess}
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.9rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <span>Explore GIS Map as Guest</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
