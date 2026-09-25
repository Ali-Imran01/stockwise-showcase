import React, { useState, useEffect } from 'react';
import {
    Users, UserPlus, Mail, Shield,
    MoreVertical, Edit2, Trash2,
    Loader2, Search, Filter
} from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';
import UserForm from './UserForm';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to load users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete User?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter(u => u.id !== id));
                Swal.fire('Deleted!', 'User has been removed.', 'success');
            } catch (err) {
                Swal.fire('Error', err.response?.data?.message || 'Failed to delete user', 'error');
            }
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            admin: 'bg-indigo-100 text-indigo-700',
            staff: 'bg-blue-100 text-blue-700',
            viewer: 'bg-slate-100 text-slate-700'
        };
        return styles[role] || styles.viewer;
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Team...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Team Management</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage permissions and system access</p>
                </div>

                <button
                    onClick={() => { setEditingUser(null); setIsFormOpen(true); }}
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all active:scale-95"
                >
                    <UserPlus size={20} />
                    <span>Invite Member</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search team by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold transition-all">
                        <Filter className="w-5 h-5" />
                        <span>Filter Roles</span>
                    </button>
                </div>
            </div>

            {/* User Grid (Mobile Optimized) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-blue-400 transition-all group relative">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-xl font-black text-slate-400 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => { setEditingUser(user); setIsFormOpen(true); }}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{user.name}</h3>
                            <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                                <Mail size={12} className="shrink-0" />
                                <span className="text-xs font-medium truncate">{user.email}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-top border-slate-50 flex items-center justify-between">
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getRoleBadge(user.role)}`}>
                                {user.role}
                            </span>
                            {user.role === 'admin' && <Shield size={14} className="text-slate-300" />}
                        </div>
                    </div>
                ))}
            </div>

            {isFormOpen && (
                <UserForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={fetchUsers}
                    user={editingUser}
                />
            )}
        </div>
    );
};

export default UserList;
