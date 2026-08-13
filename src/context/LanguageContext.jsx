import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  BN: {
    // Header & Nav
    portalName: 'বাংলাদেশ সুরক্ষা',
    portalSub: 'জাতীয় জরুরি নাগরিক নিরাপত্তা পোর্টাল',
    home: 'হোম',
    incidents: 'ঘটনা ও ম্যাপ',
    emergency: 'জরুরি সেবা হটলাইন',
    myReports: 'আমার রিপোর্ট',
    adminConsole: 'এডমিন কনসোল',
    reportIncident: 'রিপোর্ট করুন',
    login: 'লগইন',
    register: 'রেজিস্টার',
    profile: 'প্রোফাইল',
    logout: 'লগআউট',
    notifications: 'নোটিফিকেশন',
    themeLight: 'লাইট মোড',
    themeDark: 'ডার্ক মোড',
    langEng: 'English',
    langBangla: 'বাংলা',

    // Live Alert Ticker
    liveAlertTitle: 'বাংলাদেশ লাইভ সিকিউরিটি অ্যালার্ট:',
    liveAlertDefault: 'জাতীয় জরুরি সেবা ৯৯৯ এবং ফায়ার সার্ভিস কন্ট্রোল রুম লাইভ সংযোগ সক্রিয় রয়েছে।',
    viewLiveMap: 'লাইভ ম্যাপ দেখুন →',

    // Hero Section
    heroBadge: '২৪/৭ জাতীয় জরুরি সেবা ও নাগরিক নিরাপত্তা পোর্টাল',
    heroTitlePrefix: 'বাংলাদেশ নাগরিক সুরক্ষা ও ',
    heroTitleHighlight: 'জরুরি রিপোর্ট পোর্টাল',
    heroSubtitle: 'বাংলাদেশের যেকোনো স্থানে ঘটে যাওয়া জরুরি দুর্ঘটনা, অগ্নিকাণ্ড বা নিরাপত্তা বিষয় দ্রুত রিপোর্ট করুন এবং সরাসরি জরুরি হটলাইনে যোগাযোগ করুন।',
    btnReportNow: 'জরুরি রিপোর্ট জমা দিন',
    btnViewIncidents: 'লাইভ ম্যাপ ও রিপোর্ট দেখুন',

    // Hero Stats
    statTotal: 'মোট রিপোর্ট',
    statActive: 'চলমান ঘটনা',
    statResolved: 'সমাধানকৃত',
    statVerified: 'যাচাইকৃত',

    // Emergency Hotlines Banner
    emergencyBannerTitle: 'জাতীয় জরুরি সেবা হটলাইন (২৪/৭)',
    call999: '৯৯৯ - জাতীয় জরুরি সেবা',
    call16163: '১০৯ - নারী ও শিশু নির্যাতন প্রতিরোধ',
    call102: '১০২ - ফায়ার সার্ভিস কন্ট্রোল',
    call333: '৩৩৩ - জাতীয় তথ্য সেবা',

    // Incidents Section
    recentIncidentsTitle: 'সাম্প্রতিক নিরাপত্তা ঘটনা ও অ্যালার্ট',
    allIncidentsTitle: 'সমগ্র বাংলাদেশ ঘটনা তালিকা ও ম্যাপ',
    searchPlaceholder: 'স্থান, বিষয় বা ক্যাটাগরি অনুসন্ধান করুন...',
    filterCategory: 'ক্যাটাগরি বাছাই করুন',
    filterRisk: 'ঝুঁকির মাত্রা',
    filterStatus: 'স্ট্যাটাস',
    allCategories: 'সকল ক্যাটাগরি',
    allRisks: 'সকল ঝুঁকির মাত্রা',
    allStatuses: 'সকল স্ট্যাটাস',
    noIncidents: 'কোনো ঘটনা পাওয়া যায়নি।',

    // Categories
    catViolence: 'সহিংসতা ও অপরাধ',
    catHarassment: 'ইভটিজিং ও হয়রানি',
    catRobbery: 'ডাকাতি ও চুরি',
    catFire: 'অগ্নিকাণ্ড',
    catAccident: 'সড়ক দুর্ঘটনা',
    catFlood: 'প্রাকৃতিক দুর্যোগ',
    catInfrastructure: 'অবকাঠামো ক্ষতি',
    catCyber: 'সাইবার অপরাধ',
    catOther: 'অন্যান্য',

    // Statuses
    statusPending: 'অপেক্ষমাণ',
    statusVerified: 'যাচাইকৃত',
    statusInvestigating: 'তদন্তাধীন',
    statusResolved: 'সমাধানকৃত',
    statusRejected: 'বাতিল',

    // Report Page
    reportPageTitle: 'নতুন নিরাপত্তা ঘটনা রিপোর্ট করুন',
    reportPageSubtitle: 'সঠিক তথ্য ও ম্যাপ লোকেশন প্রদান করুন। গোপনীয়তা বজায় রেখে অথবা বেনামে রিপোর্ট করার সুযোগ রয়েছে।',
    inputTitle: 'ঘটনার সংক্ষিপ্ত শিরোনাম',
    inputCategory: 'ক্যাটাগরি',
    inputRisk: 'ঝুঁকির মাত্রা (Risk Level)',
    inputLocationName: 'স্থান / এলাকার নাম (যেমন: ধানমন্ডি, ঢাকা)',
    inputDescription: 'ঘটনার বিস্তারিত বিবরণ',
    inputAnonymous: 'বেনামে পোস্ট করতে চাই (অ্যানোনিমাস)',
    btnSubmitReport: 'রিপোর্ট সাবমিট করুন',

    // Auth
    loginTitle: 'আপনার অ্যাকাউন্টে লগইন করুন',
    registerTitle: 'নতুন নাগরিক অ্যাকাউন্ট তৈরি করুন',
    emailLabel: 'ইমেইল অ্যাড্রেস',
    passwordLabel: 'পাসওয়ার্ড',
    nameLabel: 'আপনার পূর্ণ নাম',
    phoneLabel: 'ফোন নম্বর',
    roleLabel: 'অ্যাাকাউন্ট ধরন',
    dontHaveAcc: 'অ্যাাকাউন্ট নেই? রেজিস্টার করুন',
    alreadyHaveAcc: 'অ্যাাকাউন্ট আছে? লগইন করুন',

    // Emergency Page
    emgBadge: 'বাংলাদেশে জরুরী হটলাইন ও জরুরি সেবা নম্বরসমূহ',
    emgTitle: 'জরুরি সেবা ডিরেক্টরি',
    emgSub: 'বাংলাদেশ পুলিশ, ফায়ার সার্ভিস, সরকারি হাসপাতাল, এবং অ্যাম্বুলেন্স সেবার নম্বর ও জিপিএস লোকেশন।',
    emgAddNew: 'নতুন জরুরি সার্ভিস যোগ করুন',
    emgSearchPlaceholder: 'সার্ভিসের নাম, ঠিকানা বা ফোন দিয়ে খুঁজুন...',
    emgCallHotline: 'হটলাইনে কল করুন',
    emg247: '২৪/৭ সার্ভিস সক্রিয়',
    emgHours: 'সাধারণ কার্যসময়',
    emgEdit: 'এডিট',
    emgDelete: 'মুছুন',
    emgDeleteConfirm: 'আপনি কি নিশ্চিতভাবে এই জরুরি সার্ভিসটি মুছে ফেলতে চান?',

    // Admin Panel
    adminBadge: 'সিকিউরিটি এডমিন প্যানেল',
    adminTitle: 'এডমিন এনালাইটিক্স ও রিপোর্ট কন্ট্রোল',
    adminSub: 'ডাটাবেজ থেকে সরাসরি সংগৃহীত রিয়েলটাইম ইনসিডেন্ট ম্যাট্রিক্স ও পরিসংখ্যান।',
    adminReportMgmt: 'রিপোর্ট ম্যানেজমেন্ট',
    adminUserMgmt: 'ইউজার ম্যানেজমেন্ট',
    adminBackToDash: '← ড্যাশবোর্ডে ফিরে যান',

    // Admin Incidents
    adminIncBadge: 'এডমিন রিপোর্ট কন্ট্রোল',
    adminIncTitle: 'রিপোর্ট যাচাই ও স্ট্যাটাস ব্যবস্থাপনা',
    adminIncSub: 'জমা পড়া সকল রিপোর্ট পর্যালোচনা করুন, অফিশিয়াল যাচাই করুন বা স্ট্যাটাস আপডেট করুন।',
    adminDeleteIncidentConfirm: 'আপনি কি নিশ্চিতভাবে এই রিপোর্টটি স্থায়ীভাবে মুছে ফেলতে চান?',
    adminDeleteSuccess: 'রিপোর্টটি সফলভাবে মুছে ফেলা হয়েছে।',
    adminDeleteFailed: 'রিপোর্ট মুছতে ব্যর্থ হয়েছে।',

    // Admin Users
    adminUserBadge: 'প্ল্যাটফর্ম ইউজার এডমিনিস্ট্রেশন',
    adminUserTitle: 'নাগরিক ও এডমিন অ্যাকাউন্ট তালিকা',
    adminUserSub: 'রেজিস্টার্ড সকল ব্যবহারকারীদের ভূমিকা (Role) ও অ্যাকাউন্ট সক্রিয়তা পরিচালনা করুন।',
    adminUserDeleteConfirm: 'আপনি কি নিশ্চিতভাবে এই ইউজার অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলতে চান?',
    adminUserDeleteSuccess: 'ইউজার অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।',
    adminUserDeleteFailed: 'ইউজার অ্যাকাউন্ট মুছতে ব্যর্থ হয়েছে।',

    // Footer
    footerRights: 'সর্বস্বত্ব সংরক্ষিত। বাংলাদেশ নাগরিক জরুরি নিরাপত্তা পোর্টাল।',
    footerBuiltWith: 'বাংলাদেশের সর্বস্তরের নাগরিকের সুরক্ষায় নিবেদিত।',
  },
  EN: {
    // Header & Nav
    portalName: 'Bangladesh Safety',
    portalSub: 'National Emergency & Citizen Safety Portal',
    home: 'Home',
    incidents: 'Incidents & Map',
    emergency: 'Emergency Hotlines',
    myReports: 'My Reports',
    adminConsole: 'Admin Console',
    reportIncident: 'Report Incident',
    login: 'Login',
    register: 'Register',
    profile: 'Profile',
    logout: 'Logout',
    notifications: 'Notifications',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    langEng: 'English',
    langBangla: 'বাংলা',

    // Live Alert Ticker
    liveAlertTitle: 'Bangladesh Live Security Alert:',
    liveAlertDefault: 'National Emergency Hotline 999 and Fire Service Control Room active 24/7.',
    viewLiveMap: 'View Live Map →',

    // Hero Section
    heroBadge: '24/7 Citizen Emergency & Safety Network',
    heroTitlePrefix: 'Bangladesh Citizen Security & ',
    heroTitleHighlight: 'Emergency Reporting Portal',
    heroSubtitle: 'Report any accidents, fires, or security hazards anywhere in Bangladesh instantly and access live emergency hotline services.',
    btnReportNow: 'Submit Incident Report',
    btnViewIncidents: 'View Live Map & Alerts',

    // Hero Stats
    statTotal: 'Total Reports',
    statActive: 'Active Events',
    statResolved: 'Resolved',
    statVerified: 'Verified',

    // Emergency Hotlines Banner
    emergencyBannerTitle: 'National Emergency Hotlines (24/7)',
    call999: '999 - National Emergency',
    call16163: '109 - Women & Child Helpline',
    call102: '102 - Fire Service Control',
    call333: '333 - Govt Info Helpline',

    // Incidents Section
    recentIncidentsTitle: 'Recent Security Alerts & Incidents',
    allIncidentsTitle: 'Bangladesh Incident Directory & Map',
    searchPlaceholder: 'Search location, title, category...',
    filterCategory: 'Filter Category',
    filterRisk: 'Risk Level',
    filterStatus: 'Status',
    allCategories: 'All Categories',
    allRisks: 'All Risk Levels',
    allStatuses: 'All Statuses',
    noIncidents: 'No incident records found.',

    // Categories
    catViolence: 'Violence & Crime',
    catHarassment: 'Harassment & Abuse',
    catRobbery: 'Robbery & Theft',
    catFire: 'Fire Hazard',
    catAccident: 'Road Accident',
    catFlood: 'Natural Disaster',
    catInfrastructure: 'Infrastructure Damage',
    catCyber: 'Cyber Crime',
    catOther: 'Others',

    // Statuses
    statusPending: 'Pending',
    statusVerified: 'Verified',
    statusInvestigating: 'Investigating',
    statusResolved: 'Resolved',
    statusRejected: 'Rejected',

    // Report Page
    reportPageTitle: 'Report New Security Incident',
    reportPageSubtitle: 'Provide accurate information and map coordinates. Option to report anonymously.',
    inputTitle: 'Incident Title',
    inputCategory: 'Category',
    inputRisk: 'Risk Level',
    inputLocationName: 'Location Name (e.g., Dhanmondi, Dhaka)',
    inputDescription: 'Detailed Description',
    inputAnonymous: 'Submit Anonymously',
    btnSubmitReport: 'Submit Incident Report',

    // Auth
    loginTitle: 'Sign In to Your Account',
    registerTitle: 'Create Citizen Account',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    nameLabel: 'Full Name',
    phoneLabel: 'Phone Number',
    roleLabel: 'Account Role',
    dontHaveAcc: "Don't have an account? Register here",
    alreadyHaveAcc: 'Already have an account? Login here',

    // Emergency Page
    emgBadge: 'Emergency Hotlines & Rescue Numbers in Bangladesh',
    emgTitle: 'Emergency Services Directory',
    emgSub: 'Verified hotlines and GPS locations for Bangladesh Police, Fire Service, Hospitals & Ambulances.',
    emgAddNew: 'Add Emergency Service',
    emgSearchPlaceholder: 'Search by service name, address, or phone...',
    emgCallHotline: 'Call Hotline',
    emg247: '24/7 Active Service',
    emgHours: 'Standard Hours',
    emgEdit: 'Edit',
    emgDelete: 'Delete',
    emgDeleteConfirm: 'Are you sure you want to delete this emergency service station?',

    // Admin Panel
    adminBadge: 'Security Admin Panel',
    adminTitle: 'Admin Analytics & Control',
    adminSub: 'Real-time incident metrics and statistics collected directly from the database.',
    adminReportMgmt: 'Report Management',
    adminUserMgmt: 'User Management',
    adminBackToDash: '← Back to Dashboard',

    // Admin Incidents
    adminIncBadge: 'Admin Report Control',
    adminIncTitle: 'Report Verification & Status Management',
    adminIncSub: 'Review submitted reports, perform official verification, or update status.',
    adminDeleteIncidentConfirm: 'Are you sure you want to permanently delete this report?',
    adminDeleteSuccess: 'Report deleted successfully.',
    adminDeleteFailed: 'Failed to delete report.',

    // Admin Users
    adminUserBadge: 'Platform User Administration',
    adminUserTitle: 'Citizen & Admin Accounts Directory',
    adminUserSub: 'Manage account roles and activation status for all registered platform users.',
    adminUserDeleteConfirm: 'Are you sure you want to permanently delete this user account?',
    adminUserDeleteSuccess: 'User account deleted successfully.',
    adminUserDeleteFailed: 'Failed to delete user account.',

    // Footer
    footerRights: 'All Rights Reserved. Bangladesh Citizen Security Portal.',
    footerBuiltWith: 'Dedicated to citizen safety and emergency protection across Bangladesh.',
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('app-lang') || 'BN';
  });

  useEffect(() => {
    localStorage.setItem('app-lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'BN' ? 'EN' : 'BN'));
  };

  const t = (key) => {
    const currentDict = translations[lang] || translations.BN;
    return currentDict[key] || translations.BN[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setLang, t }}>
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
