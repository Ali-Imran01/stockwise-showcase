import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Phone, Mail, MapPin } from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';

const SupplierForm = ({ isOpen, onClose, onSuccess, supplier = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address
            });
        } else {
            setFormData({ name: '', email: '', phone: '', address: '' });
        }
    }, [supplier, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (supplier) {
                await api.put(`/suppliers/${supplier.id}`, formData);
            } else {
                await api.post('/suppliers', formData);
            }

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: `Supplier ${supplier ? 'updated' : 'created'} successfully.`,
                timer: 1500,
                toast: true,
                position: 'top-end',
                showConfirmButton: false
            });
            onSuccess();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Transaction failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

            <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-8 transition-transform animate-slide-in-right">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {supplier ? 'Update Supplier' : 'Add Supplier'}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Manage vendor contact information</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto pr-2">
                    <div className="space-y-4">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contact Details</label>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Full Name / Company</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter supplier name"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="vendor@company.com"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 234 567 890"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Business physical address"
                                    rows="3"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    required
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                            {supplier ? 'Save Changes' : 'Create Supplier'}
                        </button>
                    </div>
                </form>
            </aside>
        </div>
    );
};

export default SupplierForm;
