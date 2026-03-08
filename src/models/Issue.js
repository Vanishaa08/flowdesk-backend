const mongoose = require('mongoose')

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'in_review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['bug', 'feature', 'task', 'improvement'],
    default: 'task'
  },
  storyPoints: {
    type: Number,
    enum: [0, 1, 2, 3, 5, 8, 13, 21],
    default: 0
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    url: String,
    publicId: String,
    name: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
})

issueSchema.index({ project: 1, status: 1 })
issueSchema.index({ project: 1, assignee: 1 })
issueSchema.index({ project: 1, sprint: 1 })

// Auto set completedAt when status changes to done
issueSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date()
    } else if (this.status !== 'done') {
      this.completedAt = null
    }
  }
  next()
})

module.exports = mongoose.model('Issue', issueSchema)