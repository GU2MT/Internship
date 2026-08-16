import React from 'react';
import { useCctv } from '../context/CctvContext';
import { 
  X, 
  Video, 
  MapPin, 
  Compass, 
  Lock, 
  UserCheck, 
  Phone, 
  Mail, 
  Trash2, 
  Radio,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const CameraDetailsModal: React.FC = () => {
  const { 
    selectedCamera, 
    setSelectedCamera, 
    userRole, 
    approveCamera,
    rejectCamera,
    deleteCamera,
  } = useCctv();

  if (!selectedCamera) return null;

  const cam = selectedCamera;
  const isPublic = cam.ownership === 'public';
  const canViewSensitiveContact = userRole === 'admin' || userRole === 'private_owner';

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove ${cam.name} (${cam.id}) from the system registry?`)) {
      deleteCamera(cam.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedCamera(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '900px' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.9)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`badge ${isPublic ? 'badge-public' : 'badge-private'}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}>
              {isPublic ? '🛡️ PUBLIC CCTV' : '🏢 PRIVATE CCTV'}
            </span>
            <h2 style={{ fontSize: '1.2rem', color: '#fff' }}>{cam.name}</h2>
            <span className={`status-dot ${cam.status}`}></span>
            <span style={{ fontSize: '0.8rem', textTransform: 'capitalize', color: cam.status === 'active' ? '#6ee7b7' : cam.status === 'maintenance' ? '#fcd34d' : '#fca5a5' }}>
              {cam.status}
            </span>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setSelectedCamera(null)}
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          
          {/* Left Column: Simulated Feed & Specs */}
          <div>
            
            {/* Live Camera Feed Screen Simulation */}
            <div className="camera-feed-screen" style={{ marginBottom: '1.25rem' }}>
              <div className="scanline"></div>
              <div className="feed-overlay">
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    <Radio size={12} color="#10b981" className="pulse-active" /> LIVE STREAM: {cam.id}
                  </span>
                  <span style={{ background: 'rgba(239, 68, 68, 0.8)', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                    REC ● 30 FPS
                  </span>
                </div>

                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                  <Video size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} /><br />
                  [ TELEMETRY SIMULATION STREAM ]<br />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    RTSP: {cam.ipRtspStreamUrl || `rtsp://surv.gateway/stream/${cam.id.toLowerCase()}`}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>AZIMUTH: {cam.azimuth}° | FOV: {cam.fovAngle}°</span>
                  <span>RES: {cam.resolution} | RETENTION: {cam.storageRetentionDays}d</span>
                </div>
              </div>
            </div>

            {/* Specifications Grid */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--primary-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Compass size={16} /> GIS & Hardware Specifications
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Camera ID:</span><br />
                  <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{cam.id}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Hardware Type:</span><br />
                  <strong style={{ color: '#fff', textTransform: 'uppercase' }}>{cam.type}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Resolution Tier:</span><br />
                  <strong style={{ color: '#fff' }}>{cam.resolution}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Facing Azimuth:</span><br />
                  <strong style={{ color: '#fff' }}>{cam.azimuth}° (Compass Angle)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>FOV Cone Angle:</span><br />
                  <strong style={{ color: '#fff' }}>{cam.fovAngle}° Visual Arc</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Effective Distance:</span><br />
                  <strong style={{ color: '#fff' }}>{cam.fovDistance} meters</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Night Vision / IR:</span><br />
                  <strong style={{ color: cam.nightVision ? '#6ee7b7' : '#94a3b8' }}>
                    {cam.nightVision ? '✅ Enabled (Thermal/IR)' : '❌ Standard Only'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>PTZ Pan-Tilt-Zoom:</span><br />
                  <strong style={{ color: cam.ptzCapable ? '#6ee7b7' : '#94a3b8' }}>
                    {cam.ptzCapable ? '✅ Remote PTZ Active' : '❌ Fixed Direction'}
                  </strong>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Ownership, Contact & Footage Request */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Address & Zone */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="#3b82f6" /> Physical GIS Location
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>{cam.address}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                District/Zone: <strong style={{ color: '#93c5fd' }}>{cam.district}</strong> | GPS: <span style={{ fontFamily: 'var(--font-mono)' }}>{cam.lat.toFixed(4)}, {cam.lng.toFixed(4)}</span>
              </p>
            </div>

            {/* Ownership & Law Enforcement Privacy Card */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <UserCheck size={16} color="#a855f7" /> Ownership & Registration
                </h4>
                {cam.consentLawEnforcement ? (
                  <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>Law Enforcement Consent Active</span>
                ) : (
                  <span className="badge badge-maintenance" style={{ fontSize: '0.65rem' }}>Manual Outreach Required</span>
                )}
              </div>

              <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Owner / Entity Name:</span><br />
                <strong style={{ color: '#fff' }}>{cam.ownerName}</strong>
              </div>

              {canViewSensitiveContact ? (
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', padding: '0.75rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#93c5fd', fontWeight: 600, marginBottom: '0.4rem' }}>
                    <Lock size={14} /> Law Enforcement Verified Contact File
                  </div>
                  <div style={{ color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={13} /> {cam.ownerContact || 'No direct phone logged'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={13} /> {cam.ownerEmail || 'No email logged'}</span>
                    {cam.department && <span>Department: <strong>{cam.department}</strong></span>}
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--border-color)', borderRadius: '6px', padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  🔒 <em>Private owner contact details and phone numbers are restricted to authorized Law Enforcement personnel.</em>
                </div>
              )}
            </div>

            {/* Admin Moderation Actions: Approve, Reject, Delete */}
            {userRole === 'admin' && (
              <div style={{ marginTop: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} color="#10b981" /> System Admin Moderation Controls
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button 
                    className="btn btn-success btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    onClick={() => { approveCamera(cam.id); setSelectedCamera(null); }}
                  >
                    <CheckCircle size={14} /> Approve Registration
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ background: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', border: 'none' }}
                    onClick={() => { rejectCamera(cam.id); setSelectedCamera(null); }}
                  >
                    <XCircle size={14} /> Reject Registration
                  </button>
                </div>
                <button 
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  onClick={handleDelete}
                >
                  <Trash2 size={14} /> Delete Camera Record
                </button>
              </div>
            )}

            {userRole === 'private_owner' && (
              <button 
                className="btn btn-danger btn-sm"
                style={{ width: '100%', marginTop: '0.5rem' }}
                onClick={handleDelete}
              >
                <Trash2 size={14} /> Remove Camera Record
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
