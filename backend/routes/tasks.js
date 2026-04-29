const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

router.use(protect);

// Helper: check if user has access to the project
const hasProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const isMember = project.owner.equals(userId) ||
    project.members.some(m => m.user.equals(userId));
  return isMember ? project : null;
};

// GET /api/tasks - Get all tasks for current user (across projects)
router.get('/', async (req, res) => {
  try {
    // Find all projects the user belongs to
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    }).select('_id');

    const projectIds = projects.map(p => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks.', error: error.message });
  }
});

// GET /api/tasks/project/:projectId - Get tasks for a specific project
router.get('/project/:projectId', async (req, res) => {
  try {
    const project = await hasProjectAccess(req.params.projectId, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied or project not found.' });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks.', error: error.message });
  }
});

// POST /api/tasks - Create a task
router.post('/', async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and project ID are required.' });
    }

    const project = await hasProjectAccess(projectId, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied or project not found.' });

    // Only admins/project owners can create tasks
    const isAdmin = project.owner.equals(req.user._id) ||
      project.members.some(m => m.user.equals(req.user._id) && m.role === 'admin') ||
      req.user.role === 'admin';

    if (!isAdmin) return res.status(403).json({ message: 'Only admins can create tasks.' });

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate || null
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task.', error: error.message });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const project = await hasProjectAccess(task.project, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied.' });

    const isAdmin = project.owner.equals(req.user._id) ||
      project.members.some(m => m.user.equals(req.user._id) && m.role === 'admin') ||
      req.user.role === 'admin';

    const isAssignee = task.assignedTo && task.assignedTo.equals(req.user._id);

    // Members can only update status of their own tasks
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you.' });
    }

    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    if (isAdmin) {
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority) task.priority = priority;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (dueDate !== undefined) task.dueDate = dueDate;
    }

    // Both admin and assignee can update status
    if (status) task.status = status;

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task.', error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const project = await hasProjectAccess(task.project, req.user._id);
    if (!project) return res.status(403).json({ message: 'Access denied.' });

    const isAdmin = project.owner.equals(req.user._id) ||
      project.members.some(m => m.user.equals(req.user._id) && m.role === 'admin') ||
      req.user.role === 'admin';

    if (!isAdmin) return res.status(403).json({ message: 'Only admins can delete tasks.' });

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task.', error: error.message });
  }
});

module.exports = router;
