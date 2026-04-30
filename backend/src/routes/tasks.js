const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { createTask, updateTask, deleteTask, getMyTasks, getDashboard } = require('../controllers/tasks');

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/my', getMyTasks);

router.post('/',
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
  createTask
);

router.put('/:id',
  body('title').optional().trim().notEmpty(),
  updateTask
);

router.delete('/:id', deleteTask);

module.exports = router;
