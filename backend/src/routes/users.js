const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { listUsers, updateUserRole } = require('../controllers/users');

router.use(authenticate);

router.get('/', listUsers);
router.patch('/:id/role', requireAdmin, updateUserRole);

module.exports = router;
