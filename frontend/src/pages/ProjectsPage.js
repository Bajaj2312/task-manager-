import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ProjectsPage.css';

const CreateProjectModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ name: '', description: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/projects', form);
      onCreate(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Project</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" placeholder="e.g., Website Redesign" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} placeholder="What is this project about?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input type="date" className="form-input" value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div>Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} you're part of</p>
        </div>
        {user.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📁</div>
          <p>No projects yet.{user.role === 'admin' ? ' Create one to get started!' : ' Ask an admin to add you to a project.'}</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => {
            const isOwner = project.owner?._id === user._id || project.owner === user._id;
            return (
              <Link key={project._id} to={`/projects/${project._id}`} className="project-card">
                <div className="project-card-header">
                  <div className="project-card-icon">📁</div>
                  <span className={`badge badge-${project.status}`}>{project.status}</span>
                </div>
                <h3 className="project-card-name">{project.name}</h3>
                {project.description && (
                  <p className="project-card-desc">{project.description}</p>
                )}
                <div className="project-card-footer">
                  <span className="project-card-meta">👤 {project.members?.length || 0} members</span>
                  {project.dueDate && (
                    <span className="project-card-meta">
                      📅 {new Date(project.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  {isOwner && <span className="badge badge-admin" style={{fontSize:'11px'}}>Owner</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={project => setProjects([project, ...projects])}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
