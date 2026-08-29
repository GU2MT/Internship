import React, { useState } from 'react';
import { useCctv } from '../context/CctvContext';
import { useLanguage } from '../context/LanguageContext';
import type { OwnershipType, CameraType, Resolution, CameraStatus } from '../types/cctv';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  MapPin, 
  Compass, 
  Sliders, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Camera,
  Globe,
  Database
} from 'lucide-react';

export const CameraRegistrationForm: React.FC = () => {
  const { addCamera, setSelectedCamera, userRole, dbConnectionStatus, currentUser } = useCctv();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [ownership, setOwnership] = useState<OwnershipType>(userRole === 'private_owner' ? 'private' : 'public');
  const [name, setName] = useState('');
  const [status] = useState<CameraStatus>('active');
  const [type, setType] = useState<CameraType>('dome');
  const [resolution, setResolution] = useState<Resolution>('4k');
  
  // Location & FOV
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Downtown Core');
  const [lat, setLat] = useState<number>(9.0150);
  const [lng, setLng] = useState<number>(38.7600);
  const [azimuth, setAzimuth] = useState<number>(180);
  const [fovAngle, setFovAngle] = useState<number>(90);
  const [fovDistance, setFovDistance] = useState<number>(80);

  // Specs & Owner Metadata
  const [nightVision, setNightVision] = useState(true);
  const [ptzCapable, setPtzCapable] = useState(false);
  const [storageRetentionDays, setStorageRetentionDays] = useState<number>(30);
  const [ipRtspStreamUrl, setIpRtspStreamUrl] = useState('');
  
  const [ownerName, setOwnerName] = useState(() => currentUser?.name || (userRole === 'admin' ? 'Metropolitan Police Dept' : ''));
  const [ownerContact, setOwnerContact] = useState('');
  const [ownerEmail, setOwnerEmail] = useState(() => currentUser?.email || '');
  const [consentLawEnforcement, setConsentLawEnforcement] = useState(true);
  const [department] = useState('');
  const [badgeId, setBadgeId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !address || !ownerName) {
      alert(t('alert_fill_required') || 'Please complete all required fields.');
      return;
    }

    const created = addCamera({
      name,
      ownership,
      status,
      type,
      resolution,
      lat: Number(lat),
      lng: Number(lng),
      address,
      district,
      azimuth: Number(azimuth),
      fovAngle: Number(fovAngle),
      fovDistance: Number(fovDistance),
      nightVision,
      ptzCapable,
      storageRetentionDays: Number(storageRetentionDays),
      ipRtspStreamUrl: ipRtspStreamUrl || undefined,
      ownerName,
      ownerContact: ownerContact || undefined,
      ownerEmail: ownerEmail || undefined,
      consentLawEnforcement,
      department: department || undefined,
      badgeId: badgeId || undefined,
    });

    setSelectedCamera(created);
    navigate('/map');
  };

  // Preset location quick selection
  const handleSelectPresetLoc = (presetLat: number, presetLng: number, presetAddress: string, presetDistrict: string) => {
    setLat(presetLat);
    setLng(presetLng);
    setAddress(presetAddress);
    setDistrict(presetDistrict);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', padding: '0 1rem' }}>
      
      {/* Container Panel */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <span className="badge badge-public" style={{ marginBottom: '0.4rem' }}>
              {t('online_transition')}
            </span>
            <h2 style={{ fontSize: '1.5rem', background: 'linear-gradient(90deg, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t('registration_title')}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('registration_subtitle')}
            </p>
          </div>

          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={24} color="var(--primary-blue)" />
          </div>
        </div>

        {/* Database Storage Target Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          background: dbConnectionStatus === 'connected' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${dbConnectionStatus === 'connected' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          color: dbConnectionStatus === 'connected' ? '#34d399' : '#fbbf24',
          fontSize: '0.82rem'
        }}>
          <Database size={18} />
          <div>
            <strong>{t('storage_target')}: </strong>
            {dbConnectionStatus === 'connected' ? (
              <span>{t('db_supabase_connected')}</span>
            ) : (
              <span>{t('db_local_fallback')}</span>
            )}
          </div>
        </div>

        {/* Wizard Step Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', background: 'rgba(11, 15, 25, 0.6)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= 1 ? 1 : 0.4 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: step === 1 ? 'var(--primary-blue)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>1</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('step1_title')}</span>
          </div>
          <ArrowRight size={16} color="var(--text-dim)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= 2 ? 1 : 0.4 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: step === 2 ? 'var(--primary-blue)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>2</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('step2_title')}</span>
          </div>
          <ArrowRight size={16} color="var(--text-dim)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= 3 ? 1 : 0.4 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: step === 3 ? 'var(--primary-blue)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>3</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('step3_title')}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: Ownership & Entity Information */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary-cyan)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={18} /> {t('step1_header')}
              </h3>

              {/* Ownership Type Selection Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div 
                  onClick={() => setOwnership('public')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: ownership === 'public' ? '2px solid var(--public-color)' : '1px solid var(--border-color)',
                    background: ownership === 'public' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Shield size={20} color="#3b82f6" />
                    <strong style={{ fontSize: '1rem', color: '#93c5fd' }}>{t('public_camera')}</strong>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {t('public_camera_desc')}
                  </p>
                </div>

                <div 
                  onClick={() => setOwnership('private')}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: ownership === 'private' ? '2px solid var(--private-color)' : '1px solid var(--border-color)',
                    background: ownership === 'private' ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Globe size={20} color="#a855f7" />
                    <strong style={{ fontSize: '1rem', color: '#d8b4fe' }}>{t('private_camera')}</strong>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {t('private_camera_desc')}
                  </p>
                </div>
              </div>

              {/* Input Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">{t('camera_name')}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Grand Hotel Main Gate Cam 01, City Square North PTZ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('owner_org_name')}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Police Dept, Grand Hotel Ltd, Ato Dawit"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('emergency_phone')}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="+251 91 000 0000"
                    value={ownerContact}
                    onChange={(e) => setOwnerContact(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('contact_email')}</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="security@organization.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                  />
                </div>

                {ownership === 'public' && (
                  <div className="form-group">
                    <label className="form-label">{t('badge_id')}</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. OFF-8820"
                      value={badgeId}
                      onChange={(e) => setBadgeId(e.target.value)}
                    />
                  </div>
                )}

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <input 
                      type="checkbox" 
                      checked={consentLawEnforcement}
                      onChange={(e) => setConsentLawEnforcement(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary-blue)' }}
                    />
                    <span>{t('consent_label')}</span>
                  </label>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                  {t('next_step_gis')} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: GIS Location & Field of View */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary-cyan)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} /> {t('step2_title')}
              </h3>

              {/* Quick Preset Location Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">{t('preset_label')}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleSelectPresetLoc(9.0152, 38.7612, 'Central Square Plaza & Main Blvd', 'Downtown Core')}
                  >
                    📍 {t('downtown_preset')}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleSelectPresetLoc(9.0205, 38.7655, '77 Financial Expressway, Tower Gate', 'Financial District')}
                  >
                    📍 {t('financial_preset')}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleSelectPresetLoc(9.0090, 38.7650, 'Grand Highway & 4th Ave Overpass', 'East District')}
                  >
                    📍 {t('east_preset')}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">{t('address_label')}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. 104 Hotel Avenue, Commercial Arcade Gate 2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('district_label')}</label>
                  <select 
                    className="form-select"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    <option value="Downtown Core">Downtown Core</option>
                    <option value="Financial District">Financial District</option>
                    <option value="East District">East District</option>
                    <option value="North District">North District</option>
                    <option value="South District">South District</option>
                    <option value="West District">West District</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('latitude')}</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    className="form-input" 
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('longitude')}</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    className="form-input" 
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    required
                  />
                </div>

                {/* Compass Azimuth Slider */}
                <div className="form-group" style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Compass size={16} color="var(--primary-cyan)" /> {t('facing_direction')}: <strong>{azimuth}°</strong>
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {azimuth === 0 ? 'North (0°)' : azimuth === 90 ? 'East (90°)' : azimuth === 180 ? 'South (180°)' : azimuth === 270 ? 'West (270°)' : `${azimuth}°`}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={360} 
                    step={5}
                    value={azimuth}
                    onChange={(e) => setAzimuth(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                {/* FOV Angle & Distance */}
                <div className="form-group">
                  <label className="form-label">{t('fov_angle')}: {fovAngle}°</label>
                  <input 
                    type="range" 
                    min={30} 
                    max={180} 
                    step={5}
                    value={fovAngle}
                    onChange={(e) => setFovAngle(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('coverage_distance')}: {fovDistance} {t('meters')}</label>
                  <input 
                    type="range" 
                    min={20} 
                    max={300} 
                    step={10}
                    value={fovDistance}
                    onChange={(e) => setFovDistance(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> {t('back')}
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
                  {t('next_step_hardware')} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Hardware Specifications */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary-cyan)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={18} /> {t('step3_title')}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                
                <div className="form-group">
                  <label className="form-label">{t('camera_type')}</label>
                  <select 
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value as CameraType)}
                  >
                    <option value="dome">Dome Camera (Indoor/Outdoor)</option>
                    <option value="bullet">Bullet Camera (Long Range Directional)</option>
                    <option value="ptz">PTZ (Pan-Tilt-Zoom Motorized)</option>
                    <option value="thermal">Thermal / Infrared Sensor</option>
                    <option value="panoramic">360° Panoramic Fisheye</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('resolution')}</label>
                  <select 
                    className="form-select"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as Resolution)}
                  >
                    <option value="4k">4K Ultra HD (2160p)</option>
                    <option value="2k">2K Quad HD (1440p)</option>
                    <option value="1080p">Full HD (1080p)</option>
                    <option value="720p">Standard HD (720p)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('retention')}</label>
                  <input 
                    type="number" 
                    min={7} 
                    max={365}
                    className="form-input" 
                    value={storageRetentionDays}
                    onChange={(e) => setStorageRetentionDays(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('stream_url')}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="rtsp://admin:pass@192.168.1.100:554/live"
                    value={ipRtspStreamUrl}
                    onChange={(e) => setIpRtspStreamUrl(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', gap: '2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={nightVision}
                      onChange={(e) => setNightVision(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>{t('night_vision')}</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={ptzCapable}
                      onChange={(e) => setPtzCapable(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>{t('ptz_control')}</span>
                  </label>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} /> {t('back')}
                </button>
                
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                  <CheckCircle2 size={18} /> {t('complete_registration')}
                </button>
              </div>

            </div>
          )}

        </form>

      </div>
    </div>
  );
};
