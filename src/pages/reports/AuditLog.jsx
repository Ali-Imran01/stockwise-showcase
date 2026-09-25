import React, { useState, useEffect } from 'react';
import {
    History,
    User,
    Activity,
    Search,
    Loader2,
    Calendar,
    ChevronDown,
    Eye
} from 'lucide-react';
import api from '../../api/client';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/audit-logs');
            setLogs(response.data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.user?.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Audit Log</h1>
                <p className="text-slate-500 mt-1 font-medium">Immutable history of administrative actions</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by action or user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operator</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payload</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                            <Calendar size={14} className="text-blue-500" />
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-black ml-5">
                                            {new Date(log.created_at).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200">
                                                {log.user?.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-black text-slate-700">{log.user?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${log.action.includes('CREATED') ? 'bg-green-50 text-green-600' :
                                                log.action.includes('UPDATED') ? 'bg-blue-50 text-blue-600' :
                                                    log.action.includes('DELETED') ? 'bg-red-50 text-red-600' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                            {log.action.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => Swal.fire({
                                                title: 'Transaction Details',
                                                html: `<pre class="text-left text-xs bg-slate-900 text-green-400 p-4 rounded-xl overflow-auto">${JSON.stringify(log.payload, null, 2)}</pre>`,
                                                customClass: { popup: 'rounded-[2rem]' }
                                            })}
                                            className="flex items-center gap-2 text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                                        >
                                            <Eye size={12} />
                                            Inspect Data
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
