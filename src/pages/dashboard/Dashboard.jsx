import React, { useEffect, useState } from 'react';
import {
    Package,
    ArrowUpCircle,
    ArrowDownCircle,
    AlertCircle,
    TrendingUp,
    Clock,
    DollarSign,
    Box
} from 'lucide-react';
import api from '../../api/client';
import DashboardCharts from './DashboardCharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_value: 0,
        product_count: 0,
        low_stock_count: 0,
        recent_movements: []
    });
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [valRes, lowRes, historyRes] = await Promise.all([
                    api.get('/reports/valuation'),
                    api.get('/products/low-stock'),
                    api.get('/stock/history')
                ]);

                setStats({
                    total_value: valRes.data.total_value,
                    product_count: valRes.data.product_count,
                    low_stock_count: lowRes.data.length,
                    recent_movements: historyRes.data.data.slice(0, 5)
                });
                setLowStockProducts(lowRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        { title: 'Total Inventory Value', value: `$${stats.total_value.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { title: 'Active Products', value: stats.product_count, icon: Box, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        { title: 'Low Stock Alerts', value: stats.low_stock_count, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
        { title: 'Recent Transactions', value: stats.recent_movements.length, icon: ArrowUpCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Overview</h1>
                    <p className="text-slate-500 mt-1 font-medium">Real-time status of your inventory ecosystem</p>
                </div>
                {stats.low_stock_count > 0 && (
                    <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl border border-orange-100 animate-pulse">
                        <AlertCircle size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">{stats.low_stock_count} Critical Alerts</span>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <div key={i} className={`bg-white p-6 rounded-3xl border ${card.border} shadow-sm transition-all hover:shadow-md group`}>
                        <div className="flex items-center justify-between">
                            <div className={`${card.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live</span>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-sm font-bold text-slate-500">{card.title}</h3>
                            <p className="text-2xl font-black text-slate-900 mt-1">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Analytical Visuals */}
            <DashboardCharts />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Movements */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-slate-900">Recent Movements</h3>
                            </div>
                            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Product</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Qty</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats.recent_movements.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{m.product?.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">{m.product?.sku}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${m.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    Stock {m.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-slate-900">{m.quantity}</td>
                                            <td className="px-6 py-4 text-right text-xs text-slate-500 font-medium">
                                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Low Stock Detailed View */}
                    {lowStockProducts.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <TrendingUp className="text-orange-600 w-5 h-5" />
                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Depleted Inventory</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {lowStockProducts.map(p => (
                                    <div key={p.id} className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm flex items-center justify-between group hover:border-orange-400 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-black text-lg border border-orange-100">
                                                {p.total_stock}
                                            </div>
                                            <div>
                                                <div className="font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">{p.name}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Min Required: {p.min_stock}</div>
                                            </div>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all cursor-pointer">
                                            <ArrowUpCircle size={18} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions / Performance */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl shadow-blue-200 text-white flex flex-col justify-between h-full min-h-[300px] group transition-all">
                        <div>
                            <TrendingUp className="w-10 h-10 mb-6 opacity-80 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-black mb-2 leading-tight tracking-tight">Cloud Sync Active</h3>
                            <p className="opacity-70 text-sm font-medium leading-relaxed">System backbone is operational. All inventory movements are logged and indexed for real-time reporting.</p>
                        </div>
                        <div className="space-y-4 mt-8">
                            <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">DB Efficiency</div>
                                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-white h-full w-[98%]"></div>
                                </div>
                            </div>
                            <button className="w-full bg-white text-blue-600 px-6 py-4 rounded-2xl font-black text-sm transition-all hover:bg-blue-50 active:scale-95 shadow-lg shadow-black/10">
                                FULL SYSTEM AUDIT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
