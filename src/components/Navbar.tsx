import React, { useState } from 'react';
import { useCctv } from '../context/CctvContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthModal } from './AuthModal';
import { 
  Shield, 
  Map, 
  PlusCircle, 
  AlertTriangle, 
  BarChart3, 
  Lock, 
  Camera,
  Database,
  UserCheck,
  LogIn,
  LogOut,
  Languages
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser,
    userRole, 
    activeTab, 
    setActiveTab, 
    cameras,
    visibleCameras, 
    incidents, 
    dbConnectionStatus,
    isDbSyncing,
    seedSupabaseDb,
    logout,
    showToast
  } = useCctv();

  const { language, setLanguage, t } = useLanguage();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const publicCamerasCount = cameras.filter(c => c.ownership === 'public').length;
  const privateCamerasCount = cameras.filter(c => c.ownership === 'private').length;
  const openIncidentsCount = incidents.filter(i => i.status !== 'resolved').length;
  const pendingApprovalsCount = cameras.filter(c => (c.approvalStatus || 'approved') === 'pending').length;

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    logout();
    showToast(t('logout_success_msg') || 'Signed out successfully.', 'info');
  };

  return (
    <>
      <header className="glass-panel nav-header-container" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '0.75rem 1.5rem', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
              flexShrink: 0
            }}>
              <Shield size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(90deg, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  GuardianGIS
                </h1>
                <span className="badge badge-public" style={{ fontSize: '0.65rem' }}>{t('hub_version')}</span>
                
                {/* Database Connection Badge */}
                <div 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.3rem', 
                    fontSize: '0.65rem', 
                    padding: '0.15rem 0.5rem', 
                    borderRadius: '999px',
                    background: dbConnectionStatus === 'connected' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    border: `1px solid ${dbConnectionStatus === 'connected' ? '#10b981' : '#f59e0b'}`,
                    color: dbConnectionStatus === 'connected' ? '#10b981' : '#f59e0b',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title={
                    dbConnectionStatus === 'connected' 
                      ? 'Connected to Supabase PostgreSQL & Realtime' 
                      : 'Local Storage Fallback Mode (Set VITE_SUPABASE_URL in .env to connect DB)'
                  }
                  onClick={() => {
                    if (dbConnectionStatus === 'connected') {
                      seedSupabaseDb();
                    }
                  }}
                >
                  <Database size={11} className={isDbSyncing ? 'spin-animation' : ''} />
                  <span>{dbConnectionStatus === 'connected' ? t('connected_supabase') : t('local_db')}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="nav-tabs-wrapper">
            <nav style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(11, 15, 25, 0.7)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <button 
                className={`btn ${activeTab === 'map' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none' }}
                onClick={() => setActiveTab('map')}
              >
                <Map size={16} />
                <span>{t('gis_map_view')}</span>
              </button>
              
              {/* Guarded Admin Tabs: Only show Register Camera if not pure public */}
              {userRole !== 'public' && (
                <button 
                  className={`btn ${activeTab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ border: 'none' }}
                  onClick={() => setActiveTab('register')}
                >
                  <PlusCircle size={16} />
                  <span>{t('register_camera')}</span>
                </button>
              )}
              
              <button 
                className={`btn ${activeTab === 'incidents' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none' }}
                onClick={() => setActiveTab('incidents')}
              >
                <AlertTriangle size={16} />
                <span>{t('incident_log')}</span>
                {openIncidentsCount > 0 && (
                  <span style={{ 
                    background: '#ef4444', 
                    color: '#fff', 
                    borderRadius: '999px', 
                    padding: '0.1rem 0.45rem', 
                    fontSize: '0.7rem', 
                    fontWeight: 700 
                  }}>
                    {openIncidentsCount}
                  </span>
                )}
              </button>
              
              {/* Guarded Admin Tabs: Analytics & Moderation Approvals */}
              {userRole === 'admin' && (
                <>
                  <button 
                    className={`btn ${activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ border: 'none' }}
                    onClick={() => setActiveTab('approvals')}
                  >
                    <UserCheck size={16} />
                    <span>{t('approvals')}</span>
                    {pendingApprovalsCount > 0 && (
                      <span style={{ 
                        background: '#f59e0b', 
                        color: '#000', 
                        borderRadius: '999px', 
                        padding: '0.1rem 0.45rem', 
                        fontSize: '0.7rem', 
                        fontWeight: 700 
                      }}>
                        {pendingApprovalsCount}
                      </span>
                    )}
                  </button>

                  <button 
                    className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ border: 'none' }}
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 size={16} />
                    <span>{t('analytics')}</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right Section: Language Switcher & Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            
            {/* Quick Telemetry Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }} className="desktop-only">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#93c5fd' }}>
                <Camera size={13} /> {t('public')}: {publicCamerasCount}
              </span>
              <span style={{ color: 'var(--border-color)' }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#d8b4fe' }}>
                <Camera size={13} /> {t('private')}: {privateCamerasCount}
              </span>
            </div>

            {/* Language Selection Dropdown (Sign In ጎን እንዲሆን የተስተካከለ) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.08)', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <Languages size={16} color="#38bdf8" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                style={{ 
                  background: 'transparent', 
                  color: '#fff', 
                  border: 'none', 
                  fontSize: '0.85rem', 
                  outline: 'none', 
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <option value="en" style={{ background: '#111827', color: '#fff' }}>English</option>
                <option value="am" style={{ background: '#111827', color: '#fff' }}>አማርኛ</option>
                <option value="om" style={{ background: '#111827', color: '#fff' }}>Afaan Oromoo</option>
              </select>
            </div>

            {/* Authenticated User Account Button Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setIsAuthModalOpen(true)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.4rem 0.8rem',
                  border: userRole === 'admin' ? '1px solid rgba(59, 130, 246, 0.4)' : userRole === 'private_owner' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)',
                  background: userRole === 'admin' ? 'rgba(59, 130, 246, 0.12)' : userRole === 'private_owner' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255,255,255,0.05)'
                }}
              >
                {currentUser ? <UserCheck size={16} color={userRole === 'admin' ? '#93c5fd' : '#d8b4fe'} /> : <LogIn size={16} />}
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
                    {currentUser ? currentUser.name : t('sign_in')}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {t(userRole) || userRole.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </button>

              {/* Direct 1-Click Logout Button for signed in Admins / Private Owners */}
              {currentUser && userRole !== 'public' && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleLogoutClick}
                  title={t('logout')}
                  style={{ 
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    height: '100%'
                  }}
                >
                  <LogOut size={14} />
                  <span className="desktop-only">{t('logout')}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Global Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
