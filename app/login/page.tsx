"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';
// import { supabase } from '@/lib/supabase'; // Connected later

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate login
        setTimeout(() => {
            setLoading(false);
            alert("Login functionality will require Supabase credentials.");
        }, 1000);
    };

    return (
        <div className="max-w-md mx-auto py-12">
            <div className="bg-surface border border-surface rounded-xl p-8 space-y-6 shadow-2xl">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Acessar Conta</h1>
                    <p className="text-gray-400 text-sm">Entre para continuar operando</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-surface rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-surface rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Entrando...' : 'Entrar na Plataforma'} <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="text-center text-sm text-gray-400">
                    Não tem uma conta? <Link href="/register" className="text-primary hover:underline">Registre-se agora</Link>
                </div>
            </div>
        </div>
    );
}
