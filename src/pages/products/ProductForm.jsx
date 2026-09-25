import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Package, DollarSign, Tag, List } from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';

const ProductForm = ({ isOpen, onClose, onSuccess, product = null }) => {
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        category_id: '',
        unit_id: '',
        cost_price: '',
        sell_price: '',
        min_stock: '10'
    });
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [catRes, unitRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/units')
                ]);
                setCategories(catRes.data);
                setUnits(unitRes.data);

                if (product) {
                    setFormData({
                        sku: product.sku,
                        name: product.name,
                        category_id: product.category_id,
                        unit_id: product.unit_id,
                        cost_price: product.cost_price,
                        sell_price: product.sell_price,
                        min_stock: product.min_stock
                    });
                }
            } catch (error) {
                console.error("Failed to fetch form metadata", error);
            } finally {
                setInitialLoading(false);
            }
        };

        if (isOpen) {
            fetchMetadata();
        }
    }, [isOpen, product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (product) {
                await api.put(`/products/${product.id}`, formData);
            } else {
                await api.post('/products', formData);
            }

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: `Product ${product ? 'updated' : 'created'} successfully.`,
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            onSuccess();
        } catch (error) {
            const message = error.response?.data?.message || 'Something went wrong';
            Swal.fire('Error', message, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

            <aside className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col p-8 transition-transform animate-slide-in-right">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {product ? 'Update Product' : 'Register New Product'}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Fill in the details to update your catalog</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {initialLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Form...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Identify</label>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">SKU Code</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleChange}
                                            placeholder="Example: PROD-001"
                                            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Product Name</label>
                                    <div className="relative">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Standard Widget"
                                            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Classification */}
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Classification</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Category</label>
                                    <select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Unit</label>
                                    <select
                                        name="unit_id"
                                        value={formData.unit_id}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                        required
                                    >
                                        <option value="">Select Unit</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Pricing & Stock</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Cost Price ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="cost_price"
                                            value={formData.cost_price}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Sell Price ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="sell_price"
                                            value={formData.sell_price}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Minimum Alert level</label>
                                <div className="relative">
                                    <List className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        name="min_stock"
                                        value={formData.min_stock}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 italic">Triggers "Low Stock" badge when inventory drops to this amount.</p>
                            </div>
                        </div>

                        <div className="pt-8 mt-auto">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                                {product ? 'Update Inventory Item' : 'Create Product Item'}
                            </button>
                        </div>
                    </form>
                )}
            </aside>
        </div>
    );
};

export default ProductForm;
