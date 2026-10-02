import fs from 'fs'
import path from 'path'

export const saveBase64File = (base64String, destDir = 'uploads') => {
  if (!base64String) return null
  
  // Format: data:application/pdf;base64,JVBER...
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 string format')
  }
  
  const fileType = matches[1] // e.g. 'application/pdf' or 'image/png'
  const base64Data = matches[2]
  const buffer = Buffer.from(base64Data, 'base64')
  
  // Get file extension
  let ext = ''
  if (fileType === 'application/pdf') ext = '.pdf'
  else if (fileType === 'image/png') ext = '.png'
  else if (fileType === 'image/jpeg' || fileType === 'image/jpg') ext = '.jpg'
  else {
    throw new Error('Unsupported file type. Only PDF, PNG, and JPG/JPEG are allowed.')
  }
  
  // Create unique filename
  const filename = `attachment_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`
  
  // Create destination directory if not exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }
  
  const destPath = path.join(destDir, filename)
  fs.writeFileSync(destPath, buffer)
  
  // Return the relative URL path
  return `/uploads/${filename}`
}
