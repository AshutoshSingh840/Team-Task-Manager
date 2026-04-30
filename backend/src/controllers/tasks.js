const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

async function createTask(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, description, status, priority, dueDate, assigneeId, projectId } = req.body;

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: req.user.id, projectId } },
  });
  if (!member && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not a project member' });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
      assigneeId: assigneeId || null,
      creatorId: req.user.id,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  res.status(201).json(task);
}

async function updateTask(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: req.user.id, projectId: task.projectId } },
  });
  if (!member && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Not a project member' });
  }

  const { title, description, status, priority, dueDate, assigneeId } = req.body;

  const updated = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      creator: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  res.json(updated);
}

async function deleteTask(req, res) {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: req.user.id, projectId: task.projectId } },
  });
  const isProjectAdmin = member?.role === 'ADMIN';

  if (req.user.role !== 'ADMIN' && !isProjectAdmin && task.creatorId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to delete this task' });
  }

  await prisma.task.delete({ where: { id: req.params.id } });
  res.json({ message: 'Task deleted' });
}

async function getMyTasks(req, res) {
  const tasks = await prisma.task.findMany({
    where: { assigneeId: req.user.id },
    include: {
      project: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: 'asc' },
  });
  res.json(tasks);
}

async function getDashboard(req, res) {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'ADMIN';
  const now = new Date();

  const taskWhere = isAdmin ? {} : { assigneeId: userId };

  const [total, todo, inProgress, done, overdue] = await Promise.all([
    prisma.task.count({ where: taskWhere }),
    prisma.task.count({ where: { ...taskWhere, status: 'TODO' } }),
    prisma.task.count({ where: { ...taskWhere, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { ...taskWhere, status: 'DONE' } }),
    prisma.task.count({ where: { ...taskWhere, dueDate: { lt: now }, status: { not: 'DONE' } } }),
  ]);

  const recentTasks = await prisma.task.findMany({
    where: taskWhere,
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  const overdueTasks = await prisma.task.findMany({
    where: { ...taskWhere, dueDate: { lt: now }, status: { not: 'DONE' } },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: 'asc' },
    take: 5,
  });

  res.json({ stats: { total, todo, inProgress, done, overdue }, recentTasks, overdueTasks });
}

module.exports = { createTask, updateTask, deleteTask, getMyTasks, getDashboard };
