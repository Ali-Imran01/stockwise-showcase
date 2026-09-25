import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, QrCode as QrIcon, Download } from 'lucide-react';

const ProductLabelModal = ({ isOpen, onClose, product }) => {
    // The real app fetches an SVG from /api/products/:id/qrcode; here it is generated in the browser from the SKU.
    const [qrUrl, setQrUrl] = useState('');
    useEffect(() => {
        if (isOpen && product) QRCode.toDataURL(product.sku, { width: 300, margin: 1 }).then(setQrUrl);
    }, [isOpen, product]);

    if (!isOpen || !product) return null;


    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in border border-slate-100 flex flex-col">

                {/* Header (Hidden on Print) */}
                <div className="p-6 border-b border-slate-50 flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <QrIcon size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900">ID Label</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Label Area (The part to be printed) */}
                <div className="p-10 flex flex-col items-center text-center bg-white" id="label-content">
                    {/* QR Code */}
                    <div className="relative p-4 bg-white border-2 border-slate-100 rounded-[2rem] shadow-inner mb-6 transition-all hover:scale-105 duration-500">
                        <img
                            src={qrUrl}
                            alt={`QR for ${product.sku}`}
                            className="w-48 h-48 object-contain"
                        />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">
                            {product.name}
                        </h3>
                        <p className="text-sm font-bold text-slate-400 font-mono tracking-widest bg-slate-50 py-1 px-4 rounded-full inline-block">
                            {product.sku}
                        </p>
                    </div>

                    {/* Metadata */}
                    <div className="mt-6 flex gap-4">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Category</p>
                            <p className="text-xs font-bold text-slate-600">{product.category?.name || 'N/A'}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100 self-center"></div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Location</p>
                            <p className="text-xs font-bold text-slate-600">WH-{product.warehouse_id || 'Primary'}</p>
                        </div>
                    </div>
                </div>

                {/* Action Footer (Hidden on Print) */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="flex-1 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                    >
                        <Printer size={18} />
                        <span>Print Tag</span>
                    </button>
                    <a
                        href={qrUrl}
                        download={`${product.sku}-qr.svg`}
                        className="p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                        title="Download Raw Image"
                    >
                        <Download size={20} />
                    </a>
                </div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #label-content, #label-content * {
                        visibility: visible;
                    }
                    #label-content {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: white !important;
                        padding: 0 !important;
                    }
                }
                `
            }} />
        </div>
    );
};

export default ProductLabelModal;
