const express = require('express')
const router = express.Router({ mergeParams: true })
const {
  createSprint,
  getSprints,
  getSprint,
  updateSprint,
  startSprint,
  completeSprint,
  addIssueToSprint,
  removeIssueFromSprint,
  deleteSprint,
  getBurndownData
} = require('../controllers/sprintController')
const { protect } = require('../middleware/auth')

router.use(protect)

router.route('/')
  .get(getSprints)
  .post(createSprint)

router.route('/:sprintId')
  .get(getSprint)
  .put(updateSprint)
  .delete(deleteSprint)

router.patch('/:sprintId/start', startSprint)
router.patch('/:sprintId/complete', completeSprint)
router.post('/:sprintId/issues', addIssueToSprint)
router.delete('/:sprintId/issues/:issueId', removeIssueFromSprint)
router.get('/:sprintId/burndown', getBurndownData)

module.exports = router