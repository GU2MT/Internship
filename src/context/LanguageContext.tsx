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
    system_health: 'System Operational Status'
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
    system_health: 'የሲስተሙ የሥራ ሁኔታ'
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
    system_health: 'Haala Hojii Sirnaa'
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
