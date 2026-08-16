import React, { useState, useEffect, useRef } from 'react';
import { useCctv } from '../context/CctvContext';
import type { CctvCamera } from '../types/cctv';
import L from 'leaflet';
import { 
  Layers, 
  Search, 
  Compass, 
  SlidersHorizontal,
  MapPin,
  Radio,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Maximize2,
  X
} from 'lucide-react';

// Tile Layer URLs
const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
  },
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
  }
};

export const GisMap: React.FC = () => {
  const { 
    visibleCameras, 
    incidents,
    filterOptions, 
    setFilterOptions, 
    setSelectedCamera,
    setSelectedIncident,
    mapViewState,
    setMapViewState,
    userRole
  } = useCctv();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const fovLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const incidentLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [isGeofenceActive, setIsGeofenceActive] = useState(false);
  const [geofenceRadius, setGeofenceRadius] = useState<number>(500); // 500 meters
  const [geofenceResultCount, setGeofenceResultCount] = useState<number | null>(null);
  
  // Clean Map View & Collapsible Panel State
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(false);

  // Extract unique districts from visible cameras
  const districts = ['all', ...Array.from(new Set(visibleCameras.map(c => c.district)))];

  // Filter visible cameras
  const filteredCameras = visibleCameras.filter(cam => {
    if (filterOptions.ownership !== 'all' && cam.ownership !== filterOptions.ownership) return false;
    if (filterOptions.status !== 'all' && cam.status !== filterOptions.status) return false;
    if (filterOptions.type !== 'all' && cam.type !== filterOptions.type) return false;
    if (selectedDistrict !== 'all' && cam.district !== selectedDistrict) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = cam.name.toLowerCase().includes(q);
      const matchId = cam.id.toLowerCase().includes(q);
      const matchAddr = cam.address.toLowerCase().includes(q);
      const matchOwner = cam.ownerName.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchAddr && !matchOwner) return false;
    }
    return true;
  });

  // Safe layer url getter
  const getTileConfig = (layerKey: 'dark' | 'streets' | 'satellite' | 'heatmap') => {
    if (layerKey === 'streets') return TILE_LAYERS.streets;
    if (layerKey === 'satellite') return TILE_LAYERS.satellite;
    return TILE_LAYERS.dark;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: mapViewState.center,
      zoom: mapViewState.zoom,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileConfig = getTileConfig(mapViewState.activeLayer);
    L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
    }).addTo(map);

    markersLayerGroupRef.current = L.layerGroup().addTo(map);
    fovLayerGroupRef.current = L.layerGroup().addTo(map);
    incidentLayerGroupRef.current = L.layerGroup().addTo(map);

    leafletMapRef.current = map;

    // Handle map click for Geofence radius tool
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (isGeofenceActive) {
        drawGeofenceCircle(lat, lng, geofenceRadius);
      }
    });

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update Tile Layer when layer mode changes
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;
    
    // Remove existing tile layers
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileConfig = getTileConfig(mapViewState.activeLayer);
    L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: 19,
    }).addTo(map);
  }, [mapViewState.activeLayer]);

  // Render Camera Markers & FOV Cones
  useEffect(() => {
    if (!leafletMapRef.current || !markersLayerGroupRef.current || !fovLayerGroupRef.current) return;

    const markersGroup = markersLayerGroupRef.current;
    const fovGroup = fovLayerGroupRef.current;

    markersGroup.clearLayers();
    fovGroup.clearLayers();

    filteredCameras.forEach(cam => {
      // 1. Create Custom Marker Icon
      const isPublic = cam.ownership === 'public';
      const statusColor = 
        cam.status === 'active' ? '#10b981' : 
        cam.status === 'maintenance' ? '#f59e0b' : '#ef4444';
      
      const badgeBg = isPublic ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)';
      const badgeIcon = isPublic ? '🛡️' : '🏢';

      const customHtml = `
        <div style="
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: ${badgeBg};
          border: 2px solid #ffffff;
          box-shadow: 0 0 12px ${isPublic ? 'rgba(59, 130, 246, 0.6)' : 'rgba(168, 85, 247, 0.6)'};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        " class="camera-marker-icon">
          <span style="font-size: 16px;">${badgeIcon}</span>
          <span style="
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: ${statusColor};
            border: 2px solid #0f172a;
            box-shadow: 0 0 6px ${statusColor};
          "></span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-cctv-marker',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([cam.lat, cam.lng], { icon: customIcon });

      // Popup Content
      const popupContent = document.createElement('div');
      popupContent.style.padding = '0.5rem';
      popupContent.style.width = '240px';
      popupContent.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem;">
          <span style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 0.15rem 0.4rem; border-radius: 4px; background: ${isPublic ? 'rgba(59,130,246,0.2)' : 'rgba(168,85,247,0.2)'}; color: ${isPublic ? '#93c5fd' : '#d8b4fe'}; border: 1px solid ${isPublic ? 'rgba(59,130,246,0.4)' : 'rgba(168,85,247,0.4)'};">
            ${cam.ownership.toUpperCase()}
          </span>
          <span style="font-size: 0.65rem; font-weight: 600; color: ${statusColor}; text-transform: uppercase;">
            ● ${cam.status}
          </span>
        </div>
        <h4 style="font-size: 0.9rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem; line-height: 1.2;">
          ${cam.name}
        </h4>
        <p style="font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.25rem;">
          📍 ${cam.address}
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; font-size: 0.7rem; color: #cbd5e1; background: rgba(255,255,255,0.05); padding: 0.4rem; border-radius: 6px; margin-bottom: 0.6rem;">
          <div><strong style="color: #94a3b8;">Type:</strong> ${cam.type.toUpperCase()}</div>
          <div><strong style="color: #94a3b8;">Res:</strong> ${cam.resolution}</div>
          <div><strong style="color: #94a3b8;">Azimuth:</strong> ${cam.azimuth}°</div>
          <div><strong style="color: #94a3b8;">FOV:</strong> ${cam.fovAngle}°</div>
        </div>
        <button id="btn-inspect-${cam.id}" style="
          width: 100%;
          padding: 0.45rem;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
        ">
          🔍 Inspect Camera & Live Feed
        </button>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${cam.id}`);
        if (btn) {
          btn.onclick = () => setSelectedCamera(cam);
        }
      });

      markersGroup.addLayer(marker);

      // 2. Render Field of View (FOV) Cones if enabled
      if (mapViewState.showFovCones && cam.status !== 'offline') {
        const conePoints = calculateFovConePolygon(
          cam.lat,
          cam.lng,
          cam.azimuth,
          cam.fovAngle,
          cam.fovDistance
        );

        const coneColor = isPublic ? '#3b82f6' : '#a855f7';
        const polygon = L.polygon(conePoints, {
          color: coneColor,
          weight: 1,
          opacity: 0.7,
          fillColor: coneColor,
          fillOpacity: 0.18,
        });

        fovGroup.addLayer(polygon);
      }
    });
  }, [filteredCameras, mapViewState.showFovCones]);

  // Render Incidents Markers on Map
  useEffect(() => {
    if (!leafletMapRef.current || !incidentLayerGroupRef.current) return;
    const incidentGroup = incidentLayerGroupRef.current;
    incidentGroup.clearLayers();

    incidents.forEach(inc => {
      if (inc.status === 'resolved') return;

      const customHtml = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ef4444;
          border: 2px solid #ffffff;
          box-shadow: 0 0 14px rgba(239, 68, 68, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          animation: pulse 1.5s infinite;
        ">
          ⚠️
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'custom-incident-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([inc.lat, inc.lng], { icon });

      const popupContent = document.createElement('div');
      popupContent.style.padding = '0.5rem';
      popupContent.style.width = '240px';
      popupContent.innerHTML = `
        <span style="font-size: 0.65rem; font-weight: 700; color: #fca5a5; background: rgba(239,68,68,0.2); padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid rgba(239,68,68,0.4);">
          INCIDENT REPORT
        </span>
        <h4 style="font-size: 0.85rem; font-weight: 700; color: #fff; margin: 0.3rem 0;">${inc.title}</h4>
        <p style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.4rem;">${inc.description.substring(0, 80)}...</p>
        <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.5rem;">
          📍 ${inc.address}<br/>
          📷 Nearby Cameras: <strong>${inc.nearbyCameraIds.length}</strong>
        </div>
        <button id="btn-inc-${inc.id}" style="width: 100%; padding: 0.4rem; background: #ef4444; color: white; border: none; border-radius: 6px; font-weight: 600; font-size: 0.75rem; cursor: pointer;">
          View Incident & Nearby CCTV
        </button>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inc-${inc.id}`);
        if (btn) {
          btn.onclick = () => setSelectedIncident(inc);
        }
      });

      incidentGroup.addLayer(marker);
    });
  }, [incidents]);

  // Utility to calculate visual wedge cone coordinates for FOV
  const calculateFovConePolygon = (
    lat: number,
    lng: number,
    azimuthDegrees: number,
    fovAngleDegrees: number,
    distanceMeters: number
  ): [number, number][] => {
    const points: [number, number][] = [[lat, lng]];

    const startAngle = azimuthDegrees - fovAngleDegrees / 2;
    const endAngle = azimuthDegrees + fovAngleDegrees / 2;
    const steps = 10;

    for (let i = 0; i <= steps; i++) {
      const currentAngle = startAngle + (endAngle - startAngle) * (i / steps);
      const rad = (currentAngle * Math.PI) / 180;

      // Approximate lat/lng displacement
      const dLat = (distanceMeters * Math.cos(rad)) / 111320;
      const dLng = (distanceMeters * Math.sin(rad)) / (111320 * Math.cos((lat * Math.PI) / 180));

      points.push([lat + dLat, lng + dLng]);
    }

    return points;
  };

  // Handle Geofence Radius drawing
  const drawGeofenceCircle = (lat: number, lng: number, radiusMeters: number) => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    if (geofenceCircleRef.current) {
      map.removeLayer(geofenceCircleRef.current);
    }

    const circle = L.circle([lat, lng], {
      radius: radiusMeters,
      color: '#06b6d4',
      weight: 2,
      fillColor: '#06b6d4',
      fillOpacity: 0.15,
      dashArray: '6, 6',
    }).addTo(map);

    geofenceCircleRef.current = circle;

    // Count cameras in radius
    const inRadius = visibleCameras.filter(cam => {
      const d = map.distance([lat, lng], [cam.lat, cam.lng]);
      return d <= radiusMeters;
    });

    setGeofenceResultCount(inRadius.length);
    setMapViewState(prev => ({ ...prev, geofenceRadiusMeters: radiusMeters, geofenceCenter: [lat, lng] }));
  };

  const clearGeofence = () => {
    if (leafletMapRef.current && geofenceCircleRef.current) {
      leafletMapRef.current.removeLayer(geofenceCircleRef.current);
      geofenceCircleRef.current = null;
    }
    setIsGeofenceActive(false);
    setGeofenceResultCount(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
      
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Unified Top Control Overlay Bar (Clean Flex Container - Zero Mobile Overlap) */}
      <div className="gis-top-control-bar">
        {/* Left Control: Clean Map View Toggle */}
        <div className="glass-panel gis-clean-map-toggle" style={{ padding: '0.4rem' }}>
          <button
            className={`btn btn-sm ${isPanelCollapsed ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title={isPanelCollapsed ? 'Show Camera Filters & Tools' : 'Switch to Clean Map View Only'}
          >
            {isPanelCollapsed ? <Eye size={15} /> : <EyeOff size={15} />}
            <span>{isPanelCollapsed ? 'Show Filters' : 'Clean Map View'}</span>
          </button>
        </div>

        {/* Right Control: Map Layer Switcher */}
        <div className="glass-panel gis-layer-switcher" style={{ padding: '0.4rem', display: 'flex', gap: '0.35rem' }}>
          {(['dark', 'streets', 'satellite'] as const).map(layer => (
            <button
              key={layer}
              className={`btn btn-sm ${mapViewState.activeLayer === layer ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}
              onClick={() => setMapViewState(prev => ({ ...prev, activeLayer: layer }))}
            >
              <Layers size={13} /> <span>{layer}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Left Control Panel / Mobile Bottom Sheet Drawer (Filters & Geofence) */}
      {!isPanelCollapsed && (
        <div className="glass-panel gis-filter-panel" style={{
          position: 'absolute',
          top: '3.8rem',
          left: '1rem',
          zIndex: 900,
          width: '330px',
          padding: '1.25rem',
          maxHeight: 'calc(100vh - 140px)',
          overflowY: 'auto'
        }}>
          
          {/* Location Privacy Status Badge */}
          {userRole === 'admin' ? (
            <div style={{ padding: '0.45rem 0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '6px', marginBottom: '0.85rem', fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={14} /> <span><strong>Admin System Access:</strong> All cameras visible</span>
            </div>
          ) : (
            <div style={{ padding: '0.45rem 0.75rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '6px', marginBottom: '0.85rem', fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={14} /> <span><strong>Location Privacy Active:</strong> Viewing only your camera locations</span>
            </div>
          )}

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={18} color="var(--primary-cyan)" /> GIS Camera Identification
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                {filteredCameras.length} Matched
              </span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setIsPanelCollapsed(true)}
                title="Collapse Panel (Clean Map View)"
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="form-group" style={{ marginBottom: '0.85rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search camera name, address, owner..." 
                style={{ paddingLeft: '2.4rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            
            {/* Ownership Filter */}
            <div>
              <label className="form-label">Ownership Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem' }}>
                {(['all', 'public', 'private'] as const).map(type => (
                  <button
                    key={type}
                    className={`btn btn-sm ${filterOptions.ownership === type ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ textTransform: 'capitalize', padding: '0.35rem' }}
                    onClick={() => setFilterOptions(prev => ({ ...prev, ownership: type }))}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="form-label">Operational Status</label>
              <select 
                className="form-select"
                value={filterOptions.status}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, status: e.target.value as any }))}
              >
                <option value="all">All Operational Statuses</option>
                <option value="active">🟢 Active Only</option>
                <option value="maintenance">🟡 Under Maintenance</option>
                <option value="offline">🔴 Offline / Inactive</option>
              </select>
            </div>

            {/* District Selector */}
            <div>
              <label className="form-label">Jurisdiction Zone / District</label>
              <select
                className="form-select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                {districts.map(d => (
                  <option key={d} value={d}>
                    {d === 'all' ? 'All Districts / Zones' : `Zone: ${d}`}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />

          {/* GIS Geofencing & Visual FOV Toggles */}
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Radio size={15} color="var(--primary-cyan)" /> Proximity Geofencing Tool
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem' }}>Show FOV Cones:</span>
                <button 
                  className={`btn btn-sm ${mapViewState.showFovCones ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => setMapViewState(prev => ({ ...prev, showFovCones: !prev.showFovCones }))}
                >
                  {mapViewState.showFovCones ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#67e8f9' }}>Radius Inspector</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{geofenceRadius}m</span>
                </div>
                <input 
                  type="range" 
                  min={100} 
                  max={1500} 
                  step={50}
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                  <button 
                    className={`btn btn-sm ${isGeofenceActive ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => {
                      setIsGeofenceActive(!isGeofenceActive);
                      if (isGeofenceActive) clearGeofence();
                    }}
                  >
                    <MapPin size={14} /> {isGeofenceActive ? 'Click Map Point...' : 'Activate Radius'}
                  </button>
                  {geofenceResultCount !== null && (
                    <button className="btn btn-danger btn-sm" onClick={clearGeofence}>
                      Clear
                    </button>
                  )}
                </div>

                {geofenceResultCount !== null && (
                  <div style={{ marginTop: '0.6rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.75rem', color: '#6ee7b7', textAlign: 'center' }}>
                    🎯 <strong>{geofenceResultCount} CCTV Cameras</strong> found within {geofenceRadius}m radius!
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}



      {/* Floating Bottom Legend */}
      <div className="glass-panel gis-map-legend" style={{
        position: 'absolute',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 900,
        padding: '0.6rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        fontSize: '0.75rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
          <span><strong>Public CCTV</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#a855f7', display: 'inline-block' }}></span>
          <span><strong>Private CCTV</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
          <span><strong>Incident Alert</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: '0', height: '0', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '12px solid rgba(6, 182, 212, 0.5)' }}></div>
          <span>FOV Cone</span>
        </div>
      </div>

    </div>
  );
};

