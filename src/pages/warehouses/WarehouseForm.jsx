import React, { useState, useEffect } from 'react';
import { X, Save, Warehouse as WarehouseIcon, MapPin, Loader2, Power } from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';

const WarehouseForm = ({ warehouse, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        is_active: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (warehouse) {
            setFormData({
                name: warehouse.name,
                location: warehouse.location || '',
                is_active: !!warehouse.is_active
            });
        }
    }, [warehouse]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (warehouse) {
                await api.put(`/warehouses/${warehouse.id}`, formData);
            } else {
                await api.post('/warehouses', formData);
            }
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: `Warehouse ${warehouse ? 'updated' : 'registered'} successfully.`,
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            onSuccess();
        } catch (err) {
            const message = err.response?.data?.message || 'Something went wrong';
            Swal.fire('Error', message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {warehouse ? 'Update Hub' : 'New Hub'}
                        </h2>
                        <p className="text-slate-500 text-sm font-medium">Configure warehouse parameters</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-8 flex-1 overflow-y-auto">
                    {/* Visual Icon */}
                    <div className="bg-slate-50/50 p-8 rounded-[2rem] flex flex-col items-center justify-center border border-dashed border-slate-200 group">
                        <div className="p-5 bg-white rounded-3xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform text-blue-600">
                            <WarehouseIcon size={40} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-6">Spatial Node</span>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Location Name</label>
                            <div className="relative">
                                <WarehouseIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Western Distribution Hub"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Physical Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input
                                    type="text"
                                    placeholder="e.g. 123 Logistics Way, Industrial Zone"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Status Toggle */}
                        <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${formData.is_active ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                                    <Power size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900">Operational Status</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Visible in system</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                className={`w-14 h-8 rounded-full transition-all relative ${formData.is_active ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 bg-white w-6 h-6 rounded-full transition-all shadow-sm ${formData.is_active ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer Buttons */}
                <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex gap-4 sticky bottom-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[2] bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save size={20} />}
                        <span>{warehouse ? 'Commit Changes' : 'Initialize Node'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarehouseForm;
