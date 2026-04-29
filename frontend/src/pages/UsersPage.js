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
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role.');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading users...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr>
              {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)',
                  fontWeight: 500, borderBottom: '1px solid var(--border)'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 13
                    }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                    {u._id === user._id && <span className="badge badge-admin" style={{fontSize:11}}>You</span>}
                  </div>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  {u.email}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                  <span className={`badge badge-${u.role}`}>{u.role}</span>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 13 }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                  {u._id !== user._id && (
                    <select
                      className="form-input"
                      style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}
                      value={u.role}
                      onChange={e => handleRoleChange(u._id, e.target.value)}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
