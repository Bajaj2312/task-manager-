import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const UsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    api.get('/users').then(res => setUsers(res.data)).finally(() => setLoading(false));
  }, [user.role, navigate]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role.');
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="pulse-ring"></div>
      <p>Loading team directory...</p>
    </div>
  );

  return (
    <div className="users-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.4s ease-out' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Team Directory</h1>
          <p className="page-subtitle">Manage access and roles for {users.length} registered members.</p>
        </div>
      </div>

      <div className="glass card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(248, 250, 252, 0.5)' }}>
                {['Team Member', 'Email Address', 'Access Role', 'Joined Date', 'Administration'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '16px 24px', color: 'var(--text-muted)',
                    fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--border-solid)'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-solid)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'var(--accent-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '14px',
                        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)'
                      }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                        {u._id === user._id && <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700 }}>YOU</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-solid)', color: 'var(--text-secondary)' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-solid)' }}>
                    <span className={`badge badge-${u.role} pill`}>{u.role}</span>
                  </td>
                  <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-solid)', color: 'var(--text-muted)', fontSize: '13px' }}>
                    {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-solid)' }}>
                    {u._id !== user._id ? (
                      <select
                        className="form-input"
                        style={{ width: 'auto', padding: '6px 12px', fontSize: '13px', borderRadius: '100px', background: 'rgba(255,255,255,0.8)' }}
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="member">Member Access</option>
                        <option value="admin">Admin Access</option>
                      </select>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>Cannot change own role</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
