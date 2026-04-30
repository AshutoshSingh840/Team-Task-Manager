const prisma = require('../lib/prisma');

async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { name: 'asc' },
  });
  res.json(users);
}

async function updateUserRole(req, res) {
  const { role } = req.body;
  if (!['ADMIN', 'MEMBER'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'Cannot change your own role' });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  res.json(user);
}

module.exports = { listUsers, updateUserRole };
