import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Box,
    Layers,
    Truck,
    Warehouse as WarehouseIcon,
    ArrowUpDown,
    AlertTriangle,
    FileText,
    LogOut,
    Menu,
    X,
    User,
    ChevronRight,
    Search
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'staff', 'viewer'] },
        { name: 'Products', icon: Box, path: '/products', roles: ['admin', 'staff', 'viewer'] },
        { name: 'Warehouses', icon: WarehouseIcon, path: '/warehouses', roles: ['admin', 'staff', 'viewer'] },
        { name: 'Categories', icon: Layers, path: '/categories', roles: ['admin', 'staff', 'viewer'] },
        { name: 'Stock In/Out', icon: ArrowUpDown, path: '/stock', roles: ['admin', 'staff'] },
        { name: 'Suppliers', icon: Truck, path: '/suppliers', roles: ['admin', 'staff'] },
        { name: 'Reports', icon: FileText, path: '/reports', roles: ['admin', 'staff', 'viewer'] },
        { name: 'Team', icon: User, path: '/users', roles: ['admin'] },
    ].filter(item => item.roles.includes(user?.role));

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg shadow-blue-100 shadow-lg">
                        <Box className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-slate-900 tracking-tight">StockWise</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
                >
                    <Menu className="w-6 h-6 text-slate-600" />
                </button>
            </div>

            {/* Sidebar / Mobile Drawer Overlay */}
            <div className={`fixed inset-0 z-50 transition-opacity bg-slate-900/40 backdrop-blur-sm md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>

            {/* Sidebar Content */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col transition-transform transform md:translate-x-0 md:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-blue-200 shadow-lg">
                            <Box className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight">StockWise</span>
                    </div>
                    <button className="md:hidden p-2" onClick={() => setIsSidebarOpen(false)}>
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="px-4 mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${location.pathname === item.path
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5" />
                                <span className="font-semibold text-sm">{item.name}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${location.pathname === item.path ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 mt-auto">
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="font-bold text-sm text-slate-900 truncate">{user?.name}</h4>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto max-h-screen">
                <div className="p-4 md:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
