// Standard English Corporate Dictionary for Aparaitech Work Portal
// Strictly English across all modules and portals

export const translations = {
  en: {
    portalName: 'Aparaitech Work Portal – Software Team',
    dashboard: 'Software Dashboard',
    tasks: 'Sprint Tasks',
    projects: 'Projects Hub',
    dailyReport: 'Daily Work Report',
    codeRepo: 'Code Repository',
    performance: 'Performance',
    attendance: 'Attendance & Punch',
    leaves: 'Leave Management',
    documents: 'Document Centre',
    announcements: 'Announcements',
    messages: 'Message Centre',
    settings: 'Settings',
    punchIn: 'Punch In (Face + GPS)',
    punchOut: 'Punch Out',
    submitReport: 'Submit Daily Report',
    reportReminder: '⚠️ Reminder: Daily report submission is due by 7:00 PM!',
    welcomeBack: 'Welcome back,',
    shift: 'Shift',
    activeTasks: 'Active Tasks',
    projectProgress: 'Project Progress',
    todayHours: 'Today Hours',
    commitsPushed: 'Commits Pushed',
    velocityScore: 'Velocity Score',
    toDo: 'To Do',
    inProgress: 'In Progress',
    inReview: 'In Review',
    done: 'Done',
    newTask: 'New Task',
    createProject: 'Create Project',
    save: 'Save',
    cancel: 'Cancel',
    applyLeave: 'Apply Leave',
    download: 'Download',
    print: 'Print',
    switchPortal: 'Switch Portal',
    softwarePortal: 'Software Portal',
    bdaPortal: 'BDA Sales Portal',
    language: 'Language',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    logout: 'Sign Out'
  }
}

export const getTranslation = (key) => {
  return translations.en[key] || key
}
