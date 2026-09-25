import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2, Info } from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';

const CategoryForm = ({ isOpen, onClose, onSuccess, category = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                description: category.description || ''
            });
        } else {
            setFormData({ name: '', description: '' });
        }
        setErrors({});
    }, [category, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (category) {
                await api.put(`/categories/${category.id}`, formData);
            } else {
                await api.post('/categories', formData);
            }

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Category ${category ? 'updated' : 'created'} successfully!`,
                timer: 1500,
                showConfirmButton: false
            });
            onSuccess();
            onClose();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                Swal.fire('Error', 'Failed to save category', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-slate-100">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">
                            {category ? 'Edit Category' : 'New Category'}
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">
                            {category ? 'Update category details' : 'Organize your products into groups'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white hover:shadow-md rounded-2xl text-slate-400 hover:text-red-500 transition-all active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Category Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Computers, Hardware, Office Supplies"
                                className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 transition-all outline-none font-bold text-slate-900 ${errors.name ? 'border-red-200 focus:border-red-500' : 'border-slate-50 focus:border-blue-500 focus:bg-white'
                                    }`}
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-500 font-bold ml-1">{errors.name[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                Description (Optional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="What kind of items are in this category?"
                                rows="4"
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-900 resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span className="uppercase tracking-widest text-xs">
                                {category ? 'Update Category' : 'Create Category'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;
