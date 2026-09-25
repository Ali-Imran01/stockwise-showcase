import React, { useState } from 'react';
import { ArrowUpDown, History, PlusCircle, MinusCircle, LayoutGrid } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import StockForm from './StockForm';
import StockHistory from './StockHistory';

const StockManager = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('history'); // history | operations
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formType, setFormType] = useState('IN');

    const handleOpenForm = (type) => {
        setFormType(type);
        setIsFormOpen(true);
    };

    const handleSuccess = () => {
        setIsFormOpen(false);
        // Refresh history by changing tab or using a key
        setActiveTab('history');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Stock Management</h1>
                    <p className="text-slate-500 mt-1 font-medium">Control inventory flow and track movement history</p>
                </div>

                {/* Quick Action Toggle for Mobile */}
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <History size={18} />
                        <span>Timeline</span>
                    </button>
                    {user?.role !== 'viewer' && (
                        <button
                            onClick={() => setActiveTab('operations')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'operations' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={18} />
                            <span>Quick Moves</span>
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'operations' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Stock IN Card */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <PlusCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Replenish Stock</h3>
                        <p className="text-slate-500 text-sm font-medium mb-8 max-w-xs">Scan items back into inventory, record purchases, and update stock levels.</p>
                        <button
                            onClick={() => handleOpenForm('IN')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95"
                        >
                            Process Stock In
                        </button>
                    </div>

                    {/* Stock OUT Card */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <MinusCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Release Stock</h3>
                        <p className="text-slate-500 text-sm font-medium mb-8 max-w-xs">Record sales, usage, or returns. System validates availability automatically.</p>
                        <button
                            onClick={() => handleOpenForm('OUT')}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-100 transition-all active:scale-95"
                        >
                            Process Stock Out
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <History className="text-blue-600" />
                        <h3 className="font-extrabold text-slate-900">Activity Timeline</h3>
                    </div>
                    <StockHistory key={activeTab} />
                </div>
            )}

            <StockForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={handleSuccess}
                initialType={formType}
            />
        </div>
    );
};

export default StockManager;
