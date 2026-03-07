const Sprint = require('../models/Sprint')
const Issue = require('../models/Issue')
const Project = require('../models/Project')
const { ApiError } = require('../middleware/errorHandler')
const logger = require('../utils/logger')

// @desc    Create sprint
// @route   POST /api/projects/:projectId/sprints
const createSprint = async (req, res, next) => {
  try {
    const { name, goal, startDate, endDate } = req.body
    const { projectId } = req.params

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, 'Project not found')

    // Check only one active sprint at a time
    const activeSprint = await Sprint.findOne({ project: projectId, status: 'active' })
    if (activeSprint && req.body.status === 'active') {
      throw new ApiError(400, 'A sprint is already active. Complete it before starting a new one.')
    }

    // Get order
    const lastSprint = await Sprint.findOne({ project: projectId }).sort({ order: -1 })
    const order = lastSprint ? lastSprint.order + 1 : 0

    const sprint = await Sprint.create({
      name,
      goal,
      project: projectId,
      startDate: startDate || null,
      endDate: endDate || null,
      order
    })

    logger.info(`Sprint created: ${name} in project ${projectId}`)

    res.status(201).json({
      success: true,
      message: 'Sprint created successfully',
      sprint
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all sprints for a project
// @route   GET /api/projects/:projectId/sprints
const getSprints = async (req, res, next) => {
  try {
    const { projectId } = req.params

    const sprints = await Sprint.find({ project: projectId })
      .populate({
        path: 'issues',
        populate: [
          { path: 'assignee', select: 'name email avatar' },
          { path: 'reporter', select: 'name email avatar' }
        ]
      })
      .sort({ order: 1, createdAt: -1 })

    res.status(200).json({
      success: true,
      count: sprints.length,
      sprints
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single sprint
// @route   GET /api/projects/:projectId/sprints/:sprintId
const getSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.sprintId)
      .populate({
        path: 'issues',
        populate: [
          { path: 'assignee', select: 'name email avatar' },
          { path: 'reporter', select: 'name email avatar' }
        ]
      })

    if (!sprint) throw new ApiError(404, 'Sprint not found')

    res.status(200).json({ success: true, sprint })
  } catch (error) {
    next(error)
  }
}

// @desc    Update sprint
// @route   PUT /api/projects/:projectId/sprints/:sprintId
const updateSprint = async (req, res, next) => {
  try {
    const { name, goal, startDate, endDate } = req.body

    const sprint = await Sprint.findById(req.params.sprintId)
    if (!sprint) throw new ApiError(404, 'Sprint not found')

    if (name) sprint.name = name
    if (goal !== undefined) sprint.goal = goal
    if (startDate !== undefined) sprint.startDate = startDate
    if (endDate !== undefined) sprint.endDate = endDate

    await sprint.save()

    res.status(200).json({
      success: true,
      message: 'Sprint updated successfully',
      sprint
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Start sprint
// @route   PATCH /api/projects/:projectId/sprints/:sprintId/start
const startSprint = async (req, res, next) => {
  try {
    const { projectId, sprintId } = req.params

    // Check no other active sprint
    const activeSprint = await Sprint.findOne({
      project: projectId,
      status: 'active'
    })
    if (activeSprint) {
      throw new ApiError(400, 'Another sprint is already active. Complete it first.')
    }

    const sprint = await Sprint.findById(sprintId)
    if (!sprint) throw new ApiError(404, 'Sprint not found')
    if (sprint.status !== 'planned') {
      throw new ApiError(400, 'Only planned sprints can be started')
    }

    sprint.status = 'active'
    sprint.startDate = sprint.startDate || new Date()
    if (!sprint.endDate) {
      // Default 2 weeks
      const end = new Date()
      end.setDate(end.getDate() + 14)
      sprint.endDate = end
    }
    await sprint.save()

    logger.info(`Sprint started: ${sprint.name}`)

    res.status(200).json({
      success: true,
      message: `Sprint "${sprint.name}" started!`,
      sprint
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Complete sprint
// @route   PATCH /api/projects/:projectId/sprints/:sprintId/complete
const completeSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.sprintId)
      .populate('issues')

    if (!sprint) throw new ApiError(404, 'Sprint not found')
    if (sprint.status !== 'active') {
      throw new ApiError(400, 'Only active sprints can be completed')
    }

    // Count completed vs incomplete issues
    const completedIssues = sprint.issues.filter(i => i.status === 'done').length
    const incompleteIssues = sprint.issues.filter(i => i.status !== 'done').length

    sprint.status = 'completed'
    sprint.completedAt = new Date()
    await sprint.save()

    logger.info(`Sprint completed: ${sprint.name}`)

    res.status(200).json({
      success: true,
      message: `Sprint "${sprint.name}" completed!`,
      summary: {
        totalIssues: sprint.issues.length,
        completedIssues,
        incompleteIssues
      },
      sprint
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Add issue to sprint
// @route   POST /api/projects/:projectId/sprints/:sprintId/issues
const addIssueToSprint = async (req, res, next) => {
  try {
    const { issueId } = req.body
    const { sprintId } = req.params

    const sprint = await Sprint.findById(sprintId)
    if (!sprint) throw new ApiError(404, 'Sprint not found')

    const issue = await Issue.findById(issueId)
    if (!issue) throw new ApiError(404, 'Issue not found')

    // Check not already in sprint
    if (sprint.issues.includes(issueId)) {
      throw new ApiError(400, 'Issue already in this sprint')
    }

    sprint.issues.push(issueId)
    await sprint.save()

    res.status(200).json({
      success: true,
      message: 'Issue added to sprint',
      sprint
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Remove issue from sprint
// @route   DELETE /api/projects/:projectId/sprints/:sprintId/issues/:issueId
const removeIssueFromSprint = async (req, res, next) => {
  try {
    const { sprintId, issueId } = req.params

    const sprint = await Sprint.findById(sprintId)
    if (!sprint) throw new ApiError(404, 'Sprint not found')

    sprint.issues = sprint.issues.filter(i => i.toString() !== issueId)
    await sprint.save()

    res.status(200).json({
      success: true,
      message: 'Issue removed from sprint',
      sprint
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete sprint
// @route   DELETE /api/projects/:projectId/sprints/:sprintId
const deleteSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.sprintId)
    if (!sprint) throw new ApiError(404, 'Sprint not found')

    if (sprint.status === 'active') {
      throw new ApiError(400, 'Cannot delete an active sprint. Complete it first.')
    }

    await sprint.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Sprint deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createSprint,
  getSprints,
  getSprint,
  updateSprint,
  startSprint,
  completeSprint,
  addIssueToSprint,
  removeIssueFromSprint,
  deleteSprint
}