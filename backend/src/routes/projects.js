const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  listProjects, createProject, getProject,
  updateProject, deleteProject, addMember, removeMember,
} = require('../controllers/projects');

router.use(authenticate);

router.get('/', listProjects);
router.post('/',
  body('name').trim().notEmpty().withMessage('Project name is required'),
  createProject
);
router.get('/:id', getProject);
router.put('/:id',
  body('name').trim().notEmpty().withMessage('Project name is required'),
  updateProject
);
router.delete('/:id', deleteProject);
router.post('/:id/members', body('userId').notEmpty(), addMember);
router.delete('/:projectId/members/:userId', removeMember);

module.exports = router;
