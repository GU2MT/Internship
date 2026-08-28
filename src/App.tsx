import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CctvProvider, useCctv } from './context/CctvContext';
<<<<<<< Updated upstream
import { LanguageProvider } from './context/LanguageContext';
=======
import { LanguageProvider, useLanguage } from './context/LanguageContext';
>>>>>>> Stashed changes
import { Navbar } from './components/Navbar';
import { GisMap } from './components/GisMap';
import { CameraRegistrationForm } from './components/CameraRegistrationForm';
import { IncidentList } from './components/IncidentList';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminModerationPanel } from './components/AdminModerationPanel';
import { CameraDetailsModal } from './components/CameraDetailsModal';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

const AppContent: React.FC = () => {
<<<<<<< Updated upstream
  const { currentUser, activeTab, setActiveTab, userRole, toastMessage, showToast } = useCctv();

  // Guard active tab if public user attempts to access admin features directly
  React.useEffect(() => {
    if (userRole === 'public' && (activeTab === 'register' || activeTab === 'analytics' || activeTab === 'approvals')) {
      showToast('Access Restricted: Please sign in as Law Enforcement or Private Owner.', 'warning');
      setActiveTab('map');
    }
  }, [userRole, activeTab, setActiveTab, showToast]);
=======
  const { currentUser, userRole, toastMessage } = useCctv();
  const { t } = useLanguage();
>>>>>>> Stashed changes

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-darker)' }}>
      {/* Navigation Header */}
      <Navbar />

      {/* Main Routed View */}
      <main style={{ flex: 1, position: 'relative' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/map" replace />} />
          <Route path="/map" element={<GisMap />} />
          
          {/* Protected Routes */}
          <Route 
            path="/register" 
            element={userRole !== 'public' ? <CameraRegistrationForm /> : <Navigate to="/map" replace />} 
          />
          <Route path="/incidents" element={<IncidentList />} />
          <Route 
            path="/approvals" 
            element={userRole === 'admin' ? <AdminModerationPanel /> : <Navigate to="/map" replace />} 
          />
          <Route 
            path="/analytics" 
            element={userRole === 'admin' ? <AnalyticsDashboard /> : <Navigate to="/map" replace />} 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/map" replace />} />
        </Routes>
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
<<<<<<< Updated upstream
        <AppContent />
      </CctvProvider>
    </LanguageProvider>
  );
}

export default App;
=======
        <Router>
          <AppContent />
        </Router>
      </CctvProvider>
    </LanguageProvider>
>>>>>>> Stashed changes
  );
}

export default App;

