const express = require('express')
const router = express.Router({ mergeParams: true })
const {
  createIssue,
  getIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  addComment,
  updateIssueStatus
} = require('../controllers/issueController')
const { protect } = require('../middleware/auth')

// All routes protected
router.use(protect)

router.route('/')
  .get(getIssues)
  .post(createIssue)

router.route('/:issueId')
  .get(getIssue)
  .put(updateIssue)
  .delete(deleteIssue)

router.patch('/:issueId/status', updateIssueStatus)
router.post('/:issueId/comments', addComment)

module.exports = router