const mongoose = require('mongoose')

const sprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sprint name is required'],
    trim: true,
    maxlength: [100, 'Sprint name cannot exceed 100 characters']
  },
  goal: {
    type: String,
    trim: true,
    maxlength: [500, 'Sprint goal cannot exceed 500 characters'],
    default: ''
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed'],
    default: 'planned'
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  issues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Index for faster queries
sprintSchema.index({ project: 1, status: 1 })

module.exports = mongoose.model('Sprint', sprintSchema)