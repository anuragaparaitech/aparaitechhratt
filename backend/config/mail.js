import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Export email configuration resolver so both Nodemailer and emailService use same variables
export const resolveEmailConfig = () => {
  const host = process.env.EMAIL_HOST || process.env.BREVO_SMTP_HOST || process.env.MAIL_HOST || 'smtp-relay.brevo.com'
  const port = parseInt(process.env.EMAIL_PORT || process.env.BREVO_SMTP_PORT || process.env.MAIL_PORT || '587')
  const user = process.env.EMAIL_USER || process.env.BREVO_SMTP_USER || process.env.MAIL_USER
  const pass = process.env.EMAIL_PASSWORD || process.env.BREVO_API_KEY || process.env.MAIL_PASS
  const from = process.env.EMAIL_FROM || process.env.MAIL_FROM_EMAIL || process.env.MAIL_FROM || 'krushnarathod.aparaitech@gmail.com'
  const fromName = process.env.EMAIL_FROM_NAME || process.env.MAIL_FROM_NAME || 'Aparaitech Software Company'

  return { host, port, user, pass, from, fromName }
}

const { host, port, user, pass, from } = resolveEmailConfig()

// Clear diagnostic logs on startup
const missingVars = []
if (!process.env.EMAIL_HOST && !process.env.BREVO_SMTP_HOST && !process.env.MAIL_HOST) missingVars.push('EMAIL_HOST/BREVO_SMTP_HOST')
if (!process.env.EMAIL_PORT && !process.env.BREVO_SMTP_PORT && !process.env.MAIL_PORT) missingVars.push('EMAIL_PORT/BREVO_SMTP_PORT')
if (!process.env.EMAIL_USER && !process.env.BREVO_SMTP_USER && !process.env.MAIL_USER) missingVars.push('EMAIL_USER/BREVO_SMTP_USER')
if (!process.env.EMAIL_PASSWORD && !process.env.BREVO_API_KEY && !process.env.MAIL_PASS) missingVars.push('EMAIL_PASSWORD/BREVO_API_KEY')
if (!process.env.EMAIL_FROM && !process.env.MAIL_FROM_EMAIL && !process.env.MAIL_FROM) missingVars.push('EMAIL_FROM/MAIL_FROM_EMAIL')

if (missingVars.length > 0) {
  console.warn(`⚠️ SMTP configuration check: Missing variables: [${missingVars.join(', ')}]. Fallbacks will be used.`)
}

console.log(`📬 Initializing SMTP Mailer: Host=${host}, Port=${port}, Sender=${from} (secure=${port === 465})`)

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // Port 587 uses secure: false (STARTTLS)
  auth: {
    user: user || '',
    pass: pass || ''
  },
  connectionTimeout: 10000,  // 10 seconds connection timeout
  greetingTimeout: 10000,    // 10 seconds greeting timeout
  socketTimeout: 15000,      // 15 seconds socket activity timeout
  dnsTimeout: 5000           // 5 seconds dns resolution timeout
})

export default transporter
