const express = require('express')
const router = express.Router()
const { register, login, getMe, logout } = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter')
const validate = require('../middleware/validate')
const { registerValidation, loginValidation } = require('../validations/authValidation')

router.post('/register', registerLimiter, registerValidation, validate, register)
router.post('/login', loginLimiter, loginValidation, validate, login)
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)

module.exports = router
