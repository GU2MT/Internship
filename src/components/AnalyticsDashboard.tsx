import React from 'react';
import { useCctv } from '../context/CctvContext';
import { 
  BarChart3, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  PieChart, 
  Layers, 
  Activity,
  Globe,
  FileSpreadsheet
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { visibleCameras, incidents, showToast, userRole } = useCctv();

  const totalCameras = visibleCameras.length;
  const publicCameras = visibleCameras.filter(c => c.ownership === 'public').length;
  const privateCameras = visibleCameras.filter(c => c.ownership === 'private').length;
  
  const activeCameras = visibleCameras.filter(c => c.status === 'active').length;
  const maintenanceCameras = visibleCameras.filter(c => c.status === 'maintenance').length;
  const offlineCameras = visibleCameras.filter(c => c.status === 'offline').length;
  const uptimePercentage = totalCameras > 0 ? ((activeCameras / totalCameras) * 100).toFixed(1) : '100';

  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
  const incidentResolutionRate = totalIncidents > 0 ? ((resolvedIncidents / totalIncidents) * 100).toFixed(0) : '100';

  // Group by District
  const districtCounts = visibleCameras.reduce((acc, c) => {
    acc[c.district] = (acc[c.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by Camera Type
  const typeCounts = visibleCameras.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Export CSV Function
  const exportCsvAudit = () => {
    const headers = ['ID', 'Name', 'Ownership', 'Status', 'Type', 'Resolution', 'District', 'Address', 'Latitude', 'Longitude', 'Azimuth', 'OwnerName'];
    const rows = visibleCameras.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.ownership,
      c.status,
      c.type,
      c.resolution,
      `"${c.district}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      c.lat,
      c.lng,
      c.azimuth,
      `"${c.ownerName.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CCTV_GIS_Registry_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CCTV System Registry Audit log exported as CSV file.', 'success');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      
      {/* Header & Export */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', background: 'linear-gradient(90deg, #ffffff, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 color="var(--primary-cyan)" size={26} /> Command Analytics & Surveillance Footprint
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            System health indicators, spatial coverage ratios, and public vs private CCTV registry metrics.
          </p>
        </div>

        <button className="btn btn-primary" onClick={exportCsvAudit}>
          <FileSpreadsheet size={18} /> Export Registry Audit CSV
        </button>
      </div>

      {/* KPI Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Registered CCTV</span>
            <Camera size={18} color="var(--primary-blue)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{totalCameras}</div>
          <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginTop: '0.25rem' }}>
            🛡️ {publicCameras} Public | 🏢 {privateCameras} Private
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Camera Operational Rate</span>
            <Activity size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6ee7b7' }}>{uptimePercentage}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            🟢 {activeCameras} Active | 🟡 {maintenanceCameras} Maint | 🔴 {offlineCameras} Off
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Incident Cases</span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fca5a5' }}>{openIncidents}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Out of {totalIncidents} total logged cases
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Incident Resolution Rate</span>
            <CheckCircle size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fcd34d' }}>{incidentResolutionRate}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {resolvedIncidents} resolved out of {totalIncidents} reported
          </div>
        </div>

      </div>

      {/* Analytics Visual Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Public vs Private Ownership Ratio Bar */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} color="var(--primary-cyan)" /> Ownership Distribution Split
          </h3>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Public (Government/Police)</span>
              <strong>{publicCameras} ({((publicCameras/totalCameras)*100).toFixed(0)}%)</strong>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${(publicCameras/totalCameras)*100}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Private (Commercial/Business/Residential)</span>
              <strong>{privateCameras} ({((privateCameras/totalCameras)*100).toFixed(0)}%)</strong>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${(privateCameras/totalCameras)*100}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #c084fc)' }} />
            </div>
          </div>
        </div>

        {/* Hardware Form Factor Distribution */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--primary-cyan)" /> Camera Hardware Types
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                <span style={{ textTransform: 'uppercase', fontWeight: 600, color: '#cbd5e1' }}>{type}</span>
                <span className="badge badge-public">{count} Units</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* District Distribution Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={18} color="var(--primary-cyan)" /> Camera Coverage by District Zone
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>District Zone</th>
                <th style={{ padding: '0.75rem' }}>Total Cameras</th>
                <th style={{ padding: '0.75rem' }}>Public Sector</th>
                <th style={{ padding: '0.75rem' }}>Private Sector</th>
                <th style={{ padding: '0.75rem' }}>Active Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(districtCounts).map(([district, count]) => {
                const distCameras = visibleCameras.filter(c => c.district === district);
                const pubCount = distCameras.filter(c => c.ownership === 'public').length;
                const prvCount = distCameras.filter(c => c.ownership === 'private').length;
                const actCount = distCameras.filter(c => c.status === 'active').length;

                return (
                  <tr key={district} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#fff' }}>{district}</td>
                    <td style={{ padding: '0.75rem', color: '#93c5fd' }}>{count}</td>
                    <td style={{ padding: '0.75rem' }}>{pubCount}</td>
                    <td style={{ padding: '0.75rem' }}>{prvCount}</td>
                    <td style={{ padding: '0.75rem', color: '#6ee7b7' }}>{actCount} / {count} Active</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supabase Database Settings & Operations Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span style={{ color: '#10b981' }}>⚡</span> Supabase PostgreSQL Cloud Integration
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Database schema DDL script is available at <code>supabase/schema.sql</code>. Copy into Supabase SQL editor to create tables & enable Realtime subscriptions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => exportCsvAudit()}>
              <FileSpreadsheet size={16} /> Export Audit CSV
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

