import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Visão Geral</h1>
                <div className="text-sm text-gray-400">Atualizado em tempo real</div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Receita Total" value="R$ 45.230,00" change="+12.5%" isPositive icon={DollarSign} />
                <KpiCard title="Usuários Ativos" value="1,234" change="+5.2%" isPositive icon={Users} />
                <KpiCard title="Volume Apostado" value="R$ 128k" change="-2.1%" isPositive={false} icon={TrendingUp} />
                <KpiCard title="Lucro da Casa" value="R$ 8.140,00" change="+8.4%" isPositive icon={Activity} />
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Charts Section Placeholder */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-surface/30 border border-surface rounded-xl p-6 h-80 flex items-center justify-center">
                        [Gráfico: Receita vs Lucro (30 dias)]
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-surface/30 border border-surface rounded-xl p-6 h-64 flex items-center justify-center">
                            [Gráfico: Apostas por Categoria]
                        </div>
                        <div className="bg-surface/30 border border-surface rounded-xl p-6 h-64 flex items-center justify-center">
                            [Gráfico: Distribuição de Saldo]
                        </div>
                    </div>
                </div>

                {/* Realtime Feed */}
                <div className="bg-black/40 border border-surface rounded-xl flex flex-col h-[600px]">
                    <div className="p-4 border-b border-surface">
                        <h3 className="font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Atividade em Tempo Real
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
                        {/* Mock Log Items */}
                        <LogItem time="10:42:05" user="user_8291" action="BET_PLACED" details="R$ 50.00 on BTC YES" />
                        <LogItem time="10:41:55" user="user_1102" action="DEPOSIT" details="R$ 200.00 via PIX" color="text-green-400" />
                        <LogItem time="10:41:20" user="user_5593" action="NEW_USER" details="Registered from SP" color="text-blue-400" />
                        <LogItem time="10:40:15" user="user_9982" action="CASHOUT" details="R$ 125.50 from FLA" color="text-yellow-400" />
                        <LogItem time="10:38:00" user="SYSTEM" action="MARKET_CLOSE" details="ID: 8821 (SpaceX)" color="text-red-400" />
                        {/* Repeat for visual density */}
                        {[...Array(10)].map((_, i) => (
                            <LogItem key={i} time={`10:${30 - i}:00`} user={`user_${1000 + i}`} action="BET_PLACED" details="R$ 10.00" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, change, isPositive, icon: Icon }: any) {
    return (
        <div className="bg-surface/30 border border-surface p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-surface rounded-lg">
                    <Icon className="w-5 h-5 text-gray-300" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {change}
                </span>
            </div>
            <div>
                <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
            </div>
        </div>
    );
}

function LogItem({ time, user, action, details, color = "text-gray-400" }: any) {
    return (
        <div className="flex gap-3 border-l-2 border-surface pl-3 py-1">
            <span className="text-gray-600 opacity-50">{time}</span>
            <div className="flex-1">
                <span className="text-gray-300 font-bold mr-2">{user}</span>
                <span className={`font-bold mr-2 ${color}`}>{action}</span>
                <span className="text-gray-500">{details}</span>
            </div>
        </div>
    );
}
