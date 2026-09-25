import React, { useState } from 'react';
import {
    Upload,
    Download,
    X,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Info,
    ArrowRight
} from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';

const ImportManager = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState([]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setErrors([]);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setUploading(true);
        setErrors([]);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/import/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Swal.fire({
                icon: 'success',
                title: 'Import Successful',
                text: response.data.message,
                timer: 2000,
                showConfirmButton: false
            });
            onSuccess();
            onClose();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || []);
                Swal.fire('Import Warning', 'Some rows failed validation. Please check the errors below.', 'warning');
            } else {
                Swal.fire('Error', error.response?.data?.message || 'Faild to import products', 'error');
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-slate-100">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <Upload className="text-blue-600" size={28} />
                            Bulk Import Products
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Populate your inventory from Excel or CSV</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white hover:shadow-md rounded-2xl text-slate-400 hover:text-red-500 transition-all active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Instructions */}
                    <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <Info size={16} />
                            Mapping Guide
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-bold text-blue-700">
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-blue-100">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                sku (required)
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-blue-100">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                name (required)
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-blue-100">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                category (required)
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-blue-100 text-slate-400">
                                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                cost_price
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-blue-100 text-slate-400">
                                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                sell_price
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-blue-100 text-slate-400">
                                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                initial_stock
                            </div>
                        </div>
                    </div>

                    {/* Dropzone */}
                    <div className="relative group">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".xlsx,.xls,.csv"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`p-10 border-4 border-dashed rounded-[2rem] transition-all flex flex-col items-center justify-center text-center ${file
                                ? 'border-green-200 bg-green-50/30'
                                : 'border-slate-100 bg-slate-50 group-hover:border-blue-200 group-hover:bg-blue-50/30'
                            }`}>
                            {file ? (
                                <>
                                    <div className="bg-green-100 p-4 rounded-3xl mb-4">
                                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                                    </div>
                                    <p className="font-black text-slate-900 text-lg">{file.name}</p>
                                    <p className="text-slate-500 text-sm font-medium">{(file.size / 1024).toFixed(2)} KB</p>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="mt-4 text-xs font-black text-red-500 uppercase tracking-widest hover:underline"
                                    >
                                        Change File
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="bg-slate-100 p-4 rounded-3xl mb-4 group-hover:bg-blue-100 transition-colors">
                                        <Upload className="w-10 h-10 text-slate-400 group-hover:text-blue-500" />
                                    </div>
                                    <p className="font-black text-slate-900 text-lg">Select Excel or CSV File</p>
                                    <p className="text-slate-500 text-sm font-medium mt-1">Drag and drop or click to browse</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Error Summary */}
                    {errors.length > 0 && (
                        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 overflow-hidden">
                            <h4 className="text-red-900 font-black mb-3 flex items-center gap-2">
                                <AlertCircle size={20} />
                                Import Failures ({errors.length})
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {errors.map((error, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-red-50 flex items-start gap-3">
                                        <span className="bg-red-100 text-red-600 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0">
                                            {error.row}
                                        </span>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase">{error.attribute}</p>
                                            <p className="text-xs text-red-500 font-medium">{error.errors.join(', ')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3.5 rounded-2xl font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest text-xs"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!file || uploading}
                        className={`flex-1 flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl font-black transition-all shadow-xl active:scale-95 ${!file || uploading
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                            }`}
                    >
                        {uploading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>IMPORTING...</span>
                            </>
                        ) : (
                            <>
                                <span>START IMPORT</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportManager;
