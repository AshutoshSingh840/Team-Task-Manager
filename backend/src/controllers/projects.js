const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

async function listProjects(req, res) {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  const projects = isAdmin
    ? await prisma.project.findMany({
        include: { owner: { select: { id: true, name: true, email: true } }, _count: { select: { tasks: true, members: true } } },
        orderBy: { createdAt: 'desc' },
      })
    : await prisma.project.findMany({
        where: { members: { some: { userId } } },
        include: { owner: { select: { id: true, name: true, email: true } }, _count: { select: { tasks: true, members: true } } },
        orderBy: { createdAt: 'desc' },
      });

  res.json(projects);
}

async function createProject(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, description } = req.body;
  const userId = req.user.id;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: userId,
      members: { create: { userId, role: 'ADMIN' } },
    },
    include: { owner: { select: { id: true, name: true, email: true } }, _count: { select: { tasks: true, members: true } } },
  });

  res.status(201).json(project);
}

async function getProject(req, res) {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) return res.status(404).json({ error: 'Project not found' });

  const isMember = project.members.some(m => m.userId === req.user.id);
  if (!isMember && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(project);
}

async function updateProject(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: req.user.id, projectId: project.id } },
  });

  if (req.user.role !== 'ADMIN' && (!member || member.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Only project admins can update' });
  }

  const updated = await prisma.project.update({
    where: { id: req.params.id },
    data: { name: req.body.name, description: req.body.description },
    include: { owner: { select: { id: true, name: true, email: true } }, _count: { select: { tasks: true, members: true } } },
  });

  res.json(updated);
}

async function deleteProject(req, res) {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (req.user.role !== 'ADMIN' && project.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Only the owner or admin can delete' });
  }

  await prisma.project.delete({ where: { id: req.params.id } });
  res.json({ message: 'Project deleted' });
}

async function addMember(req, res) {
  const { userId, role } = req.body;
  const projectId = req.params.id;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const requester = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: req.user.id, projectId } },
  });
  if (req.user.role !== 'ADMIN' && (!requester || requester.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Only project admins can add members' });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  const member = await prisma.projectMember.upsert({
    where: { userId_projectId: { userId, projectId } },
    update: { role: role || 'MEMBER' },
    create: { userId, projectId, role: role || 'MEMBER' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  res.json(member);
}

async function removeMember(req, res) {
  const { projectId, userId } = req.params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const requester = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: req.user.id, projectId } },
  });
  if (req.user.role !== 'ADMIN' && (!requester || requester.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Only project admins can remove members' });
  }

  await prisma.projectMember.delete({
    where: { userId_projectId: { userId, projectId } },
  });

  res.json({ message: 'Member removed' });
}

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject, addMember, removeMember };
