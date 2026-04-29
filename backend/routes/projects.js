const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET /api/projects - Get all projects for the current user
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects.', error: error.message });
  }
});

// POST /api/projects - Create a new project (admin only)
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create projects.' });
    }

    const { name, description, dueDate } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required.' });

    const project = await Project.create({
      name,
      description,
      dueDate,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await project.populate('owner', 'name email');
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project.', error: error.message });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const isMember = project.owner.equals(req.user._id) ||
      project.members.some(m => m.user._id.equals(req.user._id));

    if (!isMember) return res.status(403).json({ message: 'Access denied.' });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project.', error: error.message });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const isAdmin = project.owner.equals(req.user._id) ||
      project.members.some(m => m.user.equals(req.user._id) && m.role === 'admin');

    if (!isAdmin) return res.status(403).json({ message: 'Only project admins can update this project.' });

    const { name, description, status, dueDate } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (dueDate !== undefined) project.dueDate = dueDate;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members.user', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update project.', error: error.message });
  }
});

// POST /api/projects/:id/members - Add member to project
router.post('/:id/members', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const isOwner = project.owner.equals(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the project owner can add members.' });
    }

    const { userId, role } = req.body;
    const alreadyMember = project.members.some(m => m.user.equals(userId));
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member.' });

    project.members.push({ user: userId, role: role || 'member' });
    await project.save();
    await project.populate('members.user', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add member.', error: error.message });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the project owner can delete it.' });
    }

    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: 'Project and all its tasks deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project.', error: error.message });
  }
});

module.exports = router;
