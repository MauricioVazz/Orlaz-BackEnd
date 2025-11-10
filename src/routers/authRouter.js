import express from 'express'
import { loginController } from '../controller/auth/loginController.js'

const router = express.Router()

router.post('/login', loginController)

export default router