const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function signup(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const hashed = await bcrypt.hash(password, 10);

  // First user becomes ADMIN automatically
  const count = await prisma.user.count();
  const assignedRole = count === 0 ? 'ADMIN' : (role === 'ADMIN' ? 'ADMIN' : 'MEMBER');

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: assignedRole },
    select: { id: true, name: true, email: true, role: true },
  });

  res.status(201).json({ token: signToken(user.id), user });
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const { password: _, ...safeUser } = user;
  res.json({ token: signToken(user.id), user: safeUser });
}

async function me(req, res) {
  const { password: _, ...safeUser } = req.user;
  res.json(safeUser);
}

module.exports = { signup, login, me };
