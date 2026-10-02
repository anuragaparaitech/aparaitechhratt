// Aparaitech Work Portal Mobile Configuration
export const API_BASE_URL = 'https://aparaitech-software-attendance-protal-9l04.onrender.com';

// Corporate Geofence Reference - Optenix Tech Solution, Hinjawadi Phase 1, Pune
export const OFFICE_GEOFENCE = {
  name: 'Optenix Tech Solution (Hinjawadi)',
  latitude: 18.5962139,
  longitude: 73.7185487,
  radiusMeters: 200,
  address: 'Optenix Tech Solution, Hinjawadi Phase 1, Pune, Maharashtra 411057'
};

// Work Shift Schedules
export const SHIFTS = {
  shift_1: {
    id: 'shift_1',
    name: 'Shift 1 (Software Developers)',
    startTime: '07:00',
    endTime: '11:00',
    display: '7:00 AM – 11:00 AM',
    roles: ['Software Developer Intern', 'Development', 'Engineering']
  },
  shift_2: {
    id: 'shift_2',
    name: 'Shift 2 (BDA Phase 1)',
    startTime: '11:00',
    endTime: '17:00',
    display: '11:00 AM – 5:00 PM',
    roles: ['BDA Intern', 'Sales', 'Business Development']
  },
  shift_3: {
    id: 'shift_3',
    name: 'Shift 3 (BDA Phase 2)',
    startTime: '17:00',
    endTime: '23:00',
    display: '5:00 PM – 11:00 PM',
    roles: ['BDA Intern Evening', 'Outreach']
  }
};

// Commercial Revenue Rate per verified candidate
export const REVENUE_PER_CONVERSION = 6000;
