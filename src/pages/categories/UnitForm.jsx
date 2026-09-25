import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';

const UnitForm = ({ isOpen, onClose, onSuccess, unit = null }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (unit) {
            setName(unit.name || '');
        } else {
            setName('');
        }
        setErrors({});
    }, [unit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            if (unit) {
                await api.put(`/units/${unit.id}`, { name });
            } else {
                await api.post('/units', { name });
            }

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Measurement unit ${unit ? 'updated' : 'created'} successfully!`,
                timer: 1500,
                showConfirmButton: false
            });
            onSuccess();
            onClose();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                Swal.fire('Error', 'Failed to save unit', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-slate-100">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">
                            {unit ? 'Edit Unit' : 'New Unit'}
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">
                            {unit ? 'Update unit name' : 'Add a new measurement unit'}
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
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Unit Label
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Kg, PCs, Boxes, Liters"
                            className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 transition-all outline-none font-bold text-slate-900 ${errors.name ? 'border-red-200 focus:border-red-500' : 'border-slate-50 focus:border-blue-500 focus:bg-white'
                                }`}
                        />
                        {errors.name && <p className="mt-2 text-sm text-red-500 font-bold ml-1">{errors.name[0]}</p>}
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
                                {unit ? 'Update Unit' : 'Create Unit'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UnitForm;
