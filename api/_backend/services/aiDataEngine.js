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
  { match: /\b(svpm|s\.v\.p\.m)\b/i, official: 'SVPM College of Engineering, Malegaon (Baramati)' },
  { match: /\b(sharadchandra\s*pawar|sharadchandra|spcoe)\b/i, official: 'Sharadchandra Pawar College of Engineering (SPCOE), Pune' },
  { match: /\b(sanjivani|sres)\b/i, official: 'Sanjivani College of Engineering, Kopargaon' },
  { match: /\b(amrutvahini|avcoe)\b/i, official: 'Amrutvahini College of Engineering, Sangamner' },
  { match: /\b(pravara|prec\b)/i, official: 'Pravara Rural Engineering College, Loni' },
  { match: /\b(karmaveer|kbpcoe|kbp\b)/i, official: 'Karmaveer Bhaurao Patil College of Engineering, Satara' },
  { match: /\b(sandip\s*foundation|sandip|sitrc)\b/i, official: 'Sandip Institute of Technology & Research Centre, Nashik' },
  { match: /\b(snjb|kantabai)\b/i, official: 'SNJB Late Sau Kantabai Bhavarlalji Jain College of Engineering, Chandwad' },
  { match: /\b(met\s*bhujbal|met\s*nashik|met\b)/i, official: 'MET League of Colleges, Bhujbal Knowledge City, Nashik' },
  { match: /\b(kkwagh|k\.k\.wagh|k\s*k\s*wagh)\b/i, official: 'K.K. Wagh Institute of Engineering Education and Research, Nashik' },
  { match: /\b(mmcoe|mmit|marathwada\s*mitra\s*mandal)\b/i, official: 'Marathwada Mitra Mandal College of Engineering (MMCOE), Pune' },
  { match: /\b(aissms|a\.i\.s\.s\.m\.s)\b/i, official: 'AISSMS College of Engineering, Pune' },
  { match: /\b(modern\s*college|pes\s*modern|pescoe)\b/i, official: 'PES Modern College of Engineering, Pune' },
  { match: /\b(trinity|tcoer)\b/i, official: 'Trinity College of Engineering and Research, Pune' },
  { match: /\b(zeal|zcoer)\b/i, official: 'Zeal College of Engineering and Research, Pune' },
  { match: /\b(jspm|tscr|rajarshi\s*shahu|genba\s*sopanrao|jsspm)\b/i, official: 'JSPM Rajarshi Shahu College of Engineering, Pune' },
  { match: /\b(sinhgad|skncoe|scoe|sit\s*lonavala|nbn\s*sinhgad|nbnssoe)\b/i, official: 'Sinhgad College of Engineering (SCOE), Pune' },
  { match: /\b(d\s*y\s*patil|dypatil|dypiet|dypcoe|ramrao\s*patil)\b/i, official: 'Dr. D.Y. Patil Institute of Technology, Pune' },
  { match: /\b(pccoe|p\.c\.c\.o\.e|pccoe&r)\b/i, official: 'Pimpri Chinchwad College of Engineering (PCCOE), Pune' },
  { match: /\b(coep|c\.o\.e\.p)\b/i, official: 'COEP Technological University, Pune' },
  { match: /\b(pict|p\.i\.c\.t)\b/i, official: 'Pune Institute of Computer Technology (PICT), Pune' },
  { match: /\b(vit\s*pune|vishwakarma)\b/i, official: 'Vishwakarma Institute of Technology (VIT), Pune' },
  { match: /\b(viit|v\.i\.i\.t)\b/i, official: 'Vishwakarma Institute of Information Technology (VIIT), Pune' },
  { match: /\b(cummins|mksss)\b/i, official: 'MKSSS Cummins College of Engineering for Women, Pune' },
  { match: /\b(walchand|wce)\b/i, official: 'Walchand College of Engineering, Sangli' },
  { match: /\b(rajarambapu|rit\s*sangli|rit\s*sakharale)\b/i, official: 'Rajarambapu Institute of Technology (RIT), Sangli' },
  { match: /\b(annasaheb\s*dange|adcet)\b/i, official: 'Annasaheb Dange College of Engineering and Technology, Ashta' },
  { match: /\b(gcoek|geca|gcoea|government\s*college\s*of\s*engineering)\b/i, official: 'Government College of Engineering' },
  { match: /\b(alard|acem)\b/i, official: 'Alard College of Engineering and Management, Pune' },
  { match: /\b(indira\s*college|icem)\b/i, official: 'Indira College of Engineering and Management, Pune' },
  { match: /\b(finolex|famt)\b/i, official: 'Finolex Academy of Management and Technology, Ratnagiri' },
  { match: /\b(terna|tec\s*nerul)\b/i, official: 'Terna Engineering College, Navi Mumbai' },
  { match: /\b(saraswati|scoe\s*kharghar)\b/i, official: 'Saraswati College of Engineering, Kharghar' },
  { match: /\b(pillai|pce\s*panvel)\b/i, official: 'Pillai College of Engineering, New Panvel' },
  { match: /\b(datta\s*meghe|dmce)\b/i, official: 'Datta Meghe College of Engineering, Airoli' },
  { match: /\b(somaiya|kjsce)\b/i, official: 'K. J. Somaiya College of Engineering, Mumbai' },
  { match: /\b(dj\s*sanghvi|djsce)\b/i, official: 'Dwarkadas J. Sanghvi College of Engineering, Mumbai' },
  { match: /\b(thadomal|tsec)\b/i, official: 'Thadomal Shahani Engineering College, Mumbai' },
  { match: /\b(thakur|tcet)\b/i, official: 'Thakur College of Engineering and Technology, Mumbai' },
  { match: /\b(atharva\s*college|ace\s*malad)\b/i, official: 'Atharva College of Engineering, Mumbai' },
  { match: /\b(fr\s*agnel|fcrit|frcrce)\b/i, official: 'Fr. Conceicao Rodrigues College of Engineering, Mumbai' },
  { match: /\b(vjti|v\.j\.t\.i)\b/i, official: 'Veermata Jijabai Technological Institute (VJTI), Mumbai' },
  { match: /\b(spit|s\.p\.i\.t|sardar\s*patel)\b/i, official: 'Sardar Patel Institute of Technology (SPIT), Mumbai' },
  { match: /\b(bharati\s*vidyapeeth|bvp|bvdu)\b/i, official: 'Bharati Vidyapeeth Deemed University (BVDU), Pune' },
  { match: /\b(symbiosis|sit\s*pune)\b/i, official: 'Symbiosis Institute of Technology (SIT), Pune' },
  { match: /\b(sppu|pune\s*university|unipune)\b/i, official: 'Savitribai Phule Pune University (SPPU)' }
]

// Domain keyword matchers
const DOMAIN_RULES = [
  {
    domain: 'Full Stack Development',
    keywords: /\b(java\s*full\s*stack|full\s*stack|fullstack|mern|mean|spring\s*boot|django|laravel|asp\.net|fastapi|backend\s*and\s*frontend)\b/i
  },
  {
    domain: 'AI & Machine Learning',
    keywords: /\b(ai|ml|machine\s*learning|deep\s*learning|artificial\s*intelligence|neural|nlp|computer\s*vision|tensorflow|pytorch|opencv|generative\s*ai|llm)\b/i
  },
  {
    domain: 'Data Science',
    keywords: /\b(data\s*science|data\s*analyst|data\s*analytics|analytics|big\s*data|power\s*bi|tableau|pandas|numpy|data\s*engineering|sql\s*developer)\b/i
  },
  {
    domain: 'Cloud & DevOps',
    keywords: /\b(cloud|devops|aws|azure|gcp|docker|kubernetes|ci\/cd|terraform|linux\s*admin|sysadmin)\b/i
  },
  {
    domain: 'Cybersecurity',
    keywords: /\b(cyber|security|ethical\s*hacking|infosec|network\s*security|penetration\s*testing|pen\s*testing|kali|soc)\b/i
  },
  {
    domain: 'Mobile App Development',
    keywords: /\b(android|ios|flutter|react\s*native|kotlin|swift|mobile\s*app|app\s*development)\b/i
  },
  {
    domain: 'Business Development & Sales',
    keywords: /\b(bda|business\s*development|sales|marketing|inside\s*sales|lead\s*gen|outreach|calling|telecalling|client\s*relation|counselor|admission)\b/i
  },
  {
    domain: 'UI/UX Design',
    keywords: /\b(ui|ux|ui\/ux|figma|user\s*interface|user\s*experience|wireframing|prototyping|graphic\s*design)\b/i
  },
  {
    domain: 'Web Development',
    keywords: /\b(web\s*dev|web\s*development|frontend|html|css|javascript|react|vue|angular|node|php|wordpress|bootstrap|tailwind)\b/i
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
  let digits = String(raw).replace(/\D/g, '')

  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1)
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2)
  }

  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    const formatted = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
    return { formatted, clean: digits }
  }

  if (digits.length === 10) {
    return { formatted: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`, clean: digits }
  }

  return { formatted: raw.trim(), clean: digits }
}

/**
 * Standardize College Name using map and intelligent heuristics
 */
export const standardizeCollege = (raw) => {
  if (!raw || typeof raw !== 'string') return 'Independent / Unspecified College'
  let cleanRaw = raw.trim().replace(/^[:\s,-]+|[:\s,-]+$/g, '')
  if (!cleanRaw || /^n\/?a$/i.test(cleanRaw) || /^none$/i.test(cleanRaw)) {
    return 'Independent / Unspecified College'
  }

  for (const item of COLLEGE_MAP) {
    if (item.match.test(cleanRaw)) {
      return item.official
    }
  }

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

  // Header line detection
  if (/^(name|candidate|sr\s*no|id|first\s*name|student)[,\t|]/i.test(line)) {
    return null
  }

  let email = ''
  let rawPhone = ''
  let domain = 'Web Development'
  let college = ''
  let name = ''

  // 1. Extract Email
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
  const emailMatch = line.match(emailRegex)
  if (emailMatch) {
    email = emailMatch[1].toLowerCase().trim()
  }

  // 2. Extract Mobile
  const phoneRegex = /(?:\+?91[\s.-]?)?(?:0)?([6-9]\d{9}|[6-9]\d{4}[\s.-]?\d{5})\b/
  const phoneMatch = line.match(phoneRegex)
  if (phoneMatch) {
    rawPhone = phoneMatch[0]
  }

  // 3. Detect Domain early from full raw line
  for (const rule of DOMAIN_RULES) {
    if (rule.keywords.test(line)) {
      domain = rule.domain
      break
    }
  }

  // 4. Check if line has key-value pairs (e.g. "Name: ... College: ...")
  const hasKV = /(?:name|candidate|student|full\s*name|college|clg|institute|mobile|phone|email)\s*[:=]/i.test(line)
  if (hasKV) {
    const nameMatch = line.match(/(?:name|candidate|student|full\s*name)\s*[:=]\s*([^,;|]+)/i)
    if (nameMatch) name = nameMatch[1].trim()

    const colMatch = line.match(/(?:college|clg|institute|univ|campus|school|academy)\s*[:=]\s*([^,;|]+)/i)
    if (colMatch) college = standardizeCollege(colMatch[1].trim())
  }

  // 5. If not resolved via KV, check if delimited with \t or |
  if (!name && (line.includes('\t') || line.includes('|'))) {
    const delim = line.includes('\t') ? '\t' : '|'
    const parts = line.split(delim).map(p => p.trim()).filter(Boolean)
    
    for (const part of parts) {
      if (emailRegex.test(part) || phoneRegex.test(part)) continue
      
      // Is college?
      const isCol = COLLEGE_MAP.some(m => m.match.test(part)) ||
        /\b(college|institute|university|polytechnic|engineering|academy|vidyapeeth)\b/i.test(part)
      if (isCol && !college) {
        college = standardizeCollege(part)
        continue
      }

      // Is name? (2-4 words, mostly letters, doesn't match session/timing/domain/degree)
      const isSession = /(?:session|batch|\d{1,2}:\d{2})/i.test(part)
      const isDegree = /\b(graduated|pursuing|passout|be|btech|mtech|bca|mca|entc|cse|it|mech|civil)\b/i.test(part)
      const isDom = DOMAIN_RULES.some(d => d.keywords.test(part))
      if (!isSession && !isDegree && !isDom && !name) {
        const words = part.split(/\s+/).filter(w => /^[a-zA-Z.]{2,}$/.test(w))
        if (words.length >= 2 && words.length <= 4) {
          name = words.join(' ')
        }
      }
    }
  }

  // 6. Free-Form Unstructured Fallback
  if (!name || !college) {
    let working = line

    // Strip email and phone
    if (emailMatch) working = working.replace(emailMatch[0], ' ')
    if (phoneMatch) working = working.replace(phoneMatch[0], ' ')

    // Strip session and timing patterns, e.g. "Afternoon Session (2:00 Pm - 3:00 Pm)" or "(2:00 Pm - 3:00 Pm)"
    working = working.replace(/(?:morning|afternoon|evening|night)?\s*(?:session|batch)?\s*\(?\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*(?:-|–|to)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*\)?/gi, ' ')
    working = working.replace(/\b(morning|afternoon|evening|night)\s*(?:session|batch)?\b/gi, ' ')

    // Strip language
    working = working.replace(/\b(english(?:\s*medium)?|hindi|marathi)\b/gi, ' ')

    // Strip domain keywords
    for (const rule of DOMAIN_RULES) {
      working = working.replace(rule.keywords, ' ')
    }

    // Strip degree, branch, year & status words
    working = working.replace(/\b(graduated|pursuing|passout|passed\s*out|final\s*year|third\s*year|second\s*year|first\s*year|b\.?e\.?|b\.?tech\.?|m\.?tech\.?|b\.?sc\.?|m\.?sc\.?|bca|mca|diploma|polytechnic|hsc|ssc|202[0-9]|entc|e&tc|extc|cse|it|mech|mechanical|civil|electrical|electronics|ai\s*&\s*ds|aids|aiml)\b/gi, ' ')

    // Clean punctuation and multiple spaces
    working = working.replace(/[,;|/\\()\[\]{}:=-]/g, ' ').replace(/\s+/g, ' ').trim()

    // Check COLLEGE_MAP first in working string
    let matchedItem = null
    let matchIdx = -1
    for (const item of COLLEGE_MAP) {
      const m = working.match(item.match)
      if (m) {
        matchedItem = item
        matchIdx = m.index
        break
      }
    }

    if (matchedItem && matchIdx >= 0) {
      if (!college) college = matchedItem.official
      // Everything before the college match is the candidate's name!
      const namePart = working.slice(0, matchIdx).trim()
      const words = namePart.split(/\s+/).filter(w => /^[a-zA-Z.]{1,}$/.test(w))
      if (words.length >= 2) {
        name = words.slice(0, 4).join(' ')
      } else if (words.length === 1) {
        name = words[0]
      }
    }

    // If still not resolved, look for college anchor word in working string
    if (!name || !college) {
      const anchorMatch = working.match(/\b(college|institute|university|polytechnic|academy|vidyapeeth)\b/i)
      if (anchorMatch) {
        const anchorIdx = anchorMatch.index
        const beforeAnchor = working.slice(0, anchorIdx).trim()
        const afterAnchor = working.slice(anchorIdx).trim()

        const beforeWords = beforeAnchor.split(/\s+/).filter(w => /^[a-zA-Z.]{1,}$/.test(w))
        let nameWords = []
        let colPrefixWords = []

        if (beforeWords.length <= 2) {
          nameWords = beforeWords
          colPrefixWords = []
        } else if (beforeWords.length === 3) {
          // Check if 3rd word looks like college acronym or short token
          const lastBefore = beforeWords[2].toLowerCase()
          if (lastBefore.length <= 5 && /^[A-Z0-9]+$/i.test(beforeWords[2])) {
            nameWords = beforeWords.slice(0, 2)
            colPrefixWords = beforeWords.slice(2)
          } else {
            nameWords = beforeWords
            colPrefixWords = []
          }
        } else if (beforeWords.length === 4) {
          // e.g. "Khatal Omkar Mohan Svpm" + College -> name = first 3, college prefix = Svpm
          nameWords = beforeWords.slice(0, 3)
          colPrefixWords = beforeWords.slice(3)
        } else if (beforeWords.length >= 5) {
          // e.g. "Vaibhav Sonaji Kudal Sharadchandra Pawar" + College -> name = first 3, college prefix = remaining
          nameWords = beforeWords.slice(0, 3)
          colPrefixWords = beforeWords.slice(3)
        }

        if (!name && nameWords.length > 0) {
          name = nameWords.join(' ')
        }

        if (!college) {
          const rawCol = [...colPrefixWords, afterAnchor].join(' ').trim()
          college = standardizeCollege(rawCol)
        }
      }
    }

    // Final fallback for name if still missing
    if (!name) {
      const tokens = working.split(/\s+/).filter(w => /^[a-zA-Z.]{1,}$/.test(w))
      name = tokens.slice(0, 3).join(' ')
    }
  }

  const { formatted: mobile, clean: cleanMobile } = formatIndianMobile(rawPhone)

  if (!name || name.length < 2) {
    if (email) {
      name = toTitleCase(email.split('@')[0].replace(/[._0-9]/g, ' ').trim()) || 'Prospective Lead'
    } else {
      name = 'Prospective Student'
    }
  } else {
    name = toTitleCase(name)
  }

  if (!college) {
    college = 'Independent / Unspecified College'
  }

  const missingFields = []
  if (!cleanMobile) missingFields.push('mobile')
  if (!email) missingFields.push('email')
  if (!college || college === 'Independent / Unspecified College') missingFields.push('college')

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
    lines = inputData.map(item => {
      if (typeof item === 'string') return item
      if (typeof item === 'object' && item !== null) {
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

  for (const rawLine of lines) {
    const parsed = parseRawEntity(rawLine)
    if (!parsed) continue

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
      continue
    }

    if (parsed.cleanMobile) seenMobiles.add(parsed.cleanMobile)
    if (parsed.email) seenEmails.add(parsed.email)

    parsedRecords.push(parsed)
  }

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
