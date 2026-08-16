import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { CctvCamera, IncidentReport } from '../types/cctv';

// Helper mappers for Cameras
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapDbToCamera = (row: any): CctvCamera => ({
  id: row.id,
  name: row.name,
  ownership: row.ownership,
  status: row.status,
  type: row.type,
  resolution: row.resolution,
  lat: Number(row.lat),
  lng: Number(row.lng),
  address: row.address,
  district: row.district,
  azimuth: Number(row.azimuth || 0),
  fovAngle: Number(row.fov_angle || 90),
  fovDistance: Number(row.fov_distance || 80),
  nightVision: Boolean(row.night_vision),
  ptzCapable: Boolean(row.ptz_capable),
  storageRetentionDays: Number(row.storage_retention_days || 30),
  ipRtspStreamUrl: row.ip_rtsp_stream_url || undefined,
  registeredDate: row.registered_date || new Date().toISOString().split('T')[0],
  lastMaintenanceDate: row.last_maintenance_date || undefined,
  ownerName: row.owner_name,
  ownerContact: row.owner_contact || undefined,
  ownerEmail: row.owner_email || undefined,
  consentLawEnforcement: Boolean(row.consent_law_enforcement),
  department: row.department || undefined,
  badgeId: row.badge_id || undefined,
  lastActiveTimestamp: row.last_active_timestamp || undefined,
  approvalStatus: row.approval_status || 'approved',
  fps: Number(row.fps || 30),
});

export const mapCameraToDb = (camera: CctvCamera) => ({
  id: camera.id,
  name: camera.name,
  ownership: camera.ownership,
  status: camera.status,
  approval_status: camera.approvalStatus || 'approved',
  type: camera.type,
  resolution: camera.resolution,
  lat: camera.lat,
  lng: camera.lng,
  address: camera.address,
  district: camera.district,
  azimuth: camera.azimuth,
  fov_angle: camera.fovAngle,
  fov_distance: camera.fovDistance,
  night_vision: camera.nightVision,
  ptz_capable: camera.ptzCapable,
  storage_retention_days: camera.storageRetentionDays,
  ip_rtsp_stream_url: camera.ipRtspStreamUrl || null,
  registered_date: camera.registeredDate,
  last_maintenance_date: camera.lastMaintenanceDate || null,
  owner_name: camera.ownerName,
  owner_contact: camera.ownerContact || null,
  owner_email: camera.ownerEmail || null,
  consent_law_enforcement: camera.consentLawEnforcement,
  department: camera.department || null,
  badge_id: camera.badgeId || null,
  last_active_timestamp: camera.lastActiveTimestamp || null,
  fps: camera.fps || 30,
});

// Helper mappers for Incidents
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapDbToIncident = (row: any): IncidentReport => ({
  id: row.id,
  title: row.title,
  description: row.description,
  type: row.type,
  severity: row.severity,
  status: row.status,
  lat: Number(row.lat),
  lng: Number(row.lng),
  address: row.address,
  district: row.district,
  reportedAt: row.reported_at,
  reportedBy: row.reported_by,
  nearbyCameraIds: row.nearby_camera_ids || [],
});

export const mapIncidentToDb = (incident: IncidentReport) => ({
  id: incident.id,
  title: incident.title,
  description: incident.description,
  type: incident.type,
  severity: incident.severity,
  status: incident.status,
  lat: incident.lat,
  lng: incident.lng,
  address: incident.address,
  district: incident.district,
  reported_at: incident.reportedAt,
  reported_by: incident.reportedBy,
  nearby_camera_ids: incident.nearbyCameraIds,
});

// Connection verification helper
export const checkSupabaseConnection = async (): Promise<{ connected: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { connected: false, error: 'Supabase env variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing or default placeholders.' };
  }
  try {
    const { error } = await supabase.from('cameras').select('id', { head: true, count: 'exact' });
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err: any) {
    return { connected: false, error: err?.message || 'Failed to connect to Supabase database' };
  }
};

// Service API
export const cctvService = {
  async fetchCameras(): Promise<CctvCamera[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('cameras').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Error fetching cameras from Supabase:', error.message);
      return [];
    }
    return (data || []).map(mapDbToCamera);
  },

  async insertCamera(camera: CctvCamera): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }
    const { error } = await supabase.from('cameras').upsert(mapCameraToDb(camera));
    if (error) {
      console.error('Error inserting camera into Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  async updateCamera(id: string, updates: Partial<CctvCamera>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.approvalStatus !== undefined) dbUpdates.approval_status = updates.approvalStatus;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.resolution !== undefined) dbUpdates.resolution = updates.resolution;
    if (updates.lat !== undefined) dbUpdates.lat = updates.lat;
    if (updates.lng !== undefined) dbUpdates.lng = updates.lng;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.district !== undefined) dbUpdates.district = updates.district;
    if (updates.azimuth !== undefined) dbUpdates.azimuth = updates.azimuth;
    if (updates.fovAngle !== undefined) dbUpdates.fov_angle = updates.fovAngle;
    if (updates.fovDistance !== undefined) dbUpdates.fov_distance = updates.fovDistance;
    if (updates.nightVision !== undefined) dbUpdates.night_vision = updates.nightVision;
    if (updates.ptzCapable !== undefined) dbUpdates.ptz_capable = updates.ptzCapable;
    if (updates.storageRetentionDays !== undefined) dbUpdates.storage_retention_days = updates.storageRetentionDays;
    if (updates.ipRtspStreamUrl !== undefined) dbUpdates.ip_rtsp_stream_url = updates.ipRtspStreamUrl;
    if (updates.ownerName !== undefined) dbUpdates.owner_name = updates.ownerName;
    if (updates.ownerContact !== undefined) dbUpdates.owner_contact = updates.ownerContact;
    if (updates.ownerEmail !== undefined) dbUpdates.owner_email = updates.ownerEmail;
    if (updates.consentLawEnforcement !== undefined) dbUpdates.consent_law_enforcement = updates.consentLawEnforcement;

    const { error } = await supabase.from('cameras').update(dbUpdates).eq('id', id);
    if (error) {
      console.error(`Error updating camera ${id} in Supabase:`, error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  async deleteCamera(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }
    const { error } = await supabase.from('cameras').delete().eq('id', id);
    if (error) {
      console.error(`Error deleting camera ${id} from Supabase:`, error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  async fetchIncidents(): Promise<IncidentReport[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Error fetching incidents from Supabase:', error.message);
      return [];
    }
    return (data || []).map(mapDbToIncident);
  },

  async insertIncident(incident: IncidentReport): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }
    const { error } = await supabase.from('incidents').upsert(mapIncidentToDb(incident));
    if (error) {
      console.error('Error inserting incident into Supabase:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  async updateIncidentStatus(id: string, status: IncidentReport['status']): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }
    const { error } = await supabase.from('incidents').update({ status }).eq('id', id);
    if (error) {
      console.error(`Error updating incident ${id} in Supabase:`, error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  async seedDatabase(initialCameras: CctvCamera[], initialIncidents: IncidentReport[]): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured' };
    }
    try {
      if (initialCameras.length > 0) {
        const { error: camErr } = await supabase.from('cameras').upsert(initialCameras.map(mapCameraToDb));
        if (camErr) throw camErr;
      }
      if (initialIncidents.length > 0) {
        const { error: incErr } = await supabase.from('incidents').upsert(initialIncidents.map(mapIncidentToDb));
        if (incErr) throw incErr;
      }
      return { success: true };
    } catch (err: any) {
      console.error('Failed to seed Supabase database:', err);
      return { success: false, error: err?.message || 'Failed to seed database' };
    }
  }
};
