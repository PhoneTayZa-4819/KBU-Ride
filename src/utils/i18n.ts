import type { LanguageCode } from '../types/kbu';

export interface TranslationStrings {
  tagline: string;
  skip: string;
  getStarted: string;
  nextSlide: string;
  termsAcceptPrefix: string;
  termsAndConditions: string;
  locationNotice: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  continueBtn: string;
  verifyNumberTitle: string;
  verifyNumberSubtitle: string;
  resendIn: string;
  resendBtn: string;
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  yourNextShuttle: string;
  liveTracking: string;
  minAwayEstimate: string;
  minTo: string;
  nextStop: string;
  updated: string;
  sAgo: string;
  viewLocation: string;
  setReminder: string;
  trackShuttle: string;
  schedule: string;
  seatDisclaimer: string;
  approaching: string;
  onRoute: string;
  arrivingNow: string;
  offHours: string;
  nextBusAt: string;
  serviceHoursWindow: string;
  offHoursBannerTitle: string;
  offHoursBannerDesc: string;
  livePreviewActive: string;
  previewLiveBtn: string;
  exitPreviewBtn: string;
  serviceActiveBanner: string;
  bangkokTimeLabel: string;
  navHome: string;
  navLocation: string;
  navAboutMe: string;
  navReminders: string;
  navSchedule: string;
  profileSettings: string;
  notificationsReminders: string;
  logOut: string;
  verified: string;
  boardingStop: string;
  remindBefore: string;
  custom: string;
  sound: string;
  enabled: string;
  saveReminder: string;
  reminderDisclaimer: string;
  activeReminders: string;
  edit: string;
  delete: string;
  history: string;
  aboutMe: string;
  appearance: string;
  dark: string;
  light: string;
  system: string;
  language: string;
  english: string;
  thai: string;
  changePhone: string;
  verifyByOtp: string;
  read: string;
  noActiveReminders: string;
  scheduleTitle: string;
  scheduleSubtitle: string;
  nextDeparture: string;
  installAppTitle: string;
  installAppDesc: string;
  installAppBtn: string;
  installIOSHeading: string;
  installIOSStep1: string;
  installIOSStep2: string;
  installIOSStep3: string;
  installGeneralHeading: string;
  installGeneralStep1: string;
  installGeneralStep2: string;
  installGeneralStep3: string;
  installGotIt: string;
  offlineBanner: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationStrings> = {
  en: {
    tagline: 'FOR YOUR TIME',
    skip: 'Skip',
    getStarted: 'Get Started',
    nextSlide: 'Continue',
    termsAcceptPrefix: 'By continuing you accept the ',
    termsAndConditions: 'Terms & Conditions',
    locationNotice: 'Location is used only to show shuttles near you. You choose in the next system prompt.',
    welcomeTitle: 'Welcome to KBU Ride',
    welcomeSubtitle: 'Enter your phone number to continue your journey.',
    continueBtn: 'Continue',
    verifyNumberTitle: 'Verify your number',
    verifyNumberSubtitle: 'Enter the 6-digit code sent by SMS.',
    resendIn: 'Resend code in',
    resendBtn: 'Resend',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    yourNextShuttle: 'Your Next Shuttle',
    liveTracking: 'Live GPS',
    minAwayEstimate: 'min away (estimate)',
    minTo: 'min to',
    nextStop: 'Next stop',
    updated: 'Updated',
    sAgo: 's ago',
    viewLocation: 'View Location',
    setReminder: 'Set Reminder',
    trackShuttle: 'Track Shuttle',
    schedule: 'Schedule',
    seatDisclaimer: 'selected. Selecting does not reserve a seat.',
    approaching: 'Approaching',
    onRoute: 'On route',
    arrivingNow: 'Arriving now',
    offHours: 'Off hours',
    nextBusAt: 'Next bus at',
    serviceHoursWindow: 'Service runs 07:00 – 18:00 (Bangkok)',
    offHoursBannerTitle: 'Shuttles parked · Off hours',
    offHoursBannerDesc: 'Bus 1 & Bus 2 operate 07:00 – 18:00 only.',
    livePreviewActive: 'Live preview active · Real service runs 07:00 – 18:00',
    previewLiveBtn: 'Preview Live',
    exitPreviewBtn: 'Exit Preview',
    serviceActiveBanner: 'In service · 07:00 – 18:00 Romklao 3-stop loop',
    bangkokTimeLabel: 'Bangkok',
    navHome: 'Home',
    navLocation: 'Location',
    navAboutMe: 'About Me',
    navReminders: 'Reminders',
    navSchedule: 'Schedule',
    profileSettings: 'Profile & Settings',
    notificationsReminders: 'Notifications & Reminders',
    logOut: 'Log Out',
    verified: 'Verified',
    boardingStop: 'Boarding stop',
    remindBefore: 'Remind me before arrival',
    custom: 'Custom',
    sound: 'Sound',
    enabled: 'Enabled',
    saveReminder: 'Save Reminder',
    reminderDisclaimer: 'Estimates may change. A reminder does not reserve a seat.',
    activeReminders: 'Active reminders',
    edit: 'Edit',
    delete: 'Remove',
    history: 'History',
    aboutMe: 'About Me',
    appearance: 'Appearance',
    dark: 'Dark',
    light: 'Light',
    system: 'System',
    language: 'Language',
    english: 'English',
    thai: 'ไทย (Thai)',
    changePhone: 'Change phone number',
    verifyByOtp: 'Verify by OTP',
    read: 'Read',
    noActiveReminders: 'No active reminders yet. Save one above to get alerted before your shuttle arrives.',
    scheduleTitle: 'KBU Romklao Shuttle Timetable',
    scheduleSubtitle: 'Dormitory · ข้าวซอยเงินล้าน · Romklao Campus · Every 15 min (07:00 – 18:00)',
    nextDeparture: 'Next trip',
    installAppTitle: 'Install KBU Ride App',
    installAppDesc: 'Add to your home screen for instant shuttle access',
    installAppBtn: 'Install',
    installIOSHeading: 'Install on iPhone / iPad',
    installIOSStep1: 'Tap the Share button in the Safari toolbar.',
    installIOSStep2: 'Scroll down and tap "Add to Home Screen".',
    installIOSStep3: 'Tap "Add" in the top corner to install KBU Ride.',
    installGeneralHeading: 'Install KBU Ride App',
    installGeneralStep1: 'Open the browser menu (⋮ or install icon in the address bar).',
    installGeneralStep2: 'Select "Install app" or "Add to Home screen".',
    installGeneralStep3: 'Confirm to launch KBU Ride like a native mobile app.',
    installGotIt: 'Got it',
    offlineBanner: 'Offline mode — Cached schedule & UI active',
  },
  th: {
    tagline: 'เพื่อเวลาของคุณ',
    skip: 'ข้าม',
    getStarted: 'เริ่มต้นใช้งาน',
    nextSlide: 'ถัดไป',
    termsAcceptPrefix: 'การดำเนินการต่อถือว่าคุณยอมรับ ',
    termsAndConditions: 'ข้อกำหนดและเงื่อนไข',
    locationNotice: 'ตำแหน่งใช้เพื่อแสดงรถรับส่งใกล้คุณเท่านั้น คุณสามารถเลือกได้ในขั้นตอนถัดไป',
    welcomeTitle: 'ยินดีต้อนรับสู่ KBU Ride',
    welcomeSubtitle: 'กรอกหมายเลขโทรศัพท์ของคุณเพื่อเริ่มการเดินทาง',
    continueBtn: 'ดำเนินการต่อ',
    verifyNumberTitle: 'ยืนยันหมายเลขโทรศัพท์',
    verifyNumberSubtitle: 'กรอกรหัส 6 หลักที่ส่งทาง SMS',
    resendIn: 'ส่งรหัสอีกครั้งใน',
    resendBtn: 'ส่งอีกครั้ง',
    goodMorning: 'สวัสดีตอนเช้า',
    goodAfternoon: 'สวัสดีตอนบ่าย',
    goodEvening: 'สวัสดีตอนเย็น',
    yourNextShuttle: 'รถรับส่งรอบถัดไปของคุณ',
    liveTracking: 'ติดตามสด GPS',
    minAwayEstimate: 'นาที (โดยประมาณ)',
    minTo: 'นาที ถึง',
    nextStop: 'ป้ายถัดไป',
    updated: 'อัปเดตเมื่อ',
    sAgo: 'วิที่แล้ว',
    viewLocation: 'ดูตำแหน่งรถ',
    setReminder: 'ตั้งเตือนเวลา',
    trackShuttle: 'ติดตามรถ',
    schedule: 'ตารางเดินรถ',
    seatDisclaimer: 'ถูกเลือกแล้ว การเลือกไม่ได้เป็นการจองที่นั่ง',
    approaching: 'กำลังมาถึง',
    onRoute: 'กำลังเดินทาง',
    arrivingNow: 'ถึงป้ายแล้ว',
    offHours: 'นอกเวลาทำการ',
    nextBusAt: 'รถรอบถัดไปเวลา',
    serviceHoursWindow: 'ให้บริการเวลา 07:00 – 18:00 น. (เวลาไทย)',
    offHoursBannerTitle: 'รถจอดพัก · นอกเวลาทำการ',
    offHoursBannerDesc: 'รถสาย 1 และ 2 วิ่งเฉพาะ 07:00 – 18:00 น.',
    livePreviewActive: 'กำลังแสดงตัวอย่างสด · เวลาจริง 07:00 – 18:00 น.',
    previewLiveBtn: 'ดูตัวอย่างสด',
    exitPreviewBtn: 'ออกจากตัวอย่าง',
    serviceActiveBanner: 'กำลังให้บริการ · 07:00 – 18:00 น. เส้นทาง 3 จุดร่มเกล้า',
    bangkokTimeLabel: 'เวลาไทย',
    navHome: 'หน้าหลัก',
    navLocation: 'แผนที่สด',
    navAboutMe: 'ข้อมูลของฉัน',
    navReminders: 'การแจ้งเตือน',
    navSchedule: 'ตารางเดินรถ',
    profileSettings: 'โปรไฟล์และการตั้งค่า',
    notificationsReminders: 'การแจ้งเตือนและตั้งเตือน',
    logOut: 'ออกจากระบบ',
    verified: 'ยืนยันแล้ว',
    boardingStop: 'จุดขึ้นรถ',
    remindBefore: 'แจ้งเตือนก่อนรถมาถึง',
    custom: 'กำหนดเอง',
    sound: 'เสียงเตือน',
    enabled: 'เปิดใช้งาน',
    saveReminder: 'บันทึกการแจ้งเตือน',
    reminderDisclaimer: 'เวลาโดยประมาณอาจเปลี่ยนแปลงได้ การแจ้งเตือนไม่ใช่การจองที่นั่ง',
    activeReminders: 'การแจ้งเตือนที่เปิดอยู่',
    edit: 'แก้ไข',
    delete: 'ลบ',
    history: 'ประวัติการแจ้งเตือน',
    aboutMe: 'ข้อมูลของฉัน',
    appearance: 'ธีมการแสดงผล',
    dark: 'โหมดมืด',
    light: 'โหมดสว่าง',
    system: 'ตามระบบ',
    language: 'ภาษา',
    english: 'English',
    thai: 'ไทย',
    changePhone: 'เปลี่ยนหมายเลขโทรศัพท์',
    verifyByOtp: 'ยืนยันด้วย OTP',
    read: 'อ่านเพิ่มเติม',
    noActiveReminders: 'ยังไม่มีการแจ้งเตือนที่เปิดอยู่ บันทึกด้านบนเพื่อรับแจ้งเตือนก่อนรถมาถึง',
    scheduleTitle: 'ตารางเดินรถรับส่ง ม.เกษมบัณฑิต ร่มเกล้า',
    scheduleSubtitle: 'หอพักฯ · ข้าวซอยเงินล้าน · ม.เกษมบัณฑิต ร่มเกล้า · ออกทุก 15 นาที (07:00 – 18:00 น.)',
    nextDeparture: 'รอบถัดไป',
    installAppTitle: 'ติดตั้งแอป KBU Ride',
    installAppDesc: 'เพิ่มลงหน้าจอหลักเพื่อติดตามรถรับส่งได้ทันที',
    installAppBtn: 'ติดตั้ง',
    installIOSHeading: 'ติดตั้งบน iPhone / iPad',
    installIOSStep1: 'แตะปุ่มแชร์ (Share) ที่แถบด้านล่างของ Safari',
    installIOSStep2: 'เลื่อนลงแล้วเลือก "เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)',
    installIOSStep3: 'แตะ "เพิ่ม" (Add) มุมขวาบนเพื่อติดตั้ง KBU Ride',
    installGeneralHeading: 'ติดตั้งแอป KBU Ride',
    installGeneralStep1: 'เปิดเมนูเบราว์เซอร์ (⋮ หรือไอคอนติดตั้งที่แถบ URL)',
    installGeneralStep2: 'เลือก "ติดตั้งแอป" (Install app) หรือ "เพิ่มไปยังหน้าจอหลัก"',
    installGeneralStep3: 'ยืนยันเพื่อใช้งาน KBU Ride เหมือนแอปบนมือถือ',
    installGotIt: 'เข้าใจแล้ว',
    offlineBanner: 'โหมดออฟไลน์ — แสดงตารางเวลาที่บันทึกไว้',
  },
};

export function getTimeGreeting(date: Date, lang: LanguageCode): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      hour12: false,
    }).format(date)
  );
  const dict = TRANSLATIONS[lang];
  if (hour < 12) return dict.goodMorning;
  if (hour < 17) return dict.goodAfternoon;
  return dict.goodEvening;
}
