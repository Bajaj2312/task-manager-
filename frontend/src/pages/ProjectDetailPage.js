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
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        {error && <div className="error-msg">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          {isAdmin && (
            <>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input className="form-input" placeholder="What needs to be done?" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Details</label>
                <textarea className="form-input" rows={2} placeholder="Add more context..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Assignee</label>
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
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (task ? 'Update Task' : 'Add Task')}
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
          <h2 className="modal-title">Invite Member</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        {error && <div className="error-msg">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="colleague@nexusflow.app"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Access Level</label>
            <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending Invite...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' },
  { key: 'in-progress', label: 'In Progress', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
  { key: 'completed', label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
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
  }, [id, navigate]);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task forever?')) return;
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

  if (loading) return (
    <div className="loading-container">
      <div className="pulse-ring"></div>
      <p>Loading project details...</p>
    </div>
  );
  if (!project) return null;

  const overdueTasks = tasks.filter(t => t.isOverdue).length;

  return (
    <div className="project-detail modern-detail">
      <div className="detail-header-wrapper">
        <button className="modern-back-btn" onClick={() => navigate('/projects')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Projects
        </button>
        
        <div className="detail-header-content">
          <div className="header-left">
            <h1 className="detail-title">{project.name}</h1>
            {project.description && <p className="detail-subtitle">{project.description}</p>}
          </div>
          <div className="header-actions">
            {isAdmin && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => setAddMember(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                  Invite
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setTaskModal('new')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  New Task
                </button>
              </>
            )}
          </div>
        </div>

        <div className="modern-meta-bar glass">
          <div className="meta-block">
            <span className="meta-sub">Status</span>
            <span className={`badge badge-${project.status} pill`}>{project.status}</span>
          </div>
          <div className="meta-separator"></div>
          <div className="meta-block">
            <span className="meta-sub">Team</span>
            <div className="avatar-group">
              {project.members?.slice(0, 4).map(m => m.user && (
                <div key={m.user._id} className="avatar-group-item" title={`${m.user.name}`}>
                  {m.user.name?.[0]?.toUpperCase()}
                </div>
              ))}
              {project.members?.length > 4 && (
                <div className="avatar-group-item extra">+{project.members.length - 4}</div>
              )}
            </div>
          </div>
          <div className="meta-separator"></div>
          <div className="meta-block">
            <span className="meta-sub">Progress</span>
            <div className="meta-stat-text">
              <strong>{tasks.filter(t => t.status === 'completed').length}</strong> / {tasks.length} tasks
            </div>
          </div>
          <div className="meta-separator"></div>
          <div className="meta-block">
            <span className="meta-sub">Health</span>
            <div className={`meta-stat-text ${overdueTasks > 0 ? 'text-danger' : 'text-success'}`}>
              {overdueTasks > 0 ? `${overdueTasks} Overdue` : 'On Track'}
            </div>
          </div>
        </div>
      </div>

      <div className="modern-tabs-container">
        <div className="modern-tabs">
          <button className={`modern-tab ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            Board
          </button>
          <button className={`modern-tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            List
          </button>
          <button className={`modern-tab ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Team
          </button>
        </div>
      </div>

      {activeTab === 'board' && (
        <div className="kanban-wrapper">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="kanban-column" style={{'--col-color': col.color, '--col-bg': col.bg}}>
                <div className="kanban-col-top">
                  <div className="kanban-col-title">
                    <span className="kanban-dot" style={{backgroundColor: col.color}}></span>
                    {col.label}
                  </div>
                  <span className="kanban-count">{colTasks.length}</span>
                </div>
                
                <div className="kanban-items">
                  {colTasks.map((task, idx) => (
                    <div key={task._id} className="kanban-card" style={{animationDelay: `${idx * 40}ms`}}>
                      {task.isOverdue && <div className="kanban-overdue-bar"></div>}
                      
                      <div className="kanban-card-labels">
                        <span className={`priority-dot priority-${task.priority}`} title={`Priority: ${task.priority}`}></span>
                        {task.dueDate && (
                          <span className={`kanban-due ${task.isOverdue ? 'due-overdue' : ''}`}>
                            {new Date(task.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                          </span>
                        )}
                      </div>
                      
                      <div className="kanban-card-title">{task.title}</div>
                      
                      <div className="kanban-card-bottom">
                        <div className="kanban-card-actions">
                          <button className="k-btn edit" onClick={() => setTaskModal(task)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg></button>
                          {isAdmin && (
                            <button className="k-btn delete" onClick={() => handleDeleteTask(task._id)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                          )}
                        </div>
                        {task.assignedTo && (
                          <div className="kanban-assignee" title={task.assignedTo.name}>
                            {task.assignedTo.name[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="kanban-empty-drop">Drop tasks here</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'list' && (
        <div className="glass card table-card">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
              <p>No tasks yet in this view.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assignee</th>
                    <th>Due</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task._id} className={task.isOverdue ? 'tr-overdue' : ''}>
                      <td>
                        <div className="td-title">{task.title}</div>
                        {task.description && <div className="td-desc">{task.description}</div>}
                      </td>
                      <td><span className={`badge badge-${task.status}`}>{task.status}</span></td>
                      <td><span className={`priority-text text-${task.priority}`}>{task.priority}</span></td>
                      <td>
                        {task.assignedTo ? (
                           <div className="td-assignee">
                             <div className="avatar-xs">{task.assignedTo.name[0]}</div>
                             {task.assignedTo.name}
                           </div>
                        ) : <span className="unassigned-text">Unassigned</span>}
                      </td>
                      <td>
                        {task.dueDate ? (
                          <span className={task.isOverdue ? 'text-danger fw-bold' : ''}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="td-actions">
                        <button className="action-icon-btn" onClick={() => setTaskModal(task)}>✏️</button>
                        {isAdmin && (
                          <button className="action-icon-btn delete-icon" onClick={() => handleDeleteTask(task._id)}>🗑️</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="glass card p-0">
          <div className="modern-members-list">
            {project.members?.map(m => m.user && (
              <div key={m.user._id} className="modern-member-row">
                <div className="modern-member-avatar">{m.user.name?.[0]?.toUpperCase()}</div>
                <div className="modern-member-info">
                  <div className="modern-member-name">{m.user.name}</div>
                  <div className="modern-member-email">{m.user.email}</div>
                </div>
                <span className={`badge badge-${m.role} pill`}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
