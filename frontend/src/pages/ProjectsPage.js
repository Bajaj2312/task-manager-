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
          <h2 className="modal-title">Initialize New Project</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        {error && <div className="error-msg">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input className="form-input" placeholder="e.g., Apollo Launch" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Objective Description</label>
            <textarea className="form-input" rows={3} placeholder="What is the primary goal?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Completion Date</label>
            <input type="date" className="form-input" value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Initializing...' : 'Launch Project'}
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

  if (loading) return (
    <div className="loading-container">
      <div className="pulse-ring"></div>
      <p>Loading projects...</p>
    </div>
  );

  return (
    <div className="projects-page-container">
      <div className="page-header sticky-header">
        <div>
          <h1 className="page-title">Workspace Projects</h1>
          <p className="page-subtitle">You are actively participating in {projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {user.role === 'admin' && (
          <button className="btn btn-primary btn-glow" onClick={() => setShowCreate(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state glass-empty">
          <div className="icon">🌌</div>
          <p>The workspace is empty.{user.role === 'admin' ? ' Initialize a new project to begin.' : ' Wait for an admin to assign you to a project.'}</p>
        </div>
      ) : (
        <div className="modern-projects-grid">
          {projects.map((project, index) => {
            const isOwner = project.owner?._id === user._id || project.owner === user._id;
            return (
              <Link 
                key={project._id} 
                to={`/projects/${project._id}`} 
                className="modern-project-card glass-card"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="card-bg-glow"></div>
                <div className="card-content-inner">
                  <div className="project-card-header">
                    <div className="project-card-icon-wrapper">
                      <span className="project-card-icon">✨</span>
                    </div>
                    <span className={`badge badge-${project.status} pill`}>{project.status}</span>
                  </div>
                  
                  <div className="project-info-body">
                    <h3 className="project-card-name">{project.name}</h3>
                    {project.description ? (
                      <p className="project-card-desc">{project.description}</p>
                    ) : (
                      <p className="project-card-desc empty-desc">No description provided.</p>
                    )}
                  </div>

                  <div className="project-card-footer">
                    <div className="members-cluster">
                      <div className="member-avatar placeholder">👥 {project.members?.length || 0}</div>
                    </div>
                    <div className="footer-right">
                      {project.dueDate && (
                        <span className="due-date-pill">
                          ⏳ {new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {isOwner && <span className="owner-crown" title="Project Owner">👑</span>}
                    </div>
                  </div>
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
