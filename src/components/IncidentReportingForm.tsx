import React, { useState } from 'react';
import { useCctv } from '../context/CctvContext';
import type { IncidentType, IncidentSeverity } from '../types/cctv';
import { AlertTriangle, CheckCircle2, Radio } from 'lucide-react';

export const IncidentReportingForm: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { addIncident, calculateProximityCameras, setActiveTab, userRole, currentUser } = useCctv();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IncidentType>('burglary');
  const [severity, setSeverity] = useState<IncidentSeverity>('high');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Downtown Core');
  const [lat] = useState<number>(9.0142);
  const [lng] = useState<number>(38.7598);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reportedBy, setReportedBy] = useState(() => {
    if (currentUser?.name) {
      return currentUser.badgeId ? `${currentUser.name} (${currentUser.badgeId})` : currentUser.name;
    }
    return userRole === 'admin' ? 'Officer Patrol Squad #4' : 'Public Citizen Report';
  });

  // Live proximity preview
  const nearbyCameras = calculateProximityCameras(Number(lat), Number(lng), 500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !address) {
      alert('Please fill out all required incident fields.');
      return;
    }

    addIncident({
      title,
      description,
      type,
      severity,
      status: userRole === 'admin' ? 'under_investigation' : 'submitted',
      lat: Number(lat),
      lng: Number(lng),
      address,
      district,
      reportedBy: isAnonymous ? 'Anonymous Public Citizen' : reportedBy,
      reporterRole: userRole,
      isAnonymous,
    });

    if (onClose) onClose();
    setActiveTab('incidents');
  };

  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertTriangle size={22} color="#ef4444" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Log Incident & Spatial CCTV Match</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Report an incident to cross-reference with public and private CCTV coverage within 500m.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Incident Headline / Title *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Commercial Burglary at Retail Arcade, Vehicle Hit and Run"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Incident Classification Category</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value as IncidentType)}>
              <option value="burglary">Burglary / Break-in</option>
              <option value="vandalism">Vandalism / Property Damage</option>
              <option value="traffic_accident">Traffic Accident / Collision</option>
              <option value="suspicious_activity">Suspicious Activity</option>
              <option value="assault">Assault / Public Safety Concern</option>
              <option value="missing_person">Missing Person Search</option>
              <option value="other">Other Incident</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Severity Level</label>
            <select className="form-select" value={severity} onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}>
              <option value="critical">🔴 Critical (Immediate Action)</option>
              <option value="high">🟠 High Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="low">🟢 Low / Information Only</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Detailed Incident Narrative *</label>
            <textarea 
              className="form-textarea" 
              rows={3} 
              placeholder="Describe event details, suspect descriptions, vehicle license plates, or timeline..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Physical Address / Location *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. 45 Retail Row, Commercial Arcade"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">District Zone</label>
            <select className="form-select" value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="Downtown Core">Downtown Core</option>
              <option value="Financial District">Financial District</option>
              <option value="East District">East District</option>
              <option value="North District">North District</option>
              <option value="South District">South District</option>
              <option value="West District">West District</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Reporting Entity / Badge
            </label>
            <input 
              type="text" 
              className="form-input" 
              value={isAnonymous ? 'Anonymous Public Citizen' : reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              disabled={isAnonymous}
              required
            />
            {userRole === 'public' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span>Submit anonymously (Hide my contact / identity details)</span>
              </label>
            )}
          </div>

        </div>

        {/* Live Proximity Banner */}
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Radio size={20} color="#67e8f9" className="pulse-active" />
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#93c5fd' }}>
                Spatial Proximity Match Engine
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Identified <strong>{nearbyCameras.length} CCTV cameras</strong> (Public & Private) in 500m radius.
              </p>
            </div>
          </div>
          <span className="badge badge-public" style={{ fontSize: '0.75rem' }}>
            {nearbyCameras.length} CAMERAS IN RANGE
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          {onClose && (
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            <CheckCircle2 size={16} /> Submit Incident Report
          </button>
        </div>
      </form>

    </div>
  );
};
