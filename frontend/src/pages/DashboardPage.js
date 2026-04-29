import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card" style={{ borderTopColor: color }}>
    <div className="stat-icon" style={{ background: `${color}22`, color }}>{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tasks'),
      api.get('/projects')
    ]).then(([tasksRes, projectsRes]) => {
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div>Loading dashboard...</div>;

  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => t.isOverdue).length;

  const recentTasks = [...tasks].slice(0, 8);
  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Here's what's happening with your projects</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="📋" label="Total Tasks" value={totalTasks} color="#6366f1" />
        <StatCard icon="⏳" label="In Progress" value={inProgressTasks} color="#f59e0b" />
        <StatCard icon="✅" label="Completed" value={completedTasks} color="#10b981" />
        <StatCard icon="🚨" label="Overdue" value={overdueTasks} color="#ef4444" />
      </div>

      <div className="dashboard-grid">
        {/* Recent Tasks */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Tasks</h3>
            <Link to="/projects" className="btn btn-secondary btn-sm">View Projects</Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📭</div>
              <p>No tasks yet. Join or create a project to get started.</p>
            </div>
          ) : (
            <div className="task-list">
              {recentTasks.map(task => (
                <div key={task._id} className="task-row">
                  <div className="task-info">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      {task.project?.name} &bull;
                      {task.assignedTo ? ` ${task.assignedTo.name}` : ' Unassigned'}
                    </div>
                  </div>
                  <div className="task-badges">
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    <span className={`badge badge-${task.status}`}>{task.status}</span>
                    {task.isOverdue && <span className="badge badge-overdue">Overdue</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Projects */}
        <div className="card">
          <div className="card-header">
            <h3>Active Projects</h3>
            <Link to="/projects" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          {activeProjects.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📁</div>
              <p>No active projects.</p>
            </div>
          ) : (
            <div className="project-list">
              {activeProjects.slice(0, 6).map(project => {
                const projectTasks = tasks.filter(t => t.project?._id === project._id || t.project === project._id);
                const done = projectTasks.filter(t => t.status === 'completed').length;
                const progress = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0;
                return (
                  <Link key={project._id} to={`/projects/${project._id}`} className="project-row">
                    <div className="project-row-info">
                      <div className="project-row-name">{project.name}</div>
                      <div className="project-row-meta">{projectTasks.length} tasks &bull; {project.members?.length} members</div>
                    </div>
                    <div className="project-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="progress-label">{progress}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
