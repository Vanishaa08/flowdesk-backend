const mongoose = require('mongoose');

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
  order: {
    type: Number,
    default: 0
  },
  dueDate: {
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

// Indexes for faster queries
issueSchema.index({ project: 1, status: 1 })
issueSchema.index({ project: 1, assignee: 1 })
issueSchema.index({ project: 1, priority: 1 })

module.exports = mongoose.model('Issue', issueSchema)