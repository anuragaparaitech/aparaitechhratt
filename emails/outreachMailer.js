import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Replaces {{Token}} placeholders in a template with matching values from data object.
 */
function interpolate(templateString, data = {}) {
  let result = templateString
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, value ?? '')
  }
  return result
}

function loadHtmlTemplate(fileName) {
  const filePath = path.join(__dirname, fileName)
  return fs.readFileSync(filePath, 'utf-8')
}

/**
 * 01. TPO Institutional Pitch Email
 */
export const getTpoPitchTemplate = (data) => {
  const defaults = {
    RecipientName: 'Training & Placement Officer',
    RecipientDesignation: 'TPO / Head of Placements',
    CollegeName: 'Your Esteemed Institution',
    Department: 'Computer & Allied Engineering',
    SenderName: 'Anurag Nand',
    SenderDesignation: 'Director of Institutional Partnerships',
    SenderPhone: '8805213600',
    SenderEmail: 'anurag@aparaitech.com'
  }
  const merged = { ...defaults, ...data }
  const raw = loadHtmlTemplate('01_tpo_institutional_pitch.html')
  return {
    subject: `Collaboration Proposal: Industry-Led Live Project Program 2026 for ${merged.CollegeName} Students`,
    html: interpolate(raw, merged)
  }
}

/**
 * 02. TPO Follow-up & 10-Minute Call Request
 */
export const getTpoFollowUpTemplate = (data) => {
  const defaults = {
    RecipientName: 'Training & Placement Officer',
    CollegeName: 'Your Esteemed Institution',
    SenderName: 'Anurag Nand',
    SenderDesignation: 'Aparaitech Software',
    SenderPhone: '8805213600',
    SenderEmail: 'anurag@aparaitech.com'
  }
  const merged = { ...defaults, ...data }
  const raw = loadHtmlTemplate('02_tpo_follow_up.html')
  return {
    subject: `Re: Industry-Led Live Project Program 2026 for ${merged.CollegeName}`,
    html: interpolate(raw, merged)
  }
}

/**
 * 03. Direct Student Live Project Invitation
 */
export const getStudentInviteTemplate = (data) => {
  const defaults = {
    StudentName: 'Student',
    RegistrationLink: 'https://forms.gle/sucrxqA8c7oZhnQQ7'
  }
  const merged = { ...defaults, ...data }
  const raw = loadHtmlTemplate('03_student_live_project_invite.html')
  return {
    subject: `[Selection Open] Aparaitech Live Project Program 2026 | Industry Projects & Performance Stipend`,
    html: interpolate(raw, merged)
  }
}

/**
 * 04. Student 48-Hour Urgency
 */
export const getStudentUrgencyTemplate = (data) => {
  const defaults = {
    StudentName: 'Candidate',
    RegistrationLink: 'https://forms.gle/sucrxqA8c7oZhnQQ7'
  }
  const merged = { ...defaults, ...data }
  const raw = loadHtmlTemplate('04_student_urgency_last_chance.html')
  return {
    subject: `[Final Call] Last 48 Hours: Aparaitech Live Project Batch 2026 Screening`,
    html: interpolate(raw, merged)
  }
}

/**
 * 05. Campus Tech Masterclass Invitation
 */
export const getMasterclassInviteTemplate = (data) => {
  const defaults = {
    RecipientName: 'Principal / HOD',
    RecipientDesignation: 'Head of Department',
    CollegeName: 'Your Esteemed Institution',
    Department: 'Computer & IT Engineering',
    SenderName: 'Anurag Nand',
    SenderDesignation: 'Academic Outreach Director',
    SenderPhone: '8805213600',
    SenderEmail: 'anurag@aparaitech.com'
  }
  const merged = { ...defaults, ...data }
  const raw = loadHtmlTemplate('05_webinar_campus_workshop_invite.html')
  return {
    subject: `Invitation: 60-Minute Industry Tech Masterclass for ${merged.CollegeName} Students`,
    html: interpolate(raw, merged)
  }
}
