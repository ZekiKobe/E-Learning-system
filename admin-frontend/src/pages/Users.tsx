import { useEffect, useState } from 'react';
import api from '../api/api';
import { showToast } from '../utils/toast';
import { DataTable, DataTableColumn } from '../components/DataTable';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'instructor' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      setSavingId(user.id);
      await api.put(`/admin/users/${user.id}`, {
        isActive: !user.isActive
      });
      fetchUsers();
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Failed to update user');
    } finally {
      setSavingId(null);
    }
  };

  const handleRoleChange = (id: number, role: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const handleSaveRole = async (user: User) => {
    try {
      setSavingId(user.id);
      await api.put(`/admin/users/${user.id}`, { role: user.role });
      fetchUsers();
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Failed to update role');
    } finally {
      setSavingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.isActive) ||
      (statusFilter === 'inactive' && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns: DataTableColumn<User>[] = [
    {
      id: 'name',
      header: 'Name',
      sortable: true,
      render: (u) => (
        <span className="font-medium">
          {u.firstName} {u.lastName}
        </span>
      ),
      sortValue: (u) => `${u.firstName} ${u.lastName}`.toLowerCase()
    },
    {
      id: 'email',
      header: 'Email',
      sortable: true,
      render: (u) => u.email,
      sortValue: (u) => u.email.toLowerCase()
    },
    {
      id: 'role',
      header: 'Role',
      sortable: true,
      render: (user) => (
        <select
          value={user.role}
          onChange={(e) => handleRoleChange(user.id, e.target.value)}
          className="px-3 py-2 rounded-lg border admin-border-subtle bg-transparent text-sm"
        >
          <option value="student">student</option>
          <option value="instructor">instructor</option>
          <option value="admin">admin</option>
        </select>
      ),
      sortValue: (u) => u.role
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      render: (user) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
            user.isActive
              ? 'bg-green-500/10 text-green-500'
              : 'bg-red-500/10 text-red-500'
          }`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      sortValue: (u) => (u.isActive ? 1 : 0)
    },
    {
      id: 'actions',
      header: 'Actions',
      alignRight: true,
      render: (user) => (
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => handleSaveRole(user)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 disabled:opacity-60"
            disabled={savingId === user.id}
            title={savingId === user.id ? 'Saving…' : 'Save role'}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3H7a2 2 0 0 0-2 2v14l5-3 5 3 5-3V5a2 2 0 0 0-2-2z" />
            </svg>
          </button>
          <button
            onClick={() => handleToggleActive(user)}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
              user.isActive
                ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
            }`}
            disabled={savingId === user.id}
            title={user.isActive ? 'Deactivate user' : 'Activate user'}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              {user.isActive ? (
                <>
                  <path d="M15 9l-6 6" />
                  <path d="M9 9l6 6" />
                </>
              ) : (
                <path d="M9 12l2 2 4-4" />
              )}
            </svg>
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="text-center py-12 admin-text-muted">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header + filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Users</h1>
          <p className="text-sm admin-text-muted mt-1">
            Manage roles and activation status for all platform users.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border admin-border-subtle bg-transparent text-sm"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg border admin-border-subtle bg-transparent text-sm"
          >
            <option value="all">All roles</option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg border admin-border-subtle bg-transparent text-sm"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table card */}
      <div className="admin-card rounded-2xl border admin-border-subtle p-4 md:p-5 shadow-sm">
        <DataTable<User>
          rows={filteredUsers}
          columns={columns}
          emptyMessage="No users match your current filters."
          initialPageSize={10}
        />
      </div>
    </div>
  );
}

export default Users;

