"use client";

import { Shield, Lock, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';

export default function AdminSecurityPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Segurança do Sistema</h1>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Health Status */}
                <div className="bg-surface/30 border border-white/5 p-6 rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500/20 text-green-500 rounded-lg">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Status do Sistema</h3>
                            <p className="text-xs text-green-500 font-bold">OPERACIONAL</p>
                        </div>
                    </div>
                </div>

                {/* Database Mode */}
                <div className="bg-surface/30 border border-white/5 p-6 rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/20 text-primary rounded-lg">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Banco de Dados</h3>
                            <p className="text-xs text-gray-400">RLS ATIVO</p>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-surface/30 border border-white/5 p-6 rounded-xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-500/20 text-yellow-500 rounded-lg">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Alertas</h3>
                            <p className="text-xs text-yellow-500">0 PENDENTES</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Section (Static for now) */}
            <div className="bg-surface/30 border border-white/5 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" /> Logs de Segurança Recentes
                </h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <p className="text-sm text-gray-300">Login automático do sistema detectado</p>
                            </div>
                            <span className="text-xs text-gray-500">Hoje às 14:0{i}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Configs */}
            <div className="bg-surface/30 border border-white/5 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Configurações Globais</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-gray-400" />
                            <div>
                                <h4 className="font-bold text-white text-sm">Autenticação de Dois Fatores (2FA)</h4>
                                <p className="text-xs text-gray-500">Exigir 2FA para todos os administradores</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-secondary rounded-full relative cursor-not-allowed">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
