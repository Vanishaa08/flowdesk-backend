const Project = require('../models/Project');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// @desc    Create project
// @route   POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, key, description, icon } = req.body;

    // Check if key already exists for this user
    const existingProject = await Project.findOne({
      key: key?.toUpperCase(),
      owner: req.user._id
    });

    if (existingProject) {
      throw new ApiError(400, 'Project key already exists. Please choose a different key.');
    }

    const project = await Project.create({
      name,
      key: key?.toUpperCase(),
      description,
      icon: icon || '📋',
      owner: req.user._id
    });

    // Populate owner details
    await project.populate('owner', 'name email avatar');

    logger.info(`Project created: ${name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for logged in user
// @route   GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ],
      status: 'active'
    })
    .populate('owner', 'name email avatar')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Check if user has access
    const isMember = project.members.some(
      m => m.user._id.toString() === req.user._id.toString()
    );
    const isOwner = project.owner._id.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      throw new ApiError(403, 'Not authorized to access this project');
    }

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const { name, description, icon, status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Only owner can update
    if (project.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Only project owner can update project');
    }

    project.name = name || project.name;
    project.description = description ?? project.description;
    project.icon = icon || project.icon;
    project.status = status || project.status;

    await project.save();
    await project.populate('owner', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Only owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Only project owner can delete project');
    }

    await project.deleteOne();

    logger.info(`Project deleted: ${project.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
};