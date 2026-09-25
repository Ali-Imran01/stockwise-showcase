import React, { useState, useEffect } from 'react';
import {
    Layers,
    Ruler,
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    MoreVertical,
    ChevronRight,
    Tag,
    Scale
} from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';
import CategoryForm from './CategoryForm';
import UnitForm from './UnitForm';
import useAuthStore from '../../store/useAuthStore';

const CategoryList = () => {
    const [activeTab, setActiveTab] = useState('categories');
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals state
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingUnit, setEditingUnit] = useState(null);

    const { user } = useAuthStore();
    const canManage = user?.role === 'admin' || user?.role === 'staff';

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, unitRes] = await Promise.all([
                api.get('/categories'),
                api.get('/units')
            ]);
            setCategories(catRes.data);
            setUnits(unitRes.data);
        } catch (error) {
            Swal.fire('Error', 'Failed to fetch management data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteCategory = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Products linked to this category might lose their reference!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/categories/${id}`);
                setCategories(categories.filter(c => c.id !== id));
                Swal.fire('Deleted!', 'Category has been removed.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete category. It might be in use.', 'error');
            }
        }
    };

    const handleDeleteUnit = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Unit?',
            text: "This measurement unit will be permanently removed.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/units/${id}`);
                setUnits(units.filter(u => u.id !== id));
                Swal.fire('Deleted!', 'Unit has been removed.', 'success');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete unit.', 'error');
            }
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUnits = units.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                            {activeTab === 'categories' ? <Layers className="text-blue-600" size={32} /> : <Ruler className="text-purple-600" size={32} />}
                        </div>
                        Metadata Central
                    </h1>
                    <p className="text-slate-500 font-medium ml-1">Manage your classification and measurement standards</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-semibold text-slate-900"
                        />
                    </div>
                    {canManage && (
                        <button
                            onClick={() => activeTab === 'categories' ? setIsCategoryModalOpen(true) : setIsUnitModalOpen(true)}
                            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${activeTab === 'categories' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-100'
                                }`}
                        >
                            <Plus size={20} />
                            <span>Add New</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 p-1.5 bg-slate-100 rounded-[1.5rem] w-fit">
                <button
                    onClick={() => { setActiveTab('categories'); setSearchTerm(''); }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all ${activeTab === 'categories'
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Tag size={18} />
                    Categories
                </button>
                <button
                    onClick={() => { setActiveTab('units'); setSearchTerm(''); }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold transition-all ${activeTab === 'units'
                            ? 'bg-white text-purple-600 shadow-md'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Scale size={18} />
                    Units
                </button>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="bg-white rounded-[3rem] p-32 border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Initializing Module...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* List Section */}
                    <div className="lg:col-span-12">
                        {activeTab === 'categories' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredCategories.map(cat => (
                                    <div key={cat.id} className="group bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="bg-blue-50 p-3 rounded-2xl">
                                                    <Tag className="text-blue-600" size={24} />
                                                </div>
                                                {canManage && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }}
                                                            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(cat.id)}
                                                            className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase truncate">
                                                {cat.name}
                                            </h3>
                                            <p className="text-slate-500 font-medium text-sm mt-2 line-clamp-2 min-h-[40px]">
                                                {cat.description || 'No description provided.'}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-slate-50/50 rounded-b-[2rem] border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                                ID: {cat.id}
                                            </span>
                                            <div className="flex items-center gap-1 text-blue-600 font-black text-xs uppercase cursor-pointer hover:underline">
                                                <span>View Products</span>
                                                <ChevronRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <div className="col-span-full bg-white rounded-[3rem] p-20 border-2 border-dashed border-slate-100 text-center">
                                        <Layers className="mx-auto text-slate-200 mb-4" size={48} />
                                        <p className="font-bold text-slate-400">No categories found matching your search.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                                {filteredUnits.map(unit => (
                                    <div key={unit.id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all text-center relative">
                                        <div className="mx-auto w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Scale className="text-purple-600" size={24} />
                                        </div>
                                        <h4 className="font-black text-slate-900 uppercase text-lg group-hover:text-purple-600 transition-colors">{unit.name}</h4>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">U-REF-{unit.id}</p>

                                        {canManage && (
                                            <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => { setEditingUnit(unit); setIsUnitModalOpen(true); }}
                                                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUnit(unit.id)}
                                                    className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {filteredUnits.length === 0 && (
                                    <div className="col-span-full bg-white rounded-[3rem] p-20 border-2 border-dashed border-slate-100 text-center">
                                        <Ruler className="mx-auto text-slate-200 mb-4" size={48} />
                                        <p className="font-bold text-slate-400">No units found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <CategoryForm
                isOpen={isCategoryModalOpen}
                onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}
                onSuccess={fetchData}
                category={editingCategory}
            />
            <UnitForm
                isOpen={isUnitModalOpen}
                onClose={() => { setIsUnitModalOpen(false); setEditingUnit(null); }}
                onSuccess={fetchData}
                unit={editingUnit}
            />
        </div>
    );
};

export default CategoryList;
