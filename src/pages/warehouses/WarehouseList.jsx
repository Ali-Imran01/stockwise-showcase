import React, { useState, useEffect } from 'react';
import {
    Warehouse as WarehouseIcon,
    Plus,
    Search,
    Edit2,
    Trash2,
    MapPin,
    ShieldCheck,
    ShieldAlert,
    Loader2
} from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';
import WarehouseForm from './WarehouseForm';

const WarehouseList = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/warehouses');
            setWarehouses(res.data);
        } catch (err) {
            console.error("Failed to fetch warehouses", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This will remove the warehouse from the system. Stock movements linked to this warehouse may be affected.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/warehouses/${id}`);
                Swal.fire('Deleted!', 'Warehouse has been removed.', 'success');
                fetchWarehouses();
            } catch (err) {
                Swal.fire('Error', 'Failed to delete warehouse', 'error');
            }
        }
    };

    const handleEdit = (warehouse) => {
        setEditingWarehouse(warehouse);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingWarehouse(null);
        setIsFormOpen(true);
    };

    const filtered = warehouses.filter(w =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.location?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Location Management</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage multiple warehouses and storage hubs</p>
                </div>

                <button
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span>Register New Location</span>
                </button>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search locations by name or address..."
                            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="bg-blue-600 p-4 rounded-3xl shadow-lg shadow-blue-100 text-white flex items-center justify-between overflow-hidden relative group">
                    <div className="relative z-10">
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Hubs</div>
                        <div className="text-3xl font-black">{warehouses.filter(w => w.is_active).length}</div>
                    </div>
                    <WarehouseIcon className="w-16 h-16 absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform" />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Satellite Data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((w) => (
                        <div key={w.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group border-b-4 border-b-transparent hover:border-b-blue-500">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${w.is_active ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                    <WarehouseIcon size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(w)}
                                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(w.id)}
                                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 mb-2">{w.name}</h3>
                            <div className="flex items-start gap-2 text-slate-500 text-sm font-medium mb-6">
                                <MapPin size={16} className="mt-0.5 shrink-0 text-blue-500/50" />
                                <span>{w.location || 'No address registered'}</span>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${w.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {w.is_active ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                    {w.is_active ? 'Operational' : 'Inactive'}
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic group-hover:text-blue-600 transition-colors">
                                    ID: {w.id.toString().padStart(3, '0')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isFormOpen && (
                <WarehouseForm
                    warehouse={editingWarehouse}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        fetchWarehouses();
                    }}
                />
            )}
        </div>
    );
};

export default WarehouseList;
