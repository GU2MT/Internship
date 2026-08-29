import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'am' | 'om';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Common
    hub_version: 'CCTV HUB V2.5',
    connected_supabase: 'SUPABASE LIVE',
    local_db: 'LOCAL DB',
    tagline: 'Public & Private CCTV Registration, Reporting & GIS System',
    gis_map_view: 'GIS Map View',
    register_camera: 'Register Camera',
    incident_log: 'Incident Log',
    approvals: 'Approvals',
    analytics: 'Analytics',
    public: 'Public',
    private: 'Private',
    sign_in: 'Sign In',
    logout: 'Logout',
    logout_success_msg: 'Signed out successfully.',
    access_restricted: 'Access Restricted: Please sign in as Law Enforcement or Private Owner.',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save Changes',
    loading: 'Loading...',

    // Camera Registration Page
    reg_title: 'Register CCTV Camera',
    reg_subtitle: 'Add public or private surveillance node to the GIS tracking network.',
    camera_name: 'Camera Name / Identifier',
    camera_type: 'Camera Type',
    ownership: 'Ownership Type',
    resolution: 'Resolution',
    coverage_angle: 'FOV Angle (°)',
    status_label: 'Operational Status',
    latitude: 'Latitude',
    longitude: 'Longitude',
    address: 'Physical Address / Landmark',
    stream_url: 'RTSP / Stream URL (Optional)',
    submit_camera: 'Register Camera Node',

    // Incident Log Page
    incident_title: 'Security Incident Log',
    incident_subtitle: 'Track, view, and report safety events mapped to CCTV coverage.',
    report_incident: 'Report Incident',
    incident_type: 'Incident Type',
    severity: 'Severity Level',
    reported_at: 'Reported At',
    status: 'Status',
    actions: 'Actions',

    // Moderation & Analytics Page
    pending_approvals: 'Pending Camera Registrations',
    analytics_overview: 'GIS Analytics & System Overview',
    total_cameras: 'Total Registered Cameras',
    active_incidents: 'Active Incidents',
    system_health: 'System Operational Status',

    // Wizard Registration Form Specific Keys
    online_transition: 'ONLINE TRANSITION',
    registration_title: 'CCTV Node Registration Wizard',
    registration_subtitle: 'Register public or private surveillance assets into the regional GIS tracking grid.',
    storage_target: 'Storage Target',
    db_supabase_connected: 'Registered cameras will be persisted directly to Supabase PostgreSQL Database (Table: cameras) with Realtime broadcast.',
    db_local_fallback: 'Supabase environment unconfigured. Cameras will be stored in Local Storage Fallback.',
    step1_title: 'Ownership & Entity',
    step2_title: 'GIS Location & FOV',
    step3_title: 'Hardware Specs',
    step1_header: 'Entity Ownership & Contact Details',
    public_camera: 'Public Asset',
    public_camera_desc: 'Owned by Municipal Police, Traffic, or City Administration.',
    private_camera: 'Private Asset',
    private_camera_desc: 'Owned by Private Business, Bank, Residence, or Commercial.',
    owner_org_name: 'Owner / Organization Name',
    emergency_phone: 'Emergency Contact Phone',
    contact_email: 'Contact Email Address',
    badge_id: 'Officer Badge ID / Dept Code',
    consent_label: 'I consent to emergency video access by Law Enforcement during critical safety incidents.',
    next_step_gis: 'Next: GIS Location',
    preset_label: 'Quick Location Presets:',
    downtown_preset: 'Downtown Plaza',
    financial_preset: 'Financial Center',
    east_preset: 'East Highway',
    address_label: 'Street Address / Landmark',
    district_label: 'District Zone',
    facing_direction: 'Facing Azimuth Direction',
    fov_angle: 'FOV Angle Width',
    coverage_distance: 'Coverage Distance',
    meters: 'meters',
    back: 'Back',
    next_step_hardware: 'Next: Hardware Specs',
    retention: 'Storage Retention (Days)',
    night_vision: 'Night Vision / IR Support',
    ptz_control: 'Motorized PTZ Capable',
    complete_registration: 'Complete Camera Registration',
    alert_fill_required: 'Please complete all required fields.'
  },
  am: {
    // Header & Common
    hub_version: 'ሲሲቲቪ ሀብ V2.5',
    connected_supabase: 'ሱፓቤዝ ኦንላይን',
    local_db: 'የአካባቢ ደታቤዝ',
    tagline: 'የሕዝብ እና የግል CCTV ምዝገባ፣ ሪፖርት እና GIS ሥርዓት',
    gis_map_view: 'የGIS ካርታ እይታ',
    register_camera: 'ካሜራ መመዝገቢያ',
    incident_log: 'የችግሮች መዝገብ',
    approvals: 'ፈቃዶች',
    analytics: 'ስታቲስቲክስ',
    public: 'የሕዝብ',
    private: 'የግል',
    sign_in: 'ይግቡ',
    logout: 'ውጣ',
    logout_success_msg: 'በስኬት ወጥተዋል።',
    access_restricted: 'መግባት ተከለክሏል፡ እባክዎን እንደ ሕግ አስከባሪ ወይም የግል ባለቤት ይግቡ።',
    close: 'ዝጋ',
    cancel: 'ሰርዝ',
    save: 'ለውጦችን አስቀምጥ',
    loading: 'በመጫን ላይ...',

    // Camera Registration Page
    reg_title: 'አዲስ የሲሲቲቪ ካሜራ መመዝገቢያ',
    reg_subtitle: 'የሕዝብ ወይም የግል የደህንነት ካሜራ ወደ GIS መከታተያ አውታረ መረብ ያስገቡ።',
    camera_name: 'የካሜራው ስም / መለያ',
    camera_type: 'የካሜራ ዓይነት',
    ownership: 'የባለቤትነት ዓይነት',
    resolution: 'የምስል ጥራት (Resolution)',
    coverage_angle: 'የዕይታ ማዕዘን (°)',
    status_label: 'የሥራ ሁኔታ',
    latitude: 'ላቲቲዩድ (Latitude)',
    longitude: 'ሎንጊቲዩድ (Longitude)',
    address: 'የተተከለበት አድራሻ / ምልክት',
    stream_url: 'የቀጥታ ስርጭት ዩአርኤል (አማራጭ)',
    submit_camera: 'ካሜራውን መዝግብ',

    // Incident Log Page
    incident_title: 'የደህንነት ችግሮች መዝገብ',
    incident_subtitle: 'ከሲሲቲቪ ሽፋን ጋር የተያያዙ አደጋዎችን ይከታተሉ እና ሪፖርት ያድርጉ።',
    report_incident: 'አደጋ ሪፖርት ያድርጉ',
    incident_type: 'የችግሩ ዓይነት',
    severity: 'የአደጋው ደረጃ',
    reported_at: 'ሪፖርት የተደረገበት ጊዜ',
    status: 'ሁኔታ',
    actions: 'እርምጃዎች',

    // Moderation & Analytics Page
    pending_approvals: 'ማረጋገጫ የሚጠብቁ የካሜራ ምዝገባዎች',
    analytics_overview: 'የGIS ስታቲስቲክስ እና የሲስተሙ አጠቃላይ እይታ',
    total_cameras: 'ጠቅላላ የተመዘገቡ ካሜራዎች',
    active_incidents: 'በሂደት ላይ ያሉ ችግሮች',
    system_health: 'የሲስተሙ የሥራ ሁኔታ',

    // Wizard Registration Form Specific Keys
    online_transition: 'የቀጥታ ስርጭት ስርዓት',
    registration_title: 'የሲሲቲቪ ካሜራ መመዝገቢያ ቅጽ',
    registration_subtitle: 'የሕዝብ ወይም የግል የደህንነት ካሜራዎችን ወደ ክልላዊ የGIS መከታተያ አውታረ መረብ ያስገቡ።',
    storage_target: 'የመረጃ ቋት አቅጣጫ',
    db_supabase_connected: 'የተመዘገቡ ካሜራዎች በቀጥታ ወደ ሱፓቤዝ (Supabase PostgreSQL) ደታቤዝ ይገባሉ።',
    db_local_fallback: 'የሱፓቤዝ ግንኙነት የለም። መረጃው በአካባቢው ማከማቻ (Local Storage) ላይ ይያዛል።',
    step1_title: 'ባለቤትነት እና መረጃ',
    step2_title: 'የGIS ቦታ እና ዕይታ',
    step3_title: 'የካሜራው ስፔሲፊኬሽን',
    step1_header: 'የባለቤትነት ዓይነት እና የእውቂያ መረጃ',
    public_camera: 'የሕዝብ ካሜራ',
    public_camera_desc: 'በከተማ አስተዳደር ወይም በፖሊስ የሚስተዳደር።',
    private_camera: 'የግል ካሜራ',
    private_camera_desc: 'በግል ድርጅቶች፣ ባንኮች ወይም መኖሪያ ቤቶች የሚተከል፡',
    owner_org_name: 'የባለቤቱ / የድርጅቱ ስም',
    emergency_phone: 'የአደጋ ጊዜ ስልክ ቁጥር',
    contact_email: 'የኢሜይል አድራሻ',
    badge_id: 'የባለሙያ መለያ ቁጥር (Badge ID)',
    consent_label: 'በአደጋ ጊዜ ሕግ አስከባሪዎች የቀጥታ ምስል እንዲመለከቱ ፈቃደኛ ነኝ።',
    next_step_gis: 'ቀጣይ፡ የGIS ቦታ',
    preset_label: 'የተዘጋጁ የቦታ አማራጮች፡',
    downtown_preset: 'ከተማ ማዕከል',
    financial_preset: 'የፋይናንስ ማዕከል',
    east_preset: 'ምስራቅ አውራ ጐዳና',
    address_label: 'የተተከለበት አድራሻ / ምልክት',
    district_label: 'የአካባቢ ዞን',
    facing_direction: 'የተቃጣበት አቅጣጫ (Azimuth)',
    fov_angle: 'የዕይታ ስፋት ማዕዘን',
    coverage_distance: 'የዕይታ ርቀት',
    meters: 'ሜትር',
    back: 'ተመለስ',
    next_step_hardware: 'ቀጣይ፡ የካሜራ ስፔሲፊኬሽን',
    retention: 'ምስል የሚያዝበት ቀን (Retention)',
    night_vision: 'የሌሊት እይታ (IR Night Vision)',
    ptz_control: 'በሩቅ የሚዞር (PTZ Control)',
    complete_registration: 'ምዝገባውን አጠናቅቅ',
    alert_fill_required: 'እባክዎን አስፈላጊ የሆኑትን መረጃዎች በሙሉ ይሙሉ ።'
  },
  om: {
    // Header & Common
    hub_version: 'CCTV HUB V2.5',
    connected_supabase: 'SUPABASE LIVE',
    local_db: 'DATABASE NAANNOO',
    tagline: 'Galmee CCTV Uummataa fi Dhuunfaa, Gabaasaa fi Sirna GIS',
    gis_map_view: 'Mullata Kaarta GIS',
    register_camera: 'Kameraa Galmeessi',
    incident_log: 'Galmee Taateewwanii',
    approvals: 'Eeyyami',
    analytics: 'Xiinxala',
    public: 'Uummata',
    private: 'Dhuunfaa',
    sign_in: 'Seenaa',
    logout: 'Ba\'i',
    logout_success_msg: 'Milkaa\'inaan baatanii jirtu.',
    access_restricted: 'Dhorkameera: Maaloo akka Seera kabachiisaatti ykn Abbaa dhuunfaatti seenaa.',
    close: 'Cufi',
    cancel: 'Dhiisi',
    save: 'Jijjiirama Galmeessi',
    loading: 'Fe\'amaa Jira...',

    // Camera Registration Page
    reg_title: 'Kameraa CCTV Haaraa Galmeessi',
    reg_subtitle: 'Kameraa eegumsa uummataa ykn dhuunfaa sirna GIS keessatti dabali.',
    camera_name: 'Maqaa Kameraa / Adda Baasaa',
    camera_type: 'Gosa Kameraa',
    ownership: 'Gosa Abbummaa',
    resolution: 'Qulqullina Muldhataa',
    coverage_angle: 'Kofa Muldhataa (°)',
    status_label: 'Haala Hojii',
    latitude: 'Latiitiyuudii',
    longitude: 'Longitiyuudii',
    address: 'Teessoo / Agarsiistuu',
    stream_url: 'URL Stream Kallattii (Filannoo)',
    submit_camera: 'Kameraa Galmeessi',

    // Incident Log Page
    incident_title: 'Galmee Taateewwan Nageenyaa',
    incident_subtitle: 'Taateewwan nageenyaa haguuggii CCTV waliin walqabatan hordofi.',
    report_incident: 'Taatee Gabaasi',
    incident_type: 'Gosa Taatee',
    severity: 'Sadarkaa Ulfaatinaa',
    reported_at: 'Yeroo Gabaafame',
    status: 'Haala',
    actions: 'Tarkaanfiilee',

    // Moderation & Analytics Page
    pending_approvals: 'Galmee Kameraa Eeyyama Eeggatan',
    analytics_overview: 'Xiinxala GIS fi Haala Sirnaa Waliigalaa',
    total_cameras: 'Ida\'ama Kameraawwan Galmeeffamani',
    active_incidents: 'Taateewwan Hojii Irra Jiran',
    system_health: 'Haala Hojii Sirnaa',

    // Wizard Registration Form Specific Keys
    online_transition: 'SIRNA KALLATTII',
    registration_title: 'Galmee Kameraa CCTV',
    registration_subtitle: 'Kameraa eegumsa uummataa ykn dhuunfaa sirna GIS keessatti galmeessi.',
    storage_target: 'Kaayyoo Kuusaa',
    db_supabase_connected: 'Kameraawwan galmeeffaman kallattiin gara Database Supabase PostgreSQL ti ergamu.',
    db_local_fallback: 'Supabase hin qconfigured gahiin. Kuusaa Naannoo (Local Storage) keessatti kuufama.',
    step1_title: 'Abbummaa & Odeeffannoo',
    step2_title: 'Bakka GIS & Muldhata',
    step3_title: 'Gosa & Amala Kameraa',
    step1_header: 'Gosa Abbummaa fi Odeeffannoo Quunnamtii',
    public_camera: 'Kameraa Uummataa',
    public_camera_desc: 'Bulchiinsa Magaalaa ykn Polisitiin kan bulfamu.',
    private_camera: 'Kameraa Dhuunfaa',
    private_camera_desc: 'Dhaabbata Dhuunfaa, Baankii ykn Manneen jireenyaatiin kan dhaabbate.',
    owner_org_name: 'Maqaa Abbaa / Dhaabbataa',
    emergency_phone: 'Lakk. Bilbila Balaa TASGAABII',
    contact_email: 'Teessoo E-mail',
    badge_id: 'Lakk. Eenyummaa Hojjetaa',
    consent_label: 'Yeroo balaa uummataa seera kabachiartonni vidiyoo akka ilaalan hayyamamaadha.',
    next_step_gis: 'Kan ittiaanu: Bakka GIS',
    preset_label: 'Bakka Filannoo Ariifachiisaa:',
    downtown_preset: 'Giddugala Magaalaa',
    financial_preset: 'Giddugala Faayinaansii',
    east_preset: 'Daandii Guddaa Bahaa',
    address_label: 'Teessoo / Agarsiistuu Bakkaa',
    district_label: 'Zoonii Naannoo',
    facing_direction: 'Kallattii Kameraa (Azimuth)',
    fov_angle: 'Bal\'ina Muldhataa',
    coverage_distance: 'Fageenya Muldhataa',
    meters: 'meetira',
    back: 'Deebi\'i',
    next_step_hardware: 'Kan ittiaanu: Amala Kameraa',
    retention: 'Guyyaa Kuusaa Vidiyoo',
    night_vision: 'Muldhata Halkan (IR)',
    ptz_control: 'Naanna\'uu Kan Danda\'u (PTZ)',
    complete_registration: 'Galmee Xumuri',
    alert_fill_required: 'Maaloo odeeffannoo barbaachisoo ta\'an hunda guutaa.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
