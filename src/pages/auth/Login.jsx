import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { Package, Eye, EyeOff, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const success = await login(email, password);

        if (success) {
            Swal.fire({
                icon: 'success',
                title: 'Welcome Back!',
                text: 'Logging you into the system...',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            navigate('/dashboard');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Please check your credentials and try again.'
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 mb-6">
                    <Package className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Welcome to StockWise
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    Your modern inventory management partner
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-2xl shadow-slate-200 sm:rounded-3xl rounded-2xl border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                placeholder="admin@stockwise.demo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Demo Accounts</span>
                        <div className="flex flex-col gap-1.5">
                            {[['admin', 'admin@stockwise.demo'], ['staff', 'staff@stockwise.demo'], ['viewer', 'viewer@stockwise.demo']].map(([role, demoEmail]) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => { setEmail(demoEmail); setPassword('password'); }}
                                    className="text-xs text-slate-500 font-mono bg-slate-50 hover:bg-blue-50 hover:text-blue-700 p-2 rounded transition-colors"
                                >
                                    {demoEmail} / password <span className="uppercase font-bold text-slate-400">({role})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
