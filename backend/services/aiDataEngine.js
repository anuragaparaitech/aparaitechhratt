import Lead from '../models/Lead.js'

// Predefined official domains
export const PREDEFINED_DOMAINS = [
  'Web Development',
  'AI & Machine Learning',
  'Data Science',
  'Full Stack Development',
  'Cloud & DevOps',
  'Cybersecurity',
  'Mobile App Development',
  'Business Development & Sales',
  'UI/UX Design'
]

// Common Indian College dictionary mapping abbreviations to official names
const COLLEGE_MAP = [
  { match: /\b(coep|c\.o\.e\.p)\b/i, official: 'COEP Technological University, Pune' },
  { match: /\b(pict|p\.i\.c\.t)\b/i, official: 'Pune Institute of Computer Technology (PICT), Pune' },
  { match: /\b(mit-wpu|mit wpu|mit alandi|mit pune|mit)\b/i, official: 'MIT World Peace University (MIT-WPU), Pune' },
  { match: /\b(vit pune|vit)\b/i, official: 'Vishwakarma Institute of Technology (VIT), Pune' },
  { match: /\b(viit|v\.i\.i\.t)\b/i, official: 'Vishwakarma Institute of Information Technology (VIIT), Pune' },
  { match: /\b(pccoe|p\.c\.c\.o\.e)\b/i, official: 'Pimpri Chinchwad College of Engineering (PCCOE), Pune' },
  { match: /\b(d\s*y\s*patil|dypatil|dypiet|dypcoe)\b/i, official: 'Dr. D.Y. Patil Institute of Technology, Pimpri' },
  { match: /\b(sinhgad|skncoe|scoe|sit lonavala)\b/i, official: 'Sinhgad College of Engineering (SCOE), Pune' },
  { match: /\b(cummins|mksss)\b/i, official: 'MKSSS Cummins College of Engineering for Women, Pune' },
  { match: /\b(aissms|a\.i\.s\.s\.m\.s)\b/i, official: 'AISSMS College of Engineering, Pune' },
  { match: /\b(modern college|pes modern|pescoe)\b/i, official: 'PES Modern College of Engineering, Pune' },
  { match: /\b(bharati vidyapeeth|bvp|bvdu)\b/i, official: 'Bharati Vidyapeeth Deemed University (BVDU), Pune' },
  { match: /\b(symbiosis|sit pune)\b/i, official: 'Symbiosis Institute of Technology (SIT), Pune' },
  { match: /\b(sppu|pune university|unipune)\b/i, official: 'Savitribai Phule Pune University (SPPU)' },
  { match: /\b(vjti|v\.j\.t\.i)\b/i, official: 'Veermata Jijabai Technological Institute (VJTI), Mumbai' },
  { match: /\b(spit|s\.p\.i\.t|sardar patel)\b/i, official: 'Sardar Patel Institute of Technology (SPIT), Mumbai' },
  { match: /\b(iit bombay|iitb)\b/i, official: 'Indian Institute of Technology Bombay (IIT-B)' },
  { match: /\b(iit kgp|iit kharagpur)\b/i, official: 'Indian Institute of Technology Kharagpur (IIT-KGP)' },
  { match: /\b(iit delhi|iitd)\b/i, official: 'Indian Institute of Technology Delhi (IIT-D)' },
  { match: /\b(vnit|vnit nagpur)\b/i, official: 'Visvesvaraya National Institute of Technology (VNIT), Nagpur' },
  { match: /\b(walchand|wce)\b/i, official: 'Walchand College of Engineering, Sangli' },
  { match: /\b(government college|gcoeara|gcoep)\b/i, official: 'Government College of Engineering, Avasari' },
  { match: /\b(kkwagh|k\.k\.wagh)\b/i, official: 'K.K. Wagh Institute of Engineering, Nashik' },
  { match: /\b(jspm|tscr|rajarshi shahu)\b/i, official: 'JSPM Rajarshi Shahu College of Engineering, Pune' },
  { match: /\b(zeal|zcoer)\b/i, official: 'Zeal College of Engineering and Research, Pune' },
  { match: /\b(ghrce|raisoni)\b/i, official: 'G.H. Raisoni College of Engineering, Pune' }
]

// Domain keyword matchers
const DOMAIN_RULES = [
  {
    domain: 'AI & Machine Learning',
    keywords: /\b(ai|ml|machine learning|deep learning|artificial intelligence|neural|nlp|computer vision|tensorflow|pytorch|opencv|generative ai|llm)\b/i
  },
  {
    domain: 'Data Science',
    keywords: /\b(data science|data analyst|data analytics|analytics|big data|power bi|tableau|pandas|numpy|data engineering|sql developer)\b/i
  },
  {
    domain: 'Full Stack Development',
    keywords: /\b(full stack|fullstack|mern|mean|spring boot|django|laravel|asp\.net|fastapi|backend and frontend)\b/i
  },
  {
    domain: 'Cloud & DevOps',
    keywords: /\b(cloud|devops|aws|azure|gcp|docker|kubernetes|ci\/cd|terraform|linux admin|sysadmin)\b/i
  },
  {
    domain: 'Cybersecurity',
    keywords: /\b(cyber|security|ethical hacking|infosec|network security|penetration testing|pen testing|kali|soc)\b/i
  },
  {
    domain: 'Mobile App Development',
    keywords: /\b(android|ios|flutter|react native|kotlin|swift|mobile app|app development)\b/i
  },
  {
    domain: 'Business Development & Sales',
    keywords: /\b(bda|business development|sales|marketing|inside sales|lead gen|outreach|calling|telecalling|client relation|counselor|admission)\b/i
  },
  {
    domain: 'UI/UX Design',
    keywords: /\b(ui|ux|ui\/ux|figma|user interface|user experience|wireframing|prototyping|graphic design)\b/i
  },
  {
    domain: 'Web Development',
    keywords: /\b(web dev|web development|frontend|html|css|javascript|react|vue|angular|node|php|wordpress|bootstrap|tailwind)\b/i
  }
]

// Priority determination keywords
const HIGH_INTENT_KEYWORDS = /\b(immediate|urgent|internship|interested|ready to pay|fees|paid|joining|placed|final year|passout|admission|confirmed|high intent)\b/i
const LOW_INTENT_KEYWORDS = /\b(not interested|wrong number|don't call|busy|invalid|fake|spam)\b/i

/**
 * Helper to convert strings to Title Case
 */
export const toTitleCase = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .replace(/(^|[.\s/_-])([a-z])/g, (_, boundary, letter) => boundary + letter.toUpperCase())
    .trim()
}

/**
 * Clean & Format 10-digit Indian Mobile Numbers to +91 XXXXX XXXXX
 */
export const formatIndianMobile = (raw) => {
  if (!raw) return { formatted: '', clean: '' }
  // Strip all non-digit characters
  let digits = String(raw).replace(/\D/g, '')

  // Remove leading 0 if 11 digits
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1)
  }
  // Remove country code 91 if 12 digits
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2)
  }

  // Check if valid 10-digit Indian number (starting 6, 7, 8, 9)
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    const formatted = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
    return { formatted, clean: digits }
  }

  // Fallback if 10 digits without leading 6-9
  if (digits.length === 10) {
    return { formatted: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`, clean: digits }
  }

  return { formatted: raw.trim(), clean: digits }
}

/**
 * Standardize College Name using map and intelligent heuristics
 */
export const standardizeCollege = (raw) => {
  if (!raw || typeof raw !== 'string') {
    return 'Independent / Unspecified College'
  }
  const cleanRaw = raw.trim()
  if (!cleanRaw || cleanRaw.toLowerCase() === 'n/a' || cleanRaw.toLowerCase() === 'none') {
    return 'Independent / Unspecified College'
  }

  for (const item of COLLEGE_MAP) {
    if (item.match.test(cleanRaw)) {
      return item.official
    }
  }

  // Remove common noisy prefixes/suffixes and title case
  let cleaned = cleanRaw
    .replace(/\b(clg|colg)\b/gi, 'College')
    .replace(/\b(engg|engnr)\b/gi, 'Engineering')
    .replace(/\b(inst)\b/gi, 'Institute')
    .replace(/\b(univ)\b/gi, 'University')
    .replace(/\s+/g, ' ')
    .trim()

  return toTitleCase(cleaned)
}

/**
 * Detect Domain from text, course, or hints
 */
export const detectDomain = (text) => {
  if (!text) return 'Web Development'
  for (const rule of DOMAIN_RULES) {
    if (rule.keywords.test(text)) {
      return rule.domain
    }
  }
  return 'Web Development'
}

/**
 * Parse an individual unstructured row or text string
 */
export const parseRawEntity = (rawLine) => {
  if (!rawLine || typeof rawLine !== 'string') return null
  const line = rawLine.trim()
  if (!line || line.length < 3) return null

  // Skip header lines like "Name,Email,Mobile,College"
  if (/^(name|candidate|sr\s*no|id|first\s*name)[,\t|]/i.test(line)) {
    return null
  }

  let textWorking = line

  // 1. Extract Email
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
  const emailMatch = textWorking.match(emailRegex)
  let email = ''
  if (emailMatch) {
    email = emailMatch[1].toLowerCase().trim()
    textWorking = textWorking.replace(emailMatch[0], ' ')
  }

  // 2. Extract Mobile
  // Match potential 10 to 12 digit numbers with optional +91, 0, hyphens
  const phoneRegex = /(?:\+?91[\s.-]?)?(?:0)?([6-9]\d{9}|[6-9]\d{4}[\s.-]?\d{5})\b/
  const phoneMatch = textWorking.match(phoneRegex)
  let rawPhone = ''
  if (phoneMatch) {
    rawPhone = phoneMatch[0]
    textWorking = textWorking.replace(phoneMatch[0], ' ')
  }

  const { formatted: mobile, clean: cleanMobile } = formatIndianMobile(rawPhone)

  // 3. Detect Domain from original line or working text
  const domain = detectDomain(line)

  // 4. Detect College
  let college = ''
  for (const item of COLLEGE_MAP) {
    if (item.match.test(line)) {
      college = item.official
      textWorking = textWorking.replace(item.match, ' ')
      break
    }
  }

  // If no predefined match, check for explicit indicators e.g. "College: XYZ" or words ending in College/University/Institute
  if (!college) {
    const colIndicator = line.match(/(?:college|institute|university|clg|campus|faculty)[:\s]+([^,;|]+)/i)
    if (colIndicator) {
      college = standardizeCollege(colIndicator[1])
      textWorking = textWorking.replace(colIndicator[0], ' ')
    } else {
      const colWordMatch = textWorking.match(/\b([A-Za-z.\s]+(College|Institute|University|Polytechnic|Academy))\b/i)
      if (colWordMatch) {
        college = standardizeCollege(colWordMatch[0])
        textWorking = textWorking.replace(colWordMatch[0], ' ')
      }
    }
  }
  if (!college) {
    college = 'Independent / Unspecified College'
  }

  // 5. Clean Name from remaining tokens
  // Strip common label markers like "Name:", "Ph:", "Phone:", "Email:", "Domain:", "College:"
  let nameTokens = textWorking
    .replace(/\b(name|email|mobile|phone|contact|college|clg|dept|domain|branch|course|status|remark|year|fees)[:=-]/gi, ' ')
    .replace(/[,;|/\\()\[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Remove domain keywords from name tokens
  for (const rule of DOMAIN_RULES) {
    nameTokens = nameTokens.replace(rule.keywords, ' ')
  }

  // Clean remaining digits, symbols, and extra words
  let nameCandidates = nameTokens
    .split(/\s+/)
    .filter(word => /^[a-zA-Z.]{2,}$/.test(word))
    .slice(0, 4) // Names are typically 1 to 4 words

  let name = nameCandidates.join(' ').trim()
  if (!name || name.length < 2) {
    // If no name extracted, fallback to email prefix if present or "Prospective Student"
    if (email) {
      const emailPrefix = email.split('@')[0].replace(/[._0-9]/g, ' ').trim()
      name = toTitleCase(emailPrefix) || 'Prospective Lead'
    } else {
      name = 'Prospective Student'
    }
  } else {
    name = toTitleCase(name)
  }

  // 6. Missing Fields Detection
  const missingFields = []
  if (!cleanMobile) missingFields.push('mobile')
  if (!email) missingFields.push('email')
  if (!college || college === 'Independent / Unspecified College') missingFields.push('college')

  // 7. Priority Determination
  let priority = 'Warm'
  let priorityScore = 50

  if (HIGH_INTENT_KEYWORDS.test(line)) {
    priority = 'Hot'
    priorityScore = 90
  } else if (LOW_INTENT_KEYWORDS.test(line)) {
    priority = 'Cold'
    priorityScore = 20
  } else if (cleanMobile && email && college !== 'Independent / Unspecified College') {
    priority = 'Hot'
    priorityScore = 80
  } else if (!cleanMobile) {
    priority = 'Cold'
    priorityScore = 15
  }

  return {
    name,
    mobile,
    cleanMobile,
    email,
    college,
    domain,
    priority,
    priorityScore,
    rawText: line,
    missingFields,
    isDuplicate: false,
    status: 'Not Called'
  }
}

/**
 * Main AI Pipeline for Processing Bulk Input Data
 * @param {string|Array} inputData - Text block or array of objects
 * @param {Object} options - Options including checking against database
 */
export const processWithAIDataEngine = async (inputData, options = {}) => {
  const { checkExistingDB = true } = options
  let lines = []

  if (typeof inputData === 'string') {
    lines = inputData
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean)
  } else if (Array.isArray(inputData)) {
    // If array of objects (from Excel/CSV import)
    lines = inputData.map(item => {
      if (typeof item === 'string') return item
      if (typeof item === 'object' && item !== null) {
        // Concatenate keys and values
        return Object.entries(item)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
      }
      return String(item)
    }).filter(Boolean)
  }

  const parsedRecords = []
  const seenMobiles = new Set()
  const seenEmails = new Set()
  let duplicateCount = 0
  const duplicates = []

  // Step 1 & 2 & 3: Parse and standardize
  for (const rawLine of lines) {
    const parsed = parseRawEntity(rawLine)
    if (!parsed) continue

    // Step 4: In-Batch Duplicate Detection
    let isDup = false
    if (parsed.cleanMobile && seenMobiles.has(parsed.cleanMobile)) {
      isDup = true
    } else if (parsed.email && seenEmails.has(parsed.email)) {
      isDup = true
    }

    if (isDup) {
      duplicateCount++
      parsed.isDuplicate = true
      duplicates.push(parsed)
      continue // remove from clean batch
    }

    if (parsed.cleanMobile) seenMobiles.add(parsed.cleanMobile)
    if (parsed.email) seenEmails.add(parsed.email)

    parsedRecords.push(parsed)
  }

  // Step 2 enhancement: If mobile is missing but email or name exists, check DB for past record
  if (checkExistingDB && parsedRecords.length > 0) {
    try {
      const emailsToCheck = parsedRecords
        .filter(r => !r.cleanMobile && r.email)
        .map(r => r.email)

      if (emailsToCheck.length > 0) {
        const existingLeads = await Lead.find({ email: { $in: emailsToCheck }, cleanMobile: { $ne: '' } })
        const leadMap = new Map()
        existingLeads.forEach(l => leadMap.set(l.email, l))

        parsedRecords.forEach(r => {
          if (!r.cleanMobile && r.email && leadMap.has(r.email)) {
            const matched = leadMap.get(r.email)
            r.mobile = matched.mobile
            r.cleanMobile = matched.cleanMobile
            r.missingFields = r.missingFields.filter(f => f !== 'mobile')
            if (matched.college && r.college === 'Independent / Unspecified College') {
              r.college = matched.college
              r.missingFields = r.missingFields.filter(f => f !== 'college')
            }
          }
        })
      }
    } catch (dbErr) {
      console.warn('[AI Data Engine] DB reference check non-fatal error:', dbErr.message)
    }
  }

  // Step 5: Categorization Summary
  const byCollege = {}
  const byDomain = {}
  const byPriority = { Hot: 0, Warm: 0, Cold: 0 }
  let missingFieldRecordsCount = 0

  parsedRecords.forEach(r => {
    byCollege[r.college] = (byCollege[r.college] || 0) + 1
    byDomain[r.domain] = (byDomain[r.domain] || 0) + 1
    byPriority[r.priority] = (byPriority[r.priority] || 0) + 1
    if (r.missingFields && r.missingFields.length > 0) {
      missingFieldRecordsCount++
    }
  })

  return {
    success: true,
    totalRawInput: lines.length,
    cleanRecordsCount: parsedRecords.length,
    duplicateCount,
    missingFieldRecordsCount,
    byCollege,
    byDomain,
    byPriority,
    records: parsedRecords,
    duplicates
  }
}
