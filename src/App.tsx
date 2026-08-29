import React from 'react';
import { CctvProvider, useCctv } from './context/CctvContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { GisMap } from './components/GisMap';
import { CameraRegistrationForm } from './components/CameraRegistrationForm';
import { IncidentList } from './components/IncidentList';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminModerationPanel } from './components/AdminModerationPanel';
import { CameraDetailsModal } from './components/CameraDetailsModal';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, userRole, toastMessage, showToast } = useCctv();
  const { t } = useLanguage();

  // Guard active tab if public user attempts to access admin features directly
  React.useEffect(() => {
    if (userRole === 'public' && (activeTab === 'register' || activeTab === 'analytics' || activeTab === 'approvals')) {
      showToast(t('access_restricted'), 'warning');
      setActiveTab('map');
    }
  }, [userRole, activeTab, setActiveTab, showToast, t]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-darker)' }}>
      {/* Navigation Header */}
      <Navbar />

      {/* Main Active Tab View */}
      <main style={{ flex: 1 }}>
        {activeTab === 'map' && <GisMap />}
        {activeTab === 'register' && userRole !== 'public' && <CameraRegistrationForm />}
        {activeTab === 'incidents' && <IncidentList />}
        {activeTab === 'approvals' && userRole === 'admin' && <AdminModerationPanel />}
        {activeTab === 'analytics' && userRole === 'admin' && <AnalyticsDashboard />}
      </main>

      {/* Global Camera Details Modal */}
      <CameraDetailsModal />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="toast-alert">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 color="#10b981" size={20} />
          ) : toastMessage.type === 'warning' ? (
            <AlertTriangle color="#f59e0b" size={20} />
          ) : (
            <Info color="#3b82f6" size={20} />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <CctvProvider>
        <AppContent />
      </CctvProvider>
    </LanguageProvider>
  );
}

export default App;
