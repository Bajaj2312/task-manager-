import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

const StatCard = ({ icon, label, value, gradient, delay }) => (
  <div className="stat-card glass" style={{ animationDelay: `${delay}ms` }}>
    <div className="stat-icon-wrapper" style={{ background: gradient }}>
      <span className="stat-icon-emoji">{icon}</span>
    </div>
    <div className="stat-info-new">
      <div className="stat-value-new">{value}</div>
      <div className="stat-label-new">{label}</div>
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

  if (loading) return (
    <div className="loading-container">
      <div className="pulse-ring"></div>
      <p>Syncing your workspace...</p>
    </div>
  );

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => t.isOverdue).length;

  const recentTasks = [...tasks].slice(0, 5);
  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero glass">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to NexusFlow, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="hero-subtitle">You have {inProgressTasks} tasks currently in progress. Let's make today productive.</p>
        </div>
        <div className="hero-decoration">
          <div className="deco-circle circle-1"></div>
          <div className="deco-circle circle-2"></div>
        </div>
      </div>

      <div className="stats-showcase">
        <StatCard icon="📋" label="Total Tasks" value={totalTasks} gradient="linear-gradient(135deg, #6366f1, #a855f7)" delay={0} />
        <StatCard icon="⏳" label="In Progress" value={inProgressTasks} gradient="linear-gradient(135deg, #f59e0b, #fbbf24)" delay={100} />
        <StatCard icon="✨" label="Completed" value={completedTasks} gradient="linear-gradient(135deg, #10b981, #34d399)" delay={200} />
        <StatCard icon="🚨" label="Overdue" value={overdueTasks} gradient="linear-gradient(135deg, #ef4444, #f87171)" delay={300} />
      </div>

      <div className="dashboard-bento-grid">
        {/* Recent Tasks */}
        <div className="bento-box tasks-box card">
          <div className="bento-header">
            <h3>Priority Tasks</h3>
            <Link to="/projects" className="btn btn-secondary btn-sm">View Board</Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📭</div>
              <p>Inbox zero! Enjoy your day.</p>
            </div>
          ) : (
            <div className="modern-task-list">
              {recentTasks.map(task => (
                <div key={task._id} className="modern-task-row">
                  <div className={`task-status-indicator indicator-${task.status}`}></div>
                  <div className="task-content">
                    <div className="task-title-main">{task.title}</div>
                    <div className="task-sub">
                      {task.project?.name} • <span className={`priority-text text-${task.priority}`}>{task.priority}</span>
                    </div>
                  </div>
                  <div className="task-assignee">
                     {task.assignedTo ? (
                       <div className="avatar-sm" title={task.assignedTo.name}>
                         {task.assignedTo.name[0]}
                       </div>
                     ) : (
                       <div className="avatar-sm unassigned" title="Unassigned">?</div>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Projects */}
        <div className="bento-box projects-box card">
          <div className="bento-header">
            <h3>Active Horizons</h3>
            <Link to="/projects" className="btn btn-secondary btn-sm">All Projects</Link>
          </div>
          {activeProjects.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🚀</div>
              <p>No active missions.</p>
            </div>
          ) : (
            <div className="modern-project-list">
              {activeProjects.slice(0, 4).map(project => {
                const projectTasks = tasks.filter(t => t.project?._id === project._id || t.project === project._id);
                const done = projectTasks.filter(t => t.status === 'completed').length;
                const progress = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0;
                return (
                  <Link key={project._id} to={`/projects/${project._id}`} className="modern-project-card">
                    <div className="project-card-top">
                      <div className="project-icon">🔮</div>
                      <div className="project-name-big">{project.name}</div>
                    </div>
                    <div className="project-card-bottom">
                      <div className="project-stats-mini">
                        <span>{projectTasks.length} tasks</span>
                      </div>
                      <div className="modern-progress">
                        <div className="modern-progress-bar">
                          <div className="modern-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
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
