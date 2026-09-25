import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Download,
    History,
    TrendingUp,
    Search,
    Loader2,
    FileSpreadsheet,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Calendar,
    Warehouse as WarehouseIcon
} from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';

const ReportsManager = () => {
    const [activeTab, setActiveTab] = useState('movements'); // movements | valuation
    const [movements, setMovements] = useState([]);
    const [valuation, setValuation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'movements') {
                    const res = await api.get('/reports/movement-history');
                    // Paginated response has a 'data' key containing the actual array
                    setMovements(res.data.data || []);
                } else {
                    const res = await api.get('/reports/valuation');
                    setValuation(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch report data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await api.get('/reports/export-csv', {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            Swal.fire({
                icon: 'success',
                title: 'Export Complete',
                text: 'Your CSV report has been downloaded.',
                timer: 1500,
                toast: true,
                position: 'top-end',
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire('Error', 'Failed to generate export', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const response = await api.get('/documents/valuation', {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `inventory-valuation-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            Swal.fire('Error', 'Failed to generate PDF', 'error');
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

    const filteredMovements = Array.isArray(movements) ? movements.filter(m =>
        m.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.reference?.toLowerCase().includes(search.toLowerCase())
    ) : [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics & Reports</h1>
                    <p className="text-slate-500 mt-1 font-medium">Export data and track inventory performance</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 className="animate-spin w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                        <span>CSV Export</span>
                    </button>
                    <button
                        onClick={handleDownloadPdf}
                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-slate-100 transition-all active:scale-95"
                    >
                        <Download className="w-5 h-5" />
                        <span>PDF Report</span>
                    </button>
                </div>
            </div>

            {/* Tab Container */}
            <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm flex w-full md:w-fit gap-1">
                <button
                    onClick={() => setActiveTab('movements')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'movements' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <History size={18} />
                    <span>Movement History</span>
                </button>
                <button
                    onClick={() => setActiveTab('valuation')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'valuation' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <BarChart3 size={18} />
                    <span>Inventory Valuation</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Generating Report...</p>
                </div>
            ) : activeTab === 'movements' ? (
                <div className="space-y-6">
                    {/* Search Bar for Movements */}
                    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filter by product name or reference..."
                                className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Movements Table */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product / Details</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Quantity</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredMovements.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <span className={`flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-tighter ${m.type === 'IN' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                    }`}>
                                                    {m.type === 'IN' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                    Stock {m.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-slate-900">{m.product?.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ref: {m.reference || 'N/A'}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                                                    <WarehouseIcon size={14} className="text-blue-500/50" />
                                                    {m.warehouse?.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="font-black text-slate-900">{m.quantity}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{m.product?.unit?.name}</div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="font-bold text-slate-700">{new Date(m.created_at).toLocaleDateString()}</div>
                                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Summary Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100 flex flex-col justify-between min-h-[220px]">
                            <div>
                                <TrendingUp className="w-10 h-10 mb-4 opacity-50" />
                                <h3 className="text-sm font-bold opacity-70 uppercase tracking-widest">Total Asset Value</h3>
                                <p className="text-4xl font-black mt-2 leading-none tracking-tighter">${valuation?.total_value?.toLocaleString() || '0'}</p>
                            </div>
                            <div className="text-xs font-bold opacity-60 flex items-center gap-2 mt-4 bg-white/10 w-fit px-3 py-1 rounded-lg">
                                Real-time Synchronization Enabled
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Inventory Health</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-700">Stock Availability</span>
                                        <span className="text-sm font-black text-blue-600">92%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-600 h-full w-[92%]"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm text-slate-900 font-black text-xl">
                                            {valuation?.product_count || 0}
                                        </div>
                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Unique SKUs</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Valuation List */}
                    <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex items-center gap-3">
                            <FileSpreadsheet className="text-blue-600" />
                            <h3 className="font-extrabold text-slate-900">Per-Product Valuation</h3>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Price</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(valuation?.items || []).map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-5 text-sm font-extrabold text-slate-900">{item.name}</td>
                                            <td className="px-8 py-5 text-right font-black text-slate-700 text-sm">{item.stock}</td>
                                            <td className="px-8 py-5 text-right font-bold text-slate-400 text-xs">${item.cost_price}</td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="font-black text-slate-900">${(item.stock * item.cost_price).toLocaleString()}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsManager;
