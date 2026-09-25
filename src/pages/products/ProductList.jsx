import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    MoreVertical,
    Box,
    ChevronRight,
    Loader2,
    PackageSearch,
    AlertCircle,
    Scan,
    Upload,
    QrCode
} from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';
import useAuthStore from '../../store/useAuthStore';
import ProductForm from './ProductForm';
import ImportManager from './ImportManager';
import ProductLabelModal from './ProductLabelModal';
import BarcodeScanner from '../../components/BarcodeScanner';

const ProductList = () => {
    const { user } = useAuthStore();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [selectedQrProduct, setSelectedQrProduct] = useState(null);

    const handleScan = (decodedText) => {
        setIsScannerOpen(false);
        setSearch(decodedText);
        Swal.fire({
            icon: 'success',
            title: 'Scan Successful',
            text: `Filtering for: ${decodedText}`,
            timer: 1500,
            toast: true,
            position: 'top-end',
            showConfirmButton: false
        });
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/products', {
                params: {
                    search,
                    category_id: selectedCategory || undefined
                }
            });
            setProducts(response.data);
        } catch (error) {
            Swal.fire('Error', 'Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, selectedCategory]);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This product and its history will be permanently deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/products/${id}`);
                Swal.fire('Deleted!', 'Product has been removed.', 'success');
                fetchProducts();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete product', 'error');
            }
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleOpenQr = (product) => {
        setSelectedQrProduct(product);
        setIsQrOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage your inventory items and stock levels</p>
                </div>
                {user?.role !== 'viewer' && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsImportOpen(true)}
                            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 px-6 py-3 rounded-2xl font-bold border border-slate-100 shadow-sm transition-all active:scale-95"
                        >
                            <Upload className="w-5 h-5" />
                            <span>Import</span>
                        </button>
                        <button
                            onClick={handleAddNew}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add New Product</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex flex-1 gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by SKU or Name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setIsScannerOpen(true)}
                        className="px-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all active:scale-95"
                        title="Scan to Find"
                    >
                        <Scan size={20} />
                    </button>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border-none rounded-2xl px-4 py-1">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-transparent border-none py-3 text-sm font-bold text-slate-600 focus:ring-0 outline-none cursor-pointer min-w-[140px]"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dotted border-slate-200">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-slate-500 font-bold">Synchronizing Data...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 text-center px-4">
                    <div className="bg-slate-50 p-6 rounded-full mb-6">
                        <PackageSearch className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No Products Found</h3>
                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">Try adjusting your search or add a new product to your inventory.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Product Info</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Pricing</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Stock Level</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <Box size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900">{product.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono font-bold tracking-tighter">{product.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                                                {product.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-900">${product.sell_price}</div>
                                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Cost: ${product.cost_price}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[80px] overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${product.total_stock <= product.min_stock ? 'bg-orange-500' : 'bg-green-500'
                                                            }`}
                                                        style={{ width: `${Math.min((product.total_stock / (product.min_stock * 2)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-sm font-black ${product.total_stock <= product.min_stock ? 'text-orange-600' : 'text-slate-900'
                                                    }`}>
                                                    {product.total_stock} <span className="text-[10px] font-bold text-slate-400">{product.unit?.name}</span>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user?.role !== 'viewer' && (
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenQr(product)}
                                                        className="p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                                                        title="View QR Label"
                                                    >
                                                        <QrCode size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                {product.total_stock <= product.min_stock && (
                                    <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter">
                                        Low Stock
                                    </div>
                                )}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Box size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 leading-tight">{product.name}</h4>
                                            <p className="text-xs text-slate-500 font-mono mt-0.5">{product.sku}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-slate-900">${product.sell_price}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{product.category?.name}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                    <div className="bg-slate-50/50 p-3 rounded-2xl">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Stock Level</span>
                                        <span className={`text-sm font-black ${product.total_stock <= product.min_stock ? 'text-orange-600' : 'text-slate-900'}`}>
                                            {product.total_stock} {product.unit?.name}
                                        </span>
                                    </div>
                                    {user?.role !== 'viewer' ? (
                                        <div className="flex items-center justify-end gap-2 text-slate-400">
                                            <button
                                                onClick={() => handleOpenQr(product)}
                                                className="w-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 hover:text-blue-600 rounded-2xl transition-all p-3"
                                            >
                                                <QrCode size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="w-full h-full flex items-center justify-center bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all p-3"
                                            >
                                                <Edit2 size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="w-full h-full flex items-center justify-center bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all p-3"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end">
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Read Only</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Product Form Drawer/Modal Placeholder */}
            {isFormOpen && (
                <ProductForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => {
                        setIsFormOpen(false);
                        fetchProducts();
                    }}
                    product={editingProduct}
                />
            )}

            {isScannerOpen && (
                <BarcodeScanner
                    onScan={handleScan}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}

            {isImportOpen && (
                <ImportManager
                    isOpen={isImportOpen}
                    onClose={() => setIsImportOpen(false)}
                    onSuccess={fetchProducts}
                />
            )}

            <ProductLabelModal
                isOpen={isQrOpen}
                onClose={() => setIsQrOpen(false)}
                product={selectedQrProduct}
            />
        </div>
    );
};

export default ProductList;
