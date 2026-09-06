import { Router } from 'express'
import multer from 'multer'
import { extname } from 'path'
import { randomUUID } from 'crypto'
import { verifyAdmin } from '../middleware/auth.middleware'
import { getSupabase } from '../lib/supabase'

const router = Router()

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'product-images'

const ALLOWED = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.avif',
  '.svg',
])

// Capped below Vercel's 4.5 MB serverless request payload limit.
const MAX_SIZE_MB = 4
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase()
    if (!ALLOWED.has(ext)) {
      return cb(new Error(`File type ${ext} not allowed`))
    }
    cb(null, true)
  },
})

// POST /api/upload  (admin only) — expects multipart/form-data field "image"
router.post(
  '/',
  verifyAdmin,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' })
      }

      const ext = extname(req.file.originalname).toLowerCase()
      const key = `${Date.now()}-${randomUUID()}${ext}`

      const supabase = getSupabase()
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(key, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        })

      if (error) {
        console.error('Supabase upload error:', error)
        return res.status(500).json({ message: 'Upload failed' })
      }

      const { data: publicUrl } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(data.path)

      res.status(201).json({
        url: publicUrl.publicUrl,
        path: data.path,
      })
    } catch (err: any) {
      if (err?.message?.includes('not allowed')) {
        return res.status(400).json({ message: err.message })
      }
      console.error('Upload route error:', err)
      res.status(500).json({ message: 'Server error' })
    }
  }
)

export default router