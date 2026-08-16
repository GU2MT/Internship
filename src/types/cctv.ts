export type UserRole = 'admin' | 'private_owner' | 'public';

export type OwnershipType = 'public' | 'private';

export type CameraStatus = 'active' | 'maintenance' | 'offline';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type CameraType = 'ptz' | 'dome' | 'bullet' | 'thermal' | 'panoramic';

export type Resolution = '1080p' | '4k' | '2k' | '720p';

export interface CctvCamera {
  id: string;
  name: string;
  ownership: OwnershipType;
  status: CameraStatus;
  approvalStatus?: ApprovalStatus;
  type: CameraType;
  resolution: Resolution;
  lat: number;
  lng: number;
  address: string;
  district: string;
  azimuth: number; // Facing direction in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  fovAngle: number; // Visual cone angle in degrees (e.g. 60, 90, 120)
  fovDistance: number; // Effective distance in meters (e.g. 50, 100, 150)
  nightVision: boolean;
  ptzCapable: boolean;
  storageRetentionDays: number;
  ipRtspStreamUrl?: string;
  registeredDate: string;
  lastMaintenanceDate?: string;
  
  // Owner / Department metadata
  ownerName: string;
  ownerContact?: string;
  ownerEmail?: string;
  consentLawEnforcement: boolean;
  department?: string;
  badgeId?: string;
  
  // Stats & feed mock
  lastActiveTimestamp?: string;
  fps?: number;
}

export type IncidentType = 
  | 'burglary' 
  | 'vandalism' 
  | 'traffic_accident' 
  | 'suspicious_activity' 
  | 'assault' 
  | 'missing_person' 
  | 'other';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  badgeId?: string;
  organization?: string;
}

export type IncidentStatus = 'submitted' | 'under_investigation' | 'footage_requested' | 'resolved';

export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  lat: number;
  lng: number;
  address: string;
  reportedAt: string;
  reportedBy: string;
  nearbyCameraIds: string[];
  district: string;
  reporterRole?: UserRole;
  isAnonymous?: boolean;
}



export interface FilterOptions {
  ownership: 'all' | 'public' | 'private';
  status: 'all' | 'active' | 'maintenance' | 'offline';
  type: 'all' | CameraType;
  search: string;
  district: string;
  radiusKm?: number;
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
  activeLayer: 'dark' | 'streets' | 'satellite' | 'heatmap';
  showFovCones: boolean;
  geofenceRadiusMeters: number | null;
  geofenceCenter: [number, number] | null;
}
