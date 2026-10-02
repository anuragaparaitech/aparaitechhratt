import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcApk = path.resolve(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk')
const destPublicApk = path.resolve(__dirname, '../public/aparaitech-hrms.apk')
const destDistApk = path.resolve(__dirname, '../dist/aparaitech-hrms.apk')

if (fs.existsSync(srcApk)) {
  const publicDir = path.resolve(__dirname, '../public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  fs.copyFileSync(srcApk, destPublicApk)
  const sizeMb = (fs.statSync(destPublicApk).size / 1024 / 1024).toFixed(2)
  console.log(`✅ Copied latest APK to ${destPublicApk} (${sizeMb} MB)`)
  
  const distDir = path.resolve(__dirname, '../dist')
  if (fs.existsSync(distDir)) {
    fs.copyFileSync(srcApk, destDistApk)
    console.log(`✅ Copied latest APK to ${destDistApk}`)
  }
} else {
  console.error(`❌ Source APK not found at: ${srcApk}`)
  process.exit(1)
}
