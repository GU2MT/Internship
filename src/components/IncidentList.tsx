import React, { useState } from 'react';
import { useCctv } from '../context/CctvContext';
import { IncidentReportingForm } from './IncidentReportingForm';
import { 
  AlertTriangle, 
  MapPin, 
  Camera, 
  Search, 
  PlusCircle, 
  FileVideo, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';

export const IncidentList: React.FC = () => {
  const { 
    incidents, 
    visibleCameras, 
    updateIncidentStatus, 
    setSelectedCamera, 
    setActiveTab, 
    setMapViewState,
    userRole
  } = useCctv();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(incidents[0]?.id || null);
  const [showReportModal, setShowReportModal] = useState(false);

  const filteredIncidents = incidents.filter(inc => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q) ||
        inc.address.toLowerCase().includes(q) ||
        inc.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleFocusOnMap = (lat: number, lng: number) => {
    setMapViewState(prev => ({ ...prev, center: [lat, lng], zoom: 17 }));
    setActiveTab('map');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
      
      {/* Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', background: 'linear-gradient(90deg, #ffffff, #fca5a5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle color="#ef4444" size={26} /> Incident Management & Spatial GIS Log
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track crime reports, traffic collisions, and spatial proximity matches with public & private cameras.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowReportModal(true)}
        >
          <PlusCircle size={18} /> Report New Incident
        </button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <IncidentReportingForm onClose={() => setShowReportModal(false)} />
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search incident title, ID, address..." 
            style={{ paddingLeft: '2.4rem' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter Status:</span>
          <select 
            className="form-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Incidents</option>
            <option value="submitted">Submitted</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="footage_requested">Footage Requested</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

      </div>

      {/* Incident List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredIncidents.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertTriangle size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} /><br />
            No incidents found matching your query filters.
          </div>
        ) : (
          filteredIncidents.map(inc => {
            const isExpanded = expandedId === inc.id;
            const nearbyCams = visibleCameras.filter(c => inc.nearbyCameraIds.includes(c.id));
            const publicNearby = nearbyCams.filter(c => c.ownership === 'public').length;
            const privateNearby = nearbyCams.filter(c => c.ownership === 'private').length;

            return (
              <div 
                key={inc.id}
                className="glass-panel"
                style={{ 
                  overflow: 'hidden', 
                  borderLeft: `4px solid ${inc.severity === 'critical' ? '#ef4444' : inc.severity === 'high' ? '#f59e0b' : '#3b82f6'}`,
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Collapsed Bar */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : inc.id)}
                  style={{ 
                    padding: '1.25rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '1rem',
                    background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                          {inc.id}
                        </span>
                        <span className={`badge ${inc.severity === 'critical' ? 'badge-offline' : inc.severity === 'high' ? 'badge-maintenance' : 'badge-active'}`}>
                          {inc.severity.toUpperCase()}
                        </span>
                        <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>
                          {inc.reporterRole === 'admin' ? '👮 SYSTEM ADMIN' : inc.reporterRole === 'private_owner' ? '🏢 PRIVATE OWNER' : '🌐 PUBLIC CITIZEN'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          • {inc.reportedAt}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 600 }}>{inc.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                        <MapPin size={13} color="#3b82f6" /> {inc.address} ({inc.district})
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Nearby Camera Count Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="badge badge-public" title="Public Cameras in Proximity">
                        🛡️ {publicNearby} Public
                      </span>
                      <span className="badge badge-private" title="Private Cameras in Proximity">
                        🏢 {privateNearby} Private
                      </span>
                    </div>

                    {/* Status Dropdown */}
                    {userRole === 'admin' ? (
                      <select 
                        className="form-select"
                        style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}
                        value={inc.status}
                        onClick={e => e.stopPropagation()}
                        onChange={e => updateIncidentStatus(inc.id, e.target.value as any)}
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under_investigation">Under Investigation</option>
                        <option value="footage_requested">Footage Requested</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    ) : (
                      <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>
                        {inc.status.replace('_', ' ')}
                      </span>
                    )}

                    {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', background: 'rgba(11, 15, 25, 0.5)' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
                      
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Incident Description</h4>
                        <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          {inc.description}
                        </p>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                          Report Source: <strong style={{ color: '#fff' }}>{inc.reportedBy}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleFocusOnMap(inc.lat, inc.lng)}
                        >
                          <MapPin size={14} /> Focus GIS Map on Incident Location
                        </button>
                        
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(6, 182, 212, 0.08)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                          <strong>GIS Spatial Matching Rule:</strong><br />
                          Cameras within 500m are automatically indexed to facilitate law enforcement evidence collection.
                        </div>
                      </div>

                    </div>

                    {/* Nearby Matched CCTV Cameras List */}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Camera size={16} /> Spatial Proximity Matched Cameras ({nearbyCams.length})
                      </h4>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
                        {nearbyCams.map(cam => (
                          <div 
                            key={cam.id}
                            style={{ 
                              background: 'rgba(21, 31, 53, 0.7)', 
                              border: `1px solid ${cam.ownership === 'public' ? 'rgba(59,130,246,0.3)' : 'rgba(168,85,247,0.3)'}`,
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.75rem',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                <span className={`badge ${cam.ownership === 'public' ? 'badge-public' : 'badge-private'}`} style={{ fontSize: '0.65rem' }}>
                                  {cam.ownership.toUpperCase()}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  Azimuth: {cam.azimuth}° | Res: {cam.resolution}
                                </span>
                              </div>
                              <strong style={{ fontSize: '0.85rem', color: '#fff', display: 'block', marginBottom: '0.2rem' }}>
                                {cam.name}
                              </strong>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                📍 {cam.address}
                              </p>
                            </div>

                            <button 
                              className="btn btn-secondary btn-sm"
                              style={{ width: '100%', marginTop: '0.4rem' }}
                              onClick={() => setSelectedCamera(cam)}
                            >
                              <FileVideo size={13} /> Inspect & Request Footage
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
