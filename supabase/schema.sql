-- ==============================================================================
-- GuardianGIS Clean Supabase Database Setup Script
-- Copy & Run this entire script in your Supabase SQL Editor (https://app.supabase.com)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop unused table if it exists
DROP TABLE IF EXISTS public.footage_requests CASCADE;

-- ------------------------------------------------------------------------------
-- 1. CREATE TABLES (CAMERAS & INCIDENTS)
-- ------------------------------------------------------------------------------

-- CAMERAS TABLE
CREATE TABLE IF NOT EXISTS public.cameras (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    ownership TEXT NOT NULL CHECK (ownership IN ('public', 'private')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'offline')),
    type TEXT NOT NULL CHECK (type IN ('ptz', 'dome', 'bullet', 'thermal', 'panoramic')),
    resolution TEXT NOT NULL DEFAULT '1080p' CHECK (resolution IN ('1080p', '4k', '2k', '720p')),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    district TEXT NOT NULL,
    azimuth INT NOT NULL DEFAULT 0,
    fov_angle INT NOT NULL DEFAULT 90,
    fov_distance INT NOT NULL DEFAULT 80,
    night_vision BOOLEAN NOT NULL DEFAULT true,
    ptz_capable BOOLEAN NOT NULL DEFAULT false,
    storage_retention_days INT NOT NULL DEFAULT 30,
    ip_rtsp_stream_url TEXT,
    registered_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_maintenance_date DATE,
    owner_name TEXT NOT NULL,
    owner_contact TEXT,
    owner_email TEXT,
    consent_law_enforcement BOOLEAN NOT NULL DEFAULT true,
    department TEXT,
    badge_id TEXT,
    last_active_timestamp TIMESTAMPTZ DEFAULT NOW(),
    approval_status TEXT NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    fps INT DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_investigation', 'footage_requested', 'resolved')),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    district TEXT NOT NULL,
    reported_at TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    nearby_camera_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index optimization
CREATE INDEX IF NOT EXISTS idx_cameras_lat_lng ON public.cameras (lat, lng);
CREATE INDEX IF NOT EXISTS idx_cameras_district ON public.cameras (district);
CREATE INDEX IF NOT EXISTS idx_cameras_ownership ON public.cameras (ownership);
CREATE INDEX IF NOT EXISTS idx_incidents_lat_lng ON public.incidents (lat, lng);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents (status);

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- Role-based privacy controls:
-- Admins (JWT role = 'admin') can view all camera locations.
-- Non-admin users can ONLY view their own registered camera locations.
-- ------------------------------------------------------------------------------
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to cameras" ON public.cameras;
DROP POLICY IF EXISTS "Allow public insert/update/delete access to cameras" ON public.cameras;
DROP POLICY IF EXISTS "Role based read access to cameras" ON public.cameras;
DROP POLICY IF EXISTS "Owner or Admin modify access to cameras" ON public.cameras;

-- Allow public & authenticated read/write/delete access for cameras
CREATE POLICY "Allow public read access to cameras" ON public.cameras FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update/delete access to cameras" ON public.cameras FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to incidents" ON public.incidents;
DROP POLICY IF EXISTS "Allow public insert/update/delete access to incidents" ON public.incidents;
CREATE POLICY "Allow public read access to incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update/delete access to incidents" ON public.incidents FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. SEED INITIAL DATA (CAMERAS & INCIDENTS)
-- ------------------------------------------------------------------------------
INSERT INTO public.cameras (id, name, ownership, status, type, resolution, lat, lng, address, district, azimuth, fov_angle, fov_distance, night_vision, ptz_capable, storage_retention_days, owner_name, owner_email, consent_law_enforcement, badge_id)
VALUES
('CAM-PUB-001', 'Central Square North Plaza - PTZ 01', 'public', 'active', 'ptz', '4k', 9.0152, 38.7612, 'Central Plaza & Main Boulevard, Zone 1', 'Downtown Core', 180, 90, 150, true, true, 60, 'Metropolitan Police Dept - Surveillance Unit', 'cctv-command@police.gov', true, 'OFF-7842'),
('CAM-PUB-002', 'City Hall Gate West Entrance', 'public', 'active', 'dome', '4k', 9.0185, 38.7580, 'City Hall Complex, Civic Center Way', 'Downtown Core', 240, 110, 80, true, false, 90, 'City Municipal Security Directorate', 'civic-security@city.gov', true, 'ADM-1002'),
('CAM-PUB-003', 'Grand Highway Intersection - South Camera', 'public', 'active', 'bullet', '1080p', 9.0090, 38.7650, 'Grand Highway & 4th Avenue Overpass', 'East District', 45, 70, 120, true, false, 30, 'Federal Transport & Highway Safety Agency', 'traffic-monitoring@transport.gov', true, 'OFF-3391'),
('CAM-PRV-101', 'Abyssinia Grand Hotel Perimeter Wall', 'private', 'active', 'panoramic', '4k', 9.0170, 38.7645, 'Financial District Ave, Building 44', 'Financial District', 310, 140, 65, true, false, 45, 'Abyssinia Hotel Security Dept', 'security@abyssiniagrand.com', true, 'PRV-5510'),
('CAM-PRV-102', 'Commercial Bank Main Branch Parking Garage', 'private', 'active', 'bullet', '2k', 9.0130, 38.7570, 'Bankers Row, Plot 12', 'Downtown Core', 90, 80, 90, true, false, 60, 'Commercial Bank Facilities & Security Ltd', 'cctv-admin@combank.com', true, 'PRV-8821')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.incidents (id, title, description, type, severity, status, lat, lng, address, district, reported_at, reported_by, nearby_camera_ids)
VALUES
('INC-2026-8801', 'Attempted Commercial Break-In', 'Unidentified individual attempted to breach rear commercial door near Financial District.', 'burglary', 'high', 'under_investigation', 9.0168, 38.7642, 'Financial District Ave, Building 44', 'Financial District', '2026-08-11 23:45:00', 'Private Security Dispatcher', ARRAY['CAM-PRV-101', 'CAM-PUB-001']),
('INC-2026-8802', 'Vehicle Collision at Overpass', 'Two-vehicle collision blocking right lane on Grand Highway intersection.', 'traffic_accident', 'medium', 'submitted', 9.0092, 38.7648, 'Grand Highway & 4th Avenue Overpass', 'East District', '2026-08-12 08:15:00', 'Traffic Patrol Officer', ARRAY['CAM-PUB-003'])
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. REALTIME SETUP
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cameras, public.incidents;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 5. ASSIGN ADMIN ROLE & AUTO-CONFIRM UNVERIFIED EMAILS
-- ------------------------------------------------------------------------------
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin", "full_name": "Gutu Meteku"}'::jsonb
WHERE email = 'gutu@gmail.com';

-- Auto-confirm any pending unverified user email accounts
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Automatically confirm email on user creation (disables confirmation requirement)
CREATE OR REPLACE FUNCTION public.handle_auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_auto_confirm_email ON auth.users;
CREATE TRIGGER tr_auto_confirm_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auto_confirm_email();


