import { Router } from 'express'
import { sendHiHandler } from '../controllers/testController.js'

const router = Router()

router.get('/test', sendHiHandler)

export default router

