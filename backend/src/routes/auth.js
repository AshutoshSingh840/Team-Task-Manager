const router = require('express').Router();
const { body } = require('express-validator');
const { signup, login, me } = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

router.post('/signup',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  signup
);

router.post('/login',
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  login
);

router.get('/me', authenticate, me);

module.exports = router;
