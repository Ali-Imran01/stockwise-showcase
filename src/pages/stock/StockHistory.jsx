import React, { useState, useEffect } from 'react';
import { Clock, ArrowUpRight, ArrowDownRight, Package, User, Calendar, Loader2, FileSearch, Download } from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';

const StockHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/stock/history');
            setHistory(res.data.data || []);
        } catch (error) {
            console.error("Failed to load stock history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async (movementId) => {
        try {
            const response = await api.get(`/documents/receipt/${movementId}`, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `receipt-${movementId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            Swal.fire('Error', 'Failed to generate receipt PDF', 'error');
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Timeline...</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                    <FileSearch className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No Transactions Recorded</h3>
                <p className="text-slate-500 mt-2">Movements will appear here once you process them.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="hidden lg:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Product</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Quantity</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Date / Time</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                        {history.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1.5 font-black uppercase text-[10px] tracking-tighter px-2.5 py-1 rounded-lg ${m.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {m.type === 'IN' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        Stock {m.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{m.product?.name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono italic">{m.reference || 'No reference'}</div>
                                </td>
                                <td className="px-6 py-4 text-right font-black text-slate-900">
                                    {m.quantity} <span className="text-[10px] text-slate-400 font-bold uppercase ml-0.5">{m.product?.unit?.name}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {m.user?.name?.charAt(0)}
                                        </div>
                                        <span className="font-medium text-slate-600">{m.user?.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="font-bold text-slate-700">{new Date(m.created_at).toLocaleDateString()}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDownloadReceipt(m.id)}
                                        className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        title="Download Receipt"
                                    >
                                        <Download size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden space-y-3">
                {history.map((m) => (
                    <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                {m.type === 'IN' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm leading-tight">{m.product?.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleDownloadReceipt(m.id)}
                                className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                            >
                                <Download size={18} />
                            </button>
                            <div className="text-right">
                                <div className={`font-black ${m.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                    {m.type === 'IN' ? '+' : '-'}{m.quantity}
                                </div>
                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{m.product?.unit?.name}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockHistory;
