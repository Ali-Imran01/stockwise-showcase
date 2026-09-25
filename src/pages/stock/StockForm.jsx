import React, { useState, useEffect } from 'react';
import { X, Save, ArrowDownCircle, ArrowUpCircle, Package, Search, Loader2, AlertCircle, Scan } from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';
import BarcodeScanner from '../../components/BarcodeScanner';
import useAuthStore from '../../store/useAuthStore';

const StockForm = ({ isOpen, onClose, onSuccess, initialType = 'IN' }) => {
    const { user } = useAuthStore();
    const [type, setType] = useState(initialType);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [formData, setFormData] = useState({
        product_id: '',
        warehouse_id: '',
        quantity: '',
        reference: ''
    });

    const handleScan = async (decodedText) => {
        setIsScannerOpen(false);
        setLoading(true);
        try {
            // Try to find product by SKU (exact match)
            const res = await api.get('/products', { params: { search: decodedText } });
            const product = res.data.find(p => p.sku === decodedText) || res.data[0];

            if (product) {
                handleSelectProduct(product);
                Swal.fire({
                    icon: 'success',
                    title: 'Product Found',
                    text: `Identified: ${product.name}`,
                    timer: 1500,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false
                });
            } else {
                Swal.fire('Not Found', 'No product matches this code.', 'warning');
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to identify scanned product.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await api.get('/warehouses');
                setWarehouses(res.data.filter(w => w.is_active));
                if (res.data.length > 0 && !formData.warehouse_id) {
                    setFormData(prev => ({ ...prev, warehouse_id: res.data[0].id }));
                }
            } catch (err) {
                console.error("Failed to fetch warehouses", err);
            }
        };
        if (isOpen) fetchWarehouses();
    }, [isOpen]);

    useEffect(() => {
        if (search.length > 1) {
            const fetchProducts = async () => {
                const res = await api.get('/products', { params: { search } });
                setProducts(res.data);
            };
            fetchProducts();
        } else {
            setProducts([]);
        }
    }, [search]);

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setFormData(prev => ({ ...prev, product_id: product.id }));
        setSearch('');
        setProducts([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (user?.role === 'viewer') {
            Swal.fire('Forbidden', 'Viewing users cannot modify stock levels.', 'error');
            return;
        }
        setLoading(true);

        try {
            const endpoint = type === 'IN' ? '/stock/in' : '/stock/out';
            await api.post(endpoint, formData);

            Swal.fire({
                icon: 'success',
                title: 'Stock Updated',
                text: `Successfully processed ${type} movement for ${selectedProduct.name}`,
                timer: 1500,
                toast: true,
                position: 'top-end',
                showConfirmButton: false
            });
            onSuccess();
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.message || 'Transaction failed';
            Swal.fire('Error', msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const projectedStock = selectedProduct
        ? (type === 'IN' ? selectedProduct.total_stock + Number(formData.quantity || 0) : selectedProduct.total_stock - Number(formData.quantity || 0))
        : 0;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {type === 'IN' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight">Stock Movement</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Adjustment Transaction</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 bg-slate-50/50 flex gap-2">
                    <button
                        onClick={() => setType('IN')}
                        className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all ${type === 'IN' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Stock IN
                    </button>
                    <button
                        onClick={() => setType('OUT')}
                        className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all ${type === 'OUT' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Stock OUT
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Product Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Product</label>
                        {!selectedProduct ? (
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Type SKU or Name to search..."
                                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsScannerOpen(true)}
                                    className="px-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all active:scale-95"
                                    title="Open Laser Scanner"
                                >
                                    <Scan size={20} />
                                </button>
                                {products.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 max-h-60 overflow-y-auto p-2">
                                        {products.map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => handleSelectProduct(p)}
                                                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs capitalize">
                                                        {p.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600">{p.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono">{p.sku}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-slate-900">{p.total_stock}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase font-bold">{p.unit?.name}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <Package className="text-blue-600" size={24} />
                                    <div>
                                        <div className="font-bold text-slate-900">{selectedProduct.name}</div>
                                        <div className="text-xs text-slate-500 font-mono">{selectedProduct.sku}</div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedProduct(null)}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
                                >
                                    Change
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Warehouse Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Location</label>
                        <select
                            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                            value={formData.warehouse_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, warehouse_id: e.target.value }))}
                            required
                        >
                            <option value="" disabled>Select a Warehouse</option>
                            {warehouses.map(w => (
                                <option key={w.id} value={w.id}>
                                    {w.name} {w.location ? `(${w.location})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Numeric Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                placeholder="0"
                                className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 font-black focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.quantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                required
                                min="1"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Current Stock</label>
                            <div className="w-full bg-slate-100 rounded-2xl py-3.5 px-4 font-black text-slate-500 flex items-center justify-center">
                                {selectedProduct ? selectedProduct.total_stock : '--'}
                            </div>
                        </div>
                    </div>

                    {/* Projected Stock Preview */}
                    {selectedProduct && formData.quantity && (
                        <div className={`p-4 rounded-2xl border flex items-center justify-between ${projectedStock < 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16} className={projectedStock < 0 ? 'text-red-600' : 'text-green-600'} />
                                <span className="text-xs font-bold text-slate-600">Projected Final Stock</span>
                            </div>
                            <span className={`text-lg font-black ${projectedStock < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {projectedStock} {selectedProduct.unit?.name}
                            </span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Reference / Note</label>
                        <input
                            type="text"
                            name="reference"
                            placeholder="Supplier Invoice # or Purpose"
                            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.reference}
                            onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !selectedProduct || (type === 'OUT' && projectedStock < 0)}
                        className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${type === 'IN' ? 'bg-green-600 shadow-green-100 ring-green-600' : 'bg-red-600 shadow-red-100 ring-red-600'}`}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Confirm Process {type}
                    </button>

                    {type === 'OUT' && projectedStock < 0 && (
                        <p className="text-[10px] text-red-500 font-bold text-center uppercase tracking-tighter">Cannot process transaction: Insufficient available stock</p>
                    )}
                </form>
            </div>

            {isScannerOpen && (
                <BarcodeScanner
                    onScan={handleScan}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}
        </div>
    );
};

export default StockForm;
