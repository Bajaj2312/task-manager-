import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ProjectDetailPage.css';

const TaskModal = ({ task, project, users, onClose, onSave }) => {
  const [form, setForm] = useState(task || {
    title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'todo'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const isAdmin = user.role === 'admin' || project.owner?._id === user._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (task) {
        res = await api.put(`/tasks/${task._id}`, form);
      } else {
        res = await api.post('/tasks', { ...form, projectId: project._id });
      }
      onSave(res.data, !!task);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  const projectMembers = project.members?.map(m => m.user) || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          {isAdmin && (
            <>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="Task title" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} placeholder="Optional description"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select className="form-input" value={form.assignedTo}
                    onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                    <option value="">Unassigned</option>
                    {projectMembers.map(m => m && (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-input" value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={form.dueDate ? form.dueDate.split('T')[0] : ''}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </>
          )}
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddMemberModal = ({ project, onClose, onAdd }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const usersRes = await api.get('/users');
      const found = usersRes.data.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        setError('No user found with that email.');
        setLoading(false);
        return;
      }
      const res = await api.post(`/projects/${project._id}/members`, { userId: found._id, role });
      onAdd(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Member</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">User Email</label>
            <input className="form-input" type="email" placeholder="user@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: '#94a3b8' },
  { key: 'in-progress', label: 'In Progress', color: '#6366f1' },
  { key: 'completed', label: 'Completed', color: '#10b981' },
];

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModal, setTaskModal] = useState(null);
  const [addMember, setAddMember] = useState(false);
  const [activeTab, setActiveTab] = useState('board');

  const isAdmin = project && (
    project.owner?._id === user._id ||
    project.members?.some(m => m.user?._id === user._id && m.role === 'admin') ||
    user.role === 'admin'
  );

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks/project/${id}`)
    ]).then(([projRes, tasksRes]) => {
      setProject(projRes.data);
      setTasks(tasksRes.data);
    }).catch(() => navigate('/projects'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  const handleSaveTask = (savedTask, isEdit) => {
    if (isEdit) {
      setTasks(tasks.map(t => t._id === savedTask._id ? savedTask : t));
    } else {
      setTasks([savedTask, ...tasks]);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading project...</div>;
  if (!project) return null;

  const overdueTasks = tasks.filter(t => t.isOverdue).length;

  return (
    <div className="project-detail">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/projects')}>← Projects</button>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setAddMember(true)}>+ Member</button>
              <button className="btn btn-primary btn-sm" onClick={() => setTaskModal('new')}>+ Task</button>
            </>
          )}
        </div>
      </div>

      {/* Project meta */}
      <div className="project-meta-bar">
        <div className="meta-item">
          <span className="meta-label">Status</span>
          <span className={`badge badge-${project.status}`}>{project.status}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Members</span>
          <div className="member-avatars">
            {project.members?.slice(0, 5).map(m => m.user && (
              <div key={m.user._id} className="member-avatar" title={`${m.user.name} (${m.role})`}>
                {m.user.name?.[0]?.toUpperCase()}
              </div>
            ))}
            {project.members?.length > 5 && (
              <div className="member-avatar member-avatar-extra">+{project.members.length - 5}</div>
            )}
          </div>
        </div>
        <div className="meta-item">
          <span className="meta-label">Tasks</span>
          <span>{tasks.length} total, {overdueTasks > 0 ? <span style={{color:'#ef4444'}}>{overdueTasks} overdue</span> : '0 overdue'}</span>
        </div>
        {project.dueDate && (
          <div className="meta-item">
            <span className="meta-label">Due</span>
            <span>{new Date(project.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'board' ? 'tab-active' : ''}`} onClick={() => setActiveTab('board')}>
          Board
        </button>
        <button className={`tab ${activeTab === 'list' ? 'tab-active' : ''}`} onClick={() => setActiveTab('list')}>
          List
        </button>
        <button className={`tab ${activeTab === 'members' ? 'tab-active' : ''}`} onClick={() => setActiveTab('members')}>
          Members
        </button>
      </div>

      {/* Board view */}
      {activeTab === 'board' && (
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="kanban-col">
                <div className="kanban-col-header" style={{ borderTopColor: col.color }}>
                  <span>{col.label}</span>
                  <span className="col-count">{colTasks.length}</span>
                </div>
                <div className="kanban-tasks">
                  {colTasks.map(task => (
                    <div key={task._id} className={`task-card ${task.isOverdue ? 'task-overdue' : ''}`}>
                      <div className="task-card-title">{task.title}</div>
                      {task.description && <div className="task-card-desc">{task.description}</div>}
                      <div className="task-card-footer">
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        {task.assignedTo && (
                          <span className="task-assignee">{task.assignedTo.name}</span>
                        )}
                      </div>
                      {task.dueDate && (
                        <div className={`task-due ${task.isOverdue ? 'task-due-overdue' : ''}`}>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                          {task.isOverdue && ' — Overdue!'}
                        </div>
                      )}
                      <div className="task-card-actions">
                        <button className="task-action-btn" onClick={() => setTaskModal(task)}>Edit</button>
                        {isAdmin && (
                          <button className="task-action-btn task-action-delete"
                            onClick={() => handleDeleteTask(task._id)}>Delete</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="kanban-empty">No tasks here</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {activeTab === 'list' && (
        <div className="card">
          {tasks.length === 0 ? (
            <div className="empty-state"><div className="icon">📋</div><p>No tasks yet.</p></div>
          ) : (
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task._id} className={task.isOverdue ? 'row-overdue' : ''}>
                    <td>
                      <div className="table-task-title">{task.title}</div>
                      {task.description && <div className="table-task-desc">{task.description}</div>}
                    </td>
                    <td><span className={`badge badge-${task.status}`}>{task.status}</span></td>
                    <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                    <td>{task.assignedTo?.name || <span style={{color:'var(--text-muted)'}}>Unassigned</span>}</td>
                    <td>
                      {task.dueDate ? (
                        <span className={task.isOverdue ? 'text-danger' : ''}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <div style={{display:'flex', gap:6}}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setTaskModal(task)}>Edit</button>
                        {isAdmin && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(task._id)}>Del</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Members tab */}
      {activeTab === 'members' && (
        <div className="card">
          <div className="members-list">
            {project.members?.map(m => m.user && (
              <div key={m.user._id} className="member-row">
                <div className="member-row-avatar">{m.user.name?.[0]?.toUpperCase()}</div>
                <div className="member-row-info">
                  <div className="member-row-name">{m.user.name}</div>
                  <div className="member-row-email">{m.user.email}</div>
                </div>
                <span className={`badge badge-${m.role}`}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {(taskModal === 'new' || (taskModal && taskModal._id)) && (
        <TaskModal
          task={taskModal === 'new' ? null : taskModal}
          project={project}
          users={project.members?.map(m => m.user) || []}
          onClose={() => setTaskModal(null)}
          onSave={handleSaveTask}
        />
      )}
      {addMember && (
        <AddMemberModal
          project={project}
          onClose={() => setAddMember(false)}
          onAdd={updatedProject => setProject(updatedProject)}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
