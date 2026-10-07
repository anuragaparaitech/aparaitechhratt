// Aparaitech Work Portal Mobile Configuration
export const API_BASE_URL = 'https://aparaitech-software-attendance-protal-9l04.onrender.com';

// Corporate Geofence Reference - Aparaitech Software, Hinjawadi Phase 1, Pune
export const OFFICE_GEOFENCE = {
  name: 'Aparaitech Software (Hinjawadi)',
  latitude: 18.596077,
  longitude: 73.718054,
  radiusMeters: 200,
  address: 'Aparaitech Software, Hinjawadi Phase 1, Pune, Maharashtra 411057'
};

export const GEOFENCE_CONFIG = OFFICE_GEOFENCE;

// Work Shift Schedules
export const SHIFTS = {
  shift_1: {
    id: 'shift_1',
    name: 'Shift 1 (Software Developers)',
    startTime: '07:00',
    endTime: '11:00',
    display: '7:00 AM – 11:00 AM',
    roles: ['Software Developer', 'Development', 'Engineering']
  },
  shift_2: {
    id: 'shift_2',
    name: 'Shift 2 (BDA Phase 2)',
    startTime: '11:00',
    endTime: '17:00',
    display: '11:00 AM – 5:00 PM',
    roles: ['BDA Associate', 'Sales', 'Business Development']
  },
  shift_3: {
    id: 'shift_3',
    name: 'Shift 3 (BDA Phase 2 - Evening)',
    startTime: '17:00',
    endTime: '23:00',
    display: '5:00 PM – 11:00 PM',
    roles: ['BDA Associate Evening', 'Outreach']
  }
};

// Commercial Revenue Rate per verified product conversion
export const REVENUE_PER_CONVERSION = 6000;
