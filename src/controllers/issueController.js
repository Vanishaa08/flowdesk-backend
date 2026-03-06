const Issue = require('../models/Issue');
const Project = require('../models/Project');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// @desc    Create issue
// @route   POST /api/projects/:projectId/issues
const createIssue = async (req, res, next) => {
  try {
    const { title, description, status, priority, type, assignee, dueDate } = req.body;
    const { projectId } = req.params;

    // Check project exists
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, 'Project not found');

    // Check user is member
    const isMember = project.members.some(
      m => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) throw new ApiError(403, 'Not a member of this project');

    // Get order (put at end of status column)
    const lastIssue = await Issue.findOne({ project: projectId, status: status || 'todo' })
      .sort({ order: -1 });
    const order = lastIssue ? lastIssue.order + 1 : 0;

    const issue = await Issue.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      type: type || 'task',
      project: projectId,
      reporter: req.user._id,
      assignee: assignee || null,
      dueDate: dueDate || null,
      order
    });

    // Update project issue count
    await Project.findByIdAndUpdate(projectId, { $inc: { issueCount: 1 } });

    await issue.populate('reporter', 'name email avatar');
    await issue.populate('assignee', 'name email avatar');

    logger.info(`Issue created: ${title} in project ${projectId}`);

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      issue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all issues for a project
// @route   GET /api/projects/:projectId/issues
const getIssues = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assignee, type } = req.query;

    // Check project exists
    const project = await Project.findById(projectId);
    if (!project) throw new ApiError(404, 'Project not found');

    // Build filter
    const filter = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (type) filter.type = type;

    const issues = await Issue.find(filter)
      .populate('reporter', 'name email avatar')
      .populate('assignee', 'name email avatar')
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      issues
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single issue
// @route   GET /api/projects/:projectId/issues/:issueId
const getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.issueId)
      .populate('reporter', 'name email avatar')
      .populate('assignee', 'name email avatar')
      .populate('comments.user', 'name email avatar');

    if (!issue) throw new ApiError(404, 'Issue not found');

    res.status(200).json({ success: true, issue });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue
// @route   PUT /api/projects/:projectId/issues/:issueId
const updateIssue = async (req, res, next) => {
  try {
    const { title, description, status, priority, type, assignee, dueDate, order } = req.body;

    const issue = await Issue.findById(req.params.issueId);
    if (!issue) throw new ApiError(404, 'Issue not found');

    // Update fields
    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (status !== undefined) issue.status = status;
    if (priority !== undefined) issue.priority = priority;
    if (type !== undefined) issue.type = type;
    if (assignee !== undefined) issue.assignee = assignee;
    if (dueDate !== undefined) issue.dueDate = dueDate;
    if (order !== undefined) issue.order = order;

    await issue.save();
    await issue.populate('reporter', 'name email avatar');
    await issue.populate('assignee', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      issue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete issue
// @route   DELETE /api/projects/:projectId/issues/:issueId
const deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) throw new ApiError(404, 'Issue not found');

    // Only reporter can delete
    if (issue.reporter.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Only issue reporter can delete this issue');
    }

    await issue.deleteOne();

    // Update project issue count
    await Project.findByIdAndUpdate(req.params.projectId, { $inc: { issueCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to issue
// @route   POST /api/projects/:projectId/issues/:issueId/comments
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) throw new ApiError(400, 'Comment text is required');

    const issue = await Issue.findById(req.params.issueId);
    if (!issue) throw new ApiError(404, 'Issue not found');

    issue.comments.push({ user: req.user._id, text });
    await issue.save();
    await issue.populate('comments.user', 'name email avatar');

    const newComment = issue.comments[issue.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added',
      comment: newComment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue status (for Kanban drag and drop)
// @route   PATCH /api/projects/:projectId/issues/:issueId/status
const updateIssueStatus = async (req, res, next) => {
  try {
    const { status, order } = req.body;

    const issue = await Issue.findById(req.params.issueId);
    if (!issue) throw new ApiError(404, 'Issue not found');

    issue.status = status;
    if (order !== undefined) issue.order = order;
    await issue.save();

    await issue.populate('reporter', 'name email avatar');
    await issue.populate('assignee', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Issue status updated',
      issue
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  addComment,
  updateIssueStatus
};