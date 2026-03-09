const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const connectDB = require('./config/database')
const errorHandler = require('./middleware/errorHandler')
const logger = require('./utils/logger')
const { apiLimiter } = require('./middleware/rateLimiter')

const healthRoutes = require('./routes/health')
const testRoutes = require('./routes/test')
const authRoutes = require('./routes/auth')
const projectRoutes = require('./routes/projects')
const issueRoutes = require('./routes/issues')
const sprintRoutes = require('./routes/sprints')

const app = express()

connectDB()

app.use(helmet())
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.CLIENT_URL,
      'https://flowdesk-frontend-iota.vercel.app',
      'https://flowdesk-frontend-vanishaa08s-projects.vercel.app'
    ].filter(Boolean)

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use('/api', apiLimiter)
app.use('/health', healthRoutes)
app.use('/api/test', testRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/projects/:projectId/issues', issueRoutes)
app.use('/api/projects/:projectId/sprints', sprintRoutes)

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use(errorHandler)

module.exports = app