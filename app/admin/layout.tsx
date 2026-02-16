import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { LayoutDashboard, Users, Wallet, List, Shield, Activity, LifeBuoy } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            }
            setLoading(false);
        };
        checkAuth();
    }, [router]);

    const menuItems = [
        { label: "Visão Geral", icon: LayoutDashboard, href: "/admin" },
        { label: "Usuários", icon: Users, href: "/admin/users" },
        { label: "Financeiro", icon: Wallet, href: "/admin/finance" },
        { label: "Apostas", icon: List, href: "/admin/bets" },
        { label: "Segurança", icon: Shield, href: "/admin/security" },
        { label: "Atividades", icon: Activity, href: "/admin/activity" },
        { label: "Suporte", icon: LifeBuoy, href: "/admin/support" },
    ];

    if (loading) return null; // Or a spinner

    return (
        <div className="flex min-h-screen pt-20"> {/* Added pt-20 for fixed header */}
            {/* Sidebar */}
            <aside className="w-64 border-r border-surface bg-secondary/20 hidden md:block fixed h-full left-0 top-20 bottom-0 overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Painel Admin</h2>
                </div>
                <nav className="space-y-1 px-4 pb-20">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-surface/50 transition-colors"
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 p-6 md:p-8 md:ml-64">
                {children}
            </main>
        </div>
    );
}
