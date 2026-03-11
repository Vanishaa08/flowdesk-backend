const http = require('http')
const app = require('./src/app')
const { Server } = require('socket.io')
const logger = require('./src/utils/logger')
require('dotenv').config()

const PORT = process.env.PORT || 5000

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Socket.io connection
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`)

  // Join a project room
  socket.on('join_project', (projectId) => {
    socket.join(`project:${projectId}`)
    logger.info(`Socket ${socket.id} joined project:${projectId}`)
  })

  // Leave a project room
  socket.on('leave_project', (projectId) => {
    socket.leave(`project:${projectId}`)
    logger.info(`Socket ${socket.id} left project:${projectId}`)
  })

  // Issue moved on Kanban
  socket.on('issue_moved', (data) => {
    // Broadcast to everyone in the project room EXCEPT the sender
    socket.to(`project:${data.projectId}`).emit('issue_moved', data)
    logger.info(`Issue moved in project:${data.projectId}`)
  })

  // Issue created
  socket.on('issue_created', (data) => {
    socket.to(`project:${data.projectId}`).emit('issue_created', data)
  })

  // Issue updated
  socket.on('issue_updated', (data) => {
    socket.to(`project:${data.projectId}`).emit('issue_updated', data)
  })

  // Issue deleted
  socket.on('issue_deleted', (data) => {
    socket.to(`project:${data.projectId}`).emit('issue_deleted', data)
  })

  // User online in project
  socket.on('user_online', (data) => {
    socket.to(`project:${data.projectId}`).emit('user_online', data)
  })

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`)
  })
})

// Make io accessible in routes
app.set('io', io)

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`)
})