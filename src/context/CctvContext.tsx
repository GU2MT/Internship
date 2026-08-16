import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { 
  CctvCamera, 
  IncidentReport, 
  UserRole, 
  UserAccount,
  FilterOptions, 
  MapViewState 
} from '../types/cctv';
import { INITIAL_CAMERAS, INITIAL_INCIDENTS } from '../data/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { 
  cctvService, 
  mapDbToCamera, 
  mapDbToIncident 
} from '../services/cctvService';
import { authService } from '../services/authService';

interface CctvContextType {
  cameras: CctvCamera[];
  visibleCameras: CctvCamera[];
  incidents: IncidentReport[];
  currentUser: UserAccount | null;
  userRole: UserRole;
  selectedCamera: CctvCamera | null;
  selectedIncident: IncidentReport | null;
  filterOptions: FilterOptions;
  mapViewState: MapViewState;
  activeTab: 'map' | 'register' | 'incidents' | 'analytics' | 'approvals';
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
  dbConnectionStatus: 'connected' | 'offline_fallback';
  isDbSyncing: boolean;

  // Handlers
  login: (user: UserAccount) => void;
  logout: () => void;
  setUserRole: (role: UserRole) => void;
  addCamera: (cameraData: Omit<CctvCamera, 'id' | 'registeredDate'>) => CctvCamera;
  updateCamera: (id: string, cameraData: Partial<CctvCamera>) => void;
  approveCamera: (id: string) => void;
  rejectCamera: (id: string) => void;
  deleteCamera: (id: string) => void;
  addIncident: (incidentData: Omit<IncidentReport, 'id' | 'reportedAt' | 'nearbyCameraIds'>) => IncidentReport;
  updateIncidentStatus: (id: string, status: IncidentReport['status']) => void;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  setSelectedCamera: (camera: CctvCamera | null) => void;
  setSelectedIncident: (incident: IncidentReport | null) => void;
  setActiveTab: (tab: 'map' | 'register' | 'incidents' | 'analytics' | 'approvals') => void;
  setMapViewState: React.Dispatch<React.SetStateAction<MapViewState>>;
  calculateProximityCameras: (lat: number, lng: number, radiusMeters: number) => CctvCamera[];
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
  resetToMockData: () => void;
  seedSupabaseDb: () => Promise<void>;
}

const CctvContext = createContext<CctvContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CAMERAS: 'guardiangis_cameras_v1',
  INCIDENTS: 'guardiangis_incidents_v1',
  ROLE: 'guardiangis_role_v1',
  USER: 'guardiangis_user_v1',
  DELETED_CAMERAS: 'guardiangis_deleted_cameras_v1',
};

export const CctvProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'connected' | 'offline_fallback'>(
    isSupabaseConfigured() ? 'connected' : 'offline_fallback'
  );
  const [isDbSyncing, setIsDbSyncing] = useState<boolean>(false);

  const [deletedCameraIds, setDeletedCameraIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DELETED_CAMERAS);
    return saved ? JSON.parse(saved) : [];
  });

  const [cameras, setCameras] = useState<CctvCamera[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CAMERAS);
    const deletedSaved = localStorage.getItem(STORAGE_KEYS.DELETED_CAMERAS);
    const deletedIds: string[] = deletedSaved ? JSON.parse(deletedSaved) : [];
    const baseCameras: CctvCamera[] = saved ? JSON.parse(saved) : INITIAL_CAMERAS;
    return baseCameras.filter(c => !deletedIds.includes(c.id));
  });

  const [incidents, setIncidents] = useState<IncidentReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
    const baseIncidents: IncidentReport[] = saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
    return baseIncidents;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    return currentUser?.role || 'public';
  });

  const login = (user: UserAccount) => {
    setCurrentUser(user);
    setUserRoleState(user.role);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.ROLE, user.role);
  };

  const logout = async () => {
    setCurrentUser(null);
    setUserRoleState('public');
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.setItem(STORAGE_KEYS.ROLE, 'public');
    if (isSupabaseConfigured()) {
      await authService.signOut();
    }
  };

  // Sync Supabase Auth listener
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const sub = authService.onAuthStateChange(user => {
      if (user) {
        setCurrentUser(user);
        setUserRoleState(user.role);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.ROLE, user.role);
      }
    });

    return () => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    };
  }, []);

  const [selectedCamera, setSelectedCamera] = useState<CctvCamera | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'register' | 'incidents' | 'analytics' | 'approvals'>('map');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    ownership: 'all',
    status: 'all',
    type: 'all',
    search: '',
    district: 'all',
    radiusKm: undefined,
  });

  const [mapViewState, setMapViewState] = useState<MapViewState>({
    center: [9.015, 38.760],
    zoom: 14,
    activeLayer: 'dark',
    showFovCones: true,
    geofenceRadiusMeters: null,
    geofenceCenter: null,
  });

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Fetch initial data from Supabase if configured & merge intelligently
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setDbConnectionStatus('offline_fallback');
      return;
    }

    let isMounted = true;
    setIsDbSyncing(true);

    async function loadSupabaseData() {
      try {
        let [dbCameras, dbIncidents] = await Promise.all([
          cctvService.fetchCameras(),
          cctvService.fetchIncidents(),
        ]);

        if (!isMounted) return;

        setDbConnectionStatus('connected');

        // Auto-seed if database tables are currently empty
        if (dbCameras.length === 0 && dbIncidents.length === 0) {
          const seedRes = await cctvService.seedDatabase(INITIAL_CAMERAS, INITIAL_INCIDENTS);
          if (seedRes.success) {
            [dbCameras, dbIncidents] = await Promise.all([
              cctvService.fetchCameras(),
              cctvService.fetchIncidents(),
            ]);
          }
        }

        const deletedSaved = localStorage.getItem(STORAGE_KEYS.DELETED_CAMERAS);
        const currentDeletedIds: string[] = deletedSaved ? JSON.parse(deletedSaved) : [];

        const validDbCameras = dbCameras.filter(c => !currentDeletedIds.includes(c.id));
        setCameras(prev => {
          const dbMap = new Map(validDbCameras.map(c => [c.id, c]));
          const localOnly = prev.filter(c => !dbMap.has(c.id) && !currentDeletedIds.includes(c.id));

          localOnly.forEach(cam => {
            cctvService.insertCamera(cam).catch(err => console.warn('Syncing local camera to DB notice:', err));
          });

          return [...validDbCameras, ...localOnly];
        });

        setIncidents(prev => {
          const dbMap = new Map(dbIncidents.map(i => [i.id, i]));
          const localOnly = prev.filter(i => !dbMap.has(i.id));

          localOnly.forEach(inc => {
            cctvService.insertIncident(inc).catch(err => console.warn('Syncing local incident to DB notice:', err));
          });

          return [...dbIncidents, ...localOnly];
        });

        showToast('Successfully connected & loaded dataset from Supabase Database!', 'success');
      } catch (err) {
        console.warn('Failed to initialize Supabase DB data:', err);
        if (isMounted) {
          setDbConnectionStatus('offline_fallback');
          showToast('Supabase connection warning. Using Local Storage Fallback.', 'warning');
        }
      } finally {
        if (isMounted) setIsDbSyncing(false);
      }
    }

    loadSupabaseData();

    // Setup Supabase Realtime channel subscriptions
    const channel = supabase
      .channel('public_schema_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cameras' }, payload => {
        const deletedSaved = localStorage.getItem(STORAGE_KEYS.DELETED_CAMERAS);
        const currentDeletedIds: string[] = deletedSaved ? JSON.parse(deletedSaved) : [];

        if (payload.eventType === 'INSERT') {
          const newCam = mapDbToCamera(payload.new);
          if (!currentDeletedIds.includes(newCam.id)) {
            setCameras(prev => (prev.some(c => c.id === newCam.id) ? prev : [newCam, ...prev]));
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedCam = mapDbToCamera(payload.new);
          if (!currentDeletedIds.includes(updatedCam.id)) {
            setCameras(prev => prev.map(c => (c.id === updatedCam.id ? updatedCam : c)));
          }
        } else if (payload.eventType === 'DELETE') {
          const deletedId = payload.old.id;
          setCameras(prev => prev.filter(c => c.id !== deletedId));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newInc = mapDbToIncident(payload.new);
          setIncidents(prev => (prev.some(i => i.id === newInc.id) ? prev : [newInc, ...prev]));
        } else if (payload.eventType === 'UPDATE') {
          const updatedInc = mapDbToIncident(payload.new);
          setIncidents(prev => prev.map(i => (i.id === updatedInc.id ? updatedInc : i)));
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [showToast]);

  // Sync state changes to localStorage as offline cache
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CAMERAS, JSON.stringify(cameras));
  }, [cameras]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELETED_CAMERAS, JSON.stringify(deletedCameraIds));
  }, [deletedCameraIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, userRole);
  }, [userRole]);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    showToast(`Switched active workspace role to: ${role === 'admin' ? 'System Admin' : role === 'private_owner' ? 'Private Camera Owner' : 'Public Civilian'}`, 'info');
  };

  // Distance calculation using Haversine formula (in meters)
  const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Compute visible cameras based on role & privacy policies
  // System Admin (userRole === 'admin') can view all camera locations.
  // Public cameras are visible to all users.
  // Private cameras are visible to their registered owner (matched by email/name).
  const visibleCameras = React.useMemo(() => {
    if (userRole === 'admin') {
      return cameras;
    }
    const userEmail = currentUser?.email?.trim().toLowerCase();
    const userName = currentUser?.name?.trim().toLowerCase();

    return cameras.filter(cam => {
      if (cam.ownership === 'public') {
        return true;
      }
      if (!userEmail && !userName) {
        return false;
      }
      const ownerEmailMatch = Boolean(userEmail && cam.ownerEmail && cam.ownerEmail.trim().toLowerCase() === userEmail);
      const ownerNameMatch = Boolean(userName && cam.ownerName && cam.ownerName.trim().toLowerCase() === userName);
      return ownerEmailMatch || ownerNameMatch;
    });
  }, [cameras, userRole, currentUser]);

  const calculateProximityCameras = (lat: number, lng: number, radiusMeters: number): CctvCamera[] => {
    return visibleCameras.filter(cam => calculateDistanceMeters(lat, lng, cam.lat, cam.lng) <= radiusMeters);
  };

  const addCamera = (cameraData: Omit<CctvCamera, 'id' | 'registeredDate'>): CctvCamera => {
    const isPublic = cameraData.ownership === 'public';
    const id = `CAM-${isPublic ? 'PUB' : 'PRV'}-${Math.floor(100 + Math.random() * 900)}`;
    const initialApprovalStatus = userRole === 'admin' ? 'approved' : 'pending';
    
    const resolvedOwnerEmail = cameraData.ownerEmail || currentUser?.email || undefined;
    const resolvedOwnerName = cameraData.ownerName || currentUser?.name || (userRole === 'admin' ? 'Metropolitan Police Dept' : 'CCTV Owner');

    const newCamera: CctvCamera = {
      ...cameraData,
      id,
      ownerEmail: resolvedOwnerEmail,
      ownerName: resolvedOwnerName,
      registeredDate: new Date().toISOString().split('T')[0],
      approvalStatus: cameraData.approvalStatus || initialApprovalStatus,
      fps: 30,
    };

    setCameras(prev => [newCamera, ...prev]);

    if (isSupabaseConfigured()) {
      cctvService.insertCamera(newCamera).then(res => {
        if (res.success) {
          showToast(`Camera ${id} registered (${initialApprovalStatus.toUpperCase()}) & saved to Supabase DB!`, 'success');
        } else {
          showToast(`Camera ${id} stored in Local Cache (Supabase sync notice: ${res.error})`, 'warning');
        }
      }).catch(err => {
        console.error('Failed to sync camera to Supabase:', err);
        showToast(`Camera ${id} saved to Local Storage fallback`, 'warning');
      });
    } else {
      showToast(`New ${cameraData.ownership.toUpperCase()} CCTV camera registered (${id}) - Status: ${initialApprovalStatus.toUpperCase()}`, 'success');
    }

    return newCamera;
  };

  const updateCamera = (id: string, cameraData: Partial<CctvCamera>) => {
    setCameras(prev => prev.map(c => (c.id === id ? { ...c, ...cameraData } : c)));

    if (isSupabaseConfigured()) {
      cctvService.updateCamera(id, cameraData).then(res => {
        if (res.success) {
          showToast(`Camera ${id} updated in Supabase DB`, 'info');
        } else {
          showToast(`Camera ${id} updated locally (Supabase update error: ${res.error})`, 'warning');
        }
      });
    } else {
      showToast(`Camera ${id} records updated locally`, 'info');
    }
  };

  const approveCamera = (id: string) => {
    updateCamera(id, { approvalStatus: 'approved', status: 'active' });
    showToast(`Camera ${id} APPROVED and set to Active status`, 'success');
  };

  const rejectCamera = (id: string) => {
    updateCamera(id, { approvalStatus: 'rejected', status: 'offline' });
    showToast(`Camera ${id} REJECTED by System Administrator`, 'warning');
  };

  const deleteCamera = (id: string) => {
    setDeletedCameraIds(prev => (prev.includes(id) ? prev : [...prev, id]));
    setCameras(prev => prev.filter(c => c.id !== id));
    if (selectedCamera?.id === id) setSelectedCamera(null);

    if (isSupabaseConfigured()) {
      cctvService.deleteCamera(id).then(res => {
        if (res.success) {
          showToast(`Camera ${id} removed from Supabase DB`, 'warning');
        } else {
          showToast(`Camera ${id} removed locally (Supabase delete notice: ${res.error})`, 'warning');
        }
      });
    } else {
      showToast(`Camera ${id} removed from system registry`, 'warning');
    }
  };

  const addIncident = (incidentData: Omit<IncidentReport, 'id' | 'reportedAt' | 'nearbyCameraIds'>): IncidentReport => {
    const id = `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nearby = calculateProximityCameras(incidentData.lat, incidentData.lng, 500);
    const nearbyCameraIds = nearby.map(c => c.id);

    const newIncident: IncidentReport = {
      ...incidentData,
      id,
      reportedAt: new Date().toLocaleString(),
      nearbyCameraIds,
    };

    setIncidents(prev => [newIncident, ...prev]);

    if (isSupabaseConfigured()) {
      cctvService.insertIncident(newIncident).then(res => {
        if (res.success) {
          showToast(`Incident (${id}) saved to Supabase! ${nearbyCameraIds.length} nearby cameras linked.`, 'success');
        } else {
          showToast(`Incident (${id}) saved locally (Supabase insert notice: ${res.error})`, 'warning');
        }
      });
    } else {
      showToast(`Incident report recorded (${id}). ${nearbyCameraIds.length} nearby cameras identified.`, 'success');
    }

    return newIncident;
  };

  const updateIncidentStatus = (id: string, status: IncidentReport['status']) => {
    setIncidents(prev => prev.map(inc => (inc.id === id ? { ...inc, status } : inc)));

    if (isSupabaseConfigured()) {
      cctvService.updateIncidentStatus(id, status).then(res => {
        if (res.success) {
          showToast(`Incident ${id} status updated in Supabase`, 'info');
        } else {
          showToast(`Incident ${id} status updated locally`, 'warning');
        }
      });
    } else {
      showToast(`Incident ${id} status updated to: ${status.replace('_', ' ')}`, 'info');
    }
  };

  const seedSupabaseDb = async () => {
    if (!isSupabaseConfigured()) {
      showToast('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env file.', 'warning');
      return;
    }
    setIsDbSyncing(true);
    const res = await cctvService.seedDatabase(cameras, incidents);
    setIsDbSyncing(false);
    if (res.success) {
      showToast('Successfully seeded current dataset to Supabase Database!', 'success');
    } else {
      showToast(`Failed to seed Supabase Database: ${res.error || 'Check schema or RLS permissions.'}`, 'warning');
    }
  };

  const resetToMockData = () => {
    setDeletedCameraIds([]);
    setCameras(INITIAL_CAMERAS);
    setIncidents(INITIAL_INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.CAMERAS);
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.DELETED_CAMERAS);
    showToast('System data reset to initial dataset.', 'info');
  };

  return (
    <CctvContext.Provider
      value={{
        cameras,
        visibleCameras,
        incidents,
        currentUser,
        userRole,
        selectedCamera,
        selectedIncident,
        filterOptions,
        mapViewState,
        activeTab,
        toastMessage,
        dbConnectionStatus,
        isDbSyncing,
        login,
        logout,
        setUserRole,
        addCamera,
        updateCamera,
        approveCamera,
        rejectCamera,
        deleteCamera,
        addIncident,
        updateIncidentStatus,
        setFilterOptions,
        setSelectedCamera,
        setSelectedIncident,
        setActiveTab,
        setMapViewState,
        calculateProximityCameras,
        showToast,
        resetToMockData,
        seedSupabaseDb,
      }}
    >
      {children}
    </CctvContext.Provider>
  );
};

export const useCctv = () => {
  const context = useContext(CctvContext);
  if (!context) throw new Error('useCctv must be used within a CctvProvider');
  return context;
};
