const express = require('express')
const router = express.Router()
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController')
const { protect } = require('../middleware/auth')

// All project routes are protected
router.use(protect)

router.route('/')
  .get(getProjects)
  .post(createProject)

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject)

module.exports = router