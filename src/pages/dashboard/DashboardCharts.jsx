import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    BarChart, Bar
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Building2, Loader2 } from 'lucide-react';
import api from '../../api/client';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];

const DashboardCharts = () => {
    const [trendData, setTrendData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [warehouseData, setWarehouseData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [trend, cat, wh] = await Promise.all([
                    api.get('/reports/charts/stock-trend'),
                    api.get('/reports/charts/category-distribution'),
                    api.get('/reports/charts/warehouse-comparison')
                ]);
                setTrendData(trend.data);
                setCategoryData(cat.data);
                setWarehouseData(wh.data);
            } catch (err) {
                console.error("Failed to fetch chart data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Trend Area Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Movement Velocity</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">7-Day Transaction Volume</p>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                tickFormatter={(str) => str.split('-').slice(1).join('/')}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 800 }}
                            />
                            <Area type="monotone" dataKey="in" name="Stock In" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                            <Area type="monotone" dataKey="out" name="Stock Out" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Distribution Pie Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
                        <PieIcon size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Asset Valuation</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Value Distribution by Category</p>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 800 }}
                                formatter={(value) => `$${value.toLocaleString()}`}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Warehouse Comparison Bar Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm lg:col-span-2">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-orange-50 text-orange-600 rounded-2xl">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Global Supply Chain</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Stock Balance across Locations</p>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={warehouseData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 800 }}
                            />
                            <Bar dataKey="stock" name="Units Available" fill="#2563eb" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
