import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, Zap } from 'lucide-react';

const BarcodeScanner = ({ onScan, onClose }) => {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showZoomSliderIfSupported: true,
                showTorchButtonIfSupported: true,
                rememberLastUsedCamera: true,
            },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                scanner.clear().then(() => {
                    onScan(decodedText);
                }).catch(err => {
                    console.error("Scanner clear failed", err);
                    onScan(decodedText);
                });
            },
            (error) => {
                // Ignore decoding errors
            }
        );

        return () => {
            scanner.clear().catch(error => {
                // Might already be cleared or failed to init
            });
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={onClose}></div>

            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in border border-white/20">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight">Optical Scan</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Identifying Product SKU</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-slate-50 text-slate-400 rounded-2xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div id="reader" className="overflow-hidden rounded-3xl border-4 border-slate-50 shadow-inner bg-slate-50 min-h-[300px]"></div>

                    <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                        <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm border border-slate-100">
                            <Camera size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-600 leading-snug">Align the code within the viewport.</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase mt-2 tracking-widest italic">Ensure adequate lighting for better performance.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                    >
                        Dismiss Scanner
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                #reader button {
                    background-color: #2563eb !important;
                    color: white !important;
                    border: none !important;
                    padding: 0.75rem 1.5rem !important;
                    border-radius: 1rem !important;
                    font-weight: 800 !important;
                    font-size: 0.875rem !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2) !important;
                }
                #reader button:hover {
                    background-color: #1d4ed8 !important;
                    transform: translateY(-1px) !important;
                }
                #reader select {
                    background-color: #f8fafc !important;
                    border: 1px solid #e2e8f0 !important;
                    padding: 0.5rem !important;
                    border-radius: 0.75rem !important;
                    font-weight: 600 !important;
                    color: #475569 !important;
                    margin: 0.5rem 0 !important;
                }
                #reader__scan_region {
                    border: none !important;
                    background: #f8fafc !important;
                }
                #reader__dashboard_section_csr button {
                    margin: 0.5rem !important;
                }
            `}} />
        </div>
    );
};

export default BarcodeScanner;
