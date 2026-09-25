import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Truck,
    Phone,
    Mail,
    MapPin,
    Edit2,
    Trash2,
    Loader2,
    Users,
    MoreVertical
} from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';
import SupplierForm from './SupplierForm';

const SupplierList = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            Swal.fire('Error', 'Failed to load suppliers', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Supplier?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/suppliers/${id}`);
                Swal.fire('Deleted!', 'Supplier removed.', 'success');
                fetchSuppliers();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete supplier', 'error');
            }
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingSupplier(null);
        setIsFormOpen(true);
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Suppliers</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage your vendor relationships and contacts</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Supplier</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by supplier name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dotted border-slate-200">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-slate-500 font-bold">Loading Directory...</p>
                </div>
            ) : filteredSuppliers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 text-center px-4">
                    <div className="bg-slate-50 p-6 rounded-full mb-6">
                        <Users className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No Suppliers Found</h3>
                    <p className="text-slate-500 mt-2">Add your first supplier to start linking them to products.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSuppliers.map((supplier) => (
                        <div key={supplier.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-blue-50 shadow-inner">
                                    <Truck size={28} />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(supplier)} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(supplier.id)} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 mb-4">{supplier.name}</h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                                        <Mail size={14} />
                                    </div>
                                    <span className="truncate">{supplier.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                                        <Phone size={14} />
                                    </div>
                                    <span>{supplier.phone}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm font-medium text-slate-600">
                                    <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 mt-0.5">
                                        <MapPin size={14} />
                                    </div>
                                    <span className="line-clamp-2">{supplier.address}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isFormOpen && (
                <SupplierForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        fetchSuppliers();
                    }}
                    supplier={editingSupplier}
                />
            )}
        </div>
    );
};

export default SupplierList;
