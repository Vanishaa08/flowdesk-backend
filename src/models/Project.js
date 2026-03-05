const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  key: {
    type: String,
    required: [true, 'Project key is required'],
    uppercase: true,
    trim: true,
    maxlength: [10, 'Project key cannot exceed 10 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  icon: {
    type: String,
    default: '📋'
  },
  issueCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Auto-generate key from name if not provided
projectSchema.pre('save', function(next) {
  if (!this.key) {
    this.key = this.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 4)
  }
  next()
})

// Add owner as admin member automatically
projectSchema.pre('save', function(next) {
  if (this.isNew) {
    const ownerAlreadyMember = this.members.some(
      m => m.user.toString() === this.owner.toString()
    )
    if (!ownerAlreadyMember) {
      this.members.push({ user: this.owner, role: 'admin' })
    }
  }
  next()
})

module.exports = mongoose.model('Project', projectSchema)