import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

// Layouts & Components
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import ProductList from './pages/products/ProductList';
import StockManager from './pages/stock/StockManager';
import SupplierList from './pages/suppliers/SupplierList';
import WarehouseList from './pages/warehouses/WarehouseList';
import UserList from './pages/users/UserList';
import ReportsManager from './pages/reports/ReportsManager';
import AuditLog from './pages/reports/AuditLog';
import CategoryList from './pages/categories/CategoryList';

const App = () => {
    const { fetchMe, isAuthenticated } = useAuthStore();

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
                />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/dashboard"
                        element={
                            <DashboardLayout>
                                <Dashboard />
                            </DashboardLayout>
                        }
                    />

                    {/* Real Module Routes */}
                    <Route
                        path="/products"
                        element={
                            <DashboardLayout>
                                <ProductList />
                            </DashboardLayout>
                        }
                    />
                    <Route
                        path="/stock"
                        element={
                            <DashboardLayout>
                                <StockManager />
                            </DashboardLayout>
                        }
                    />
                    <Route
                        path="/warehouses"
                        element={
                            <DashboardLayout>
                                <WarehouseList />
                            </DashboardLayout>
                        }
                    />
                    <Route
                        path="/suppliers"
                        element={
                            <DashboardLayout>
                                <SupplierList />
                            </DashboardLayout>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <DashboardLayout>
                                <ReportsManager />
                            </DashboardLayout>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <DashboardLayout>
                                <UserList />
                            </DashboardLayout>
                        }
                    />
                    <Route
                        path="/audit"
                        element={
                            <DashboardLayout>
                                <AuditLog />
                            </DashboardLayout>
                        }
                    />
                    <Route
                        path="/categories"
                        element={
                            <DashboardLayout>
                                <CategoryList />
                            </DashboardLayout>
                        }
                    />
                </Route>

                {/* Fallback */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
