import React, { useState, useEffect } from 'react';
import { X, Shield, Mail, User as UserIcon, Lock, Loader2 } from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';

const UserForm = ({ isOpen, onClose, onSuccess, user }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'staff'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (user) {
                await api.put(`/users/${user.id}`, formData);
                Swal.fire({
                    icon: 'success',
                    title: 'User Updated',
                    toast: true,
                    position: 'top-end',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await api.post('/users', formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Invitation Sent',
                    text: 'New team member has been added.',
                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <UserIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight">
                                {user ? 'Modify Profile' : 'Invite Member'}
                            </h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                {user ? 'Update access levels' : 'Add to your inventory team'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Full Name</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                                    placeholder="john@company.com"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">
                                {user ? 'New Password (Optional)' : 'Access Password'}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required={!user}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 block">Select System Role</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['admin', 'staff', 'viewer'].map(role => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role })}
                                        className={`py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === role
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            {role === 'admin' && <Shield size={14} className="mb-0.5" />}
                                            {role}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl font-black text-sm text-slate-400 hover:bg-slate-50 transition-all"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : user ? 'UPDATE USER' : 'SEND INVITE'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
