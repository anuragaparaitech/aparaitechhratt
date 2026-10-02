import express from 'express'
import { protect } from '../middleware/auth.js'
import { getMyDocuments, generateDocument } from '../controllers/documentController.js'

const router = express.Router()

router.use(protect)

router.get('/my-documents', getMyDocuments)
router.get('/generate/:docType', generateDocument)

export default router
