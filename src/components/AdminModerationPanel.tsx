import React, { useState } from 'react';
import { useCctv } from '../context/CctvContext';
import type { CctvCamera } from '../types/cctv';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Camera, 
  MapPin, 
  Clock, 
  Search,
  Check,
  X
} from 'lucide-react';

export const AdminModerationPanel: React.FC = () => {
  const { cameras, approveCamera, rejectCamera, deleteCamera, setSelectedCamera } = useCctv();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');

  const filteredCameras = cameras.filter((cam: CctvCamera) => {
    const status = cam.approvalStatus || 'approved';
    if (filter !== 'all' && status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        cam.name.toLowerCase().includes(q) ||
        cam.id.toLowerCase().includes(q) ||
        cam.ownerName.toLowerCase().includes(q) ||
        cam.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = cameras.filter((c: CctvCamera) => (c.approvalStatus || 'approved') === 'pending').length;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <ShieldAlert color="var(--primary-cyan)" size={24} /> Admin Moderation & Approval Center
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Review, verify, approve, reject, or delete CCTV camera registrations and law enforcement access requests.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-active" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              ⏳ Pending Approvals: <strong>{pendingCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
            <button
              key={tab}
              className={`btn btn-sm ${filter === tab ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
              onClick={() => setFilter(tab)}
            >
              {tab === 'pending' && '⏳ '}
              {tab === 'approved' && '🟢 '}
              {tab === 'rejected' && '🔴 '}
              {tab} ({cameras.filter((c: CctvCamera) => tab === 'all' || (c.approvalStatus || 'approved') === tab).length})
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            className="form-input"
            placeholder="Search pending cameras..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {/* Camera Moderation Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredCameras.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: '0.5rem', opacity: 0.8 }} />
            <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>No cameras found in this moderation category</h3>
            <p style={{ fontSize: '0.85rem' }}>All submitted registrations have been verified and processed.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Camera & ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Owner / Entity</th>
                <th style={{ padding: '0.85rem 1rem' }}>District & Address</th>
                <th style={{ padding: '0.85rem 1rem' }}>Type & Specs</th>
                <th style={{ padding: '0.85rem 1rem' }}>Approval Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCameras.map(cam => {
                const appStatus = cam.approvalStatus || 'approved';
                return (
                  <tr key={cam.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    
                    {/* Camera Name */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Camera size={14} color="var(--primary-cyan)" /> {cam.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        ID: {cam.id}
                      </div>
                    </td>

                    {/* Owner */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ color: '#cbd5e1' }}>{cam.ownerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cam.ownerEmail || 'No email registered'}</div>
                    </td>

                    {/* Location */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={13} /> {cam.district}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cam.address}</div>
                    </td>

                    {/* Specs */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge-public" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{cam.type}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{cam.resolution} • {cam.storageRetentionDays}d retention</div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {appStatus === 'approved' && (
                        <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>🟢 Approved</span>
                      )}
                      {appStatus === 'pending' && (
                        <span className="badge badge-maintenance" style={{ fontSize: '0.7rem' }}>⏳ Pending Verification</span>
                      )}
                      {appStatus === 'rejected' && (
                        <span className="badge badge-private" style={{ fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}>🔴 Rejected</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => setSelectedCamera(cam)}
                          title="View Full Telemetry Details"
                        >
                          Details
                        </button>
                        
                        {appStatus !== 'approved' && (
                          <button 
                            className="btn btn-success btn-sm"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            onClick={() => approveCamera(cam.id)}
                            title="Approve Camera Registration"
                          >
                            <Check size={13} /> Approve
                          </button>
                        )}

                        {appStatus !== 'rejected' && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            onClick={() => rejectCamera(cam.id)}
                            title="Reject Camera Registration"
                          >
                            <X size={13} /> Reject
                          </button>
                        )}

                        <button 
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => {
                            if (window.confirm(`Delete ${cam.name} (${cam.id}) permanently from database?`)) {
                              deleteCamera(cam.id);
                            }
                          }}
                          title="Permanently Delete Camera"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
