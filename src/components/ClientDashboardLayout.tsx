import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    CheckCircle,
    FileText,
    Moon,
    Sun,
    LogOut,
    ChevronRight,
    Briefcase
} from 'lucide-react';

import { ThemeToggle } from './ThemeToggle';

interface ClientDashboardLayoutProps {
    children: React.ReactNode;
}

export const ClientDashboardLayout: React.FC<ClientDashboardLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            section: 'REPORT NAVIGATION',
            items: [
                { icon: LayoutDashboard, label: 'Visão Geral', path: '/report/overview', badge: null, highlighted: true }
            ]
        },
        {
            section: 'SEÇÕES DO RELATÓRIO',
            items: [
                { icon: FileText, label: 'Overview', path: '/report/overview', badge: null },
                { icon: Briefcase, label: 'Sobre a Posição', path: '/report/position', badge: null },
                { icon: Users, label: 'Finalistas', path: '/report/finalists', badge: '2' },
                { icon: FileText, label: 'Relatório Comparativo', path: '/report/comparative', badge: null }
            ]
        },
        {
            section: 'AÇÕES',
            items: [
                { icon: ClipboardList, label: 'Voltar ao Dashboard', path: '/dashboard', badge: null }
            ]
        }
    ];

    const isActivePath = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center">
                            <Briefcase className="text-slate-900 w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="font-bold text-base tracking-tight">Evermonte</h1>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">AI-HEADHUNTER</p>
                        </div>
                    </div>

                    <div className="mt-3 ml-auto">
                        <ThemeToggle />
                    </div>
                </div>

                {/* User Profile */}
                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                            EL
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Everton Luis Luz</p>
                            <p className="text-xs text-slate-400 truncate">eluzuriaga@gmail.com</p>
                        </div>
                        <button className="text-slate-400 hover:text-white">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                    {menuItems.map((section, idx) => (
                        <div key={idx}>
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                                {section.section}
                            </h3>
                            <ul className="space-y-1">
                                {section.items.map((item, itemIdx) => (
                                    <li key={itemIdx}>
                                        <button
                                            onClick={() => navigate(item.path)}
                                            className={`
                                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                                ${isActivePath(item.path)
                                                    ? 'bg-slate-800 text-white'
                                                    : item.highlighted
                                                        ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                }
                                            `}
                                        >
                                            <item.icon className="w-4 h-4 flex-shrink-0" />
                                            <span className="flex-1 text-left">{item.label}</span>
                                            {item.badge && (
                                                <span className="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {item.badge}
                                                </span>
                                            )}
                                            {item.completed && (
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800">
                    <div className="text-xs text-slate-500 mb-3">
                        <p className="flex items-center gap-1.5 mb-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            POWERED BY GEMINI 3.0 PRO
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/signin')}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside >

            {/* Main Content */}
            < main className="flex-1 overflow-y-auto" >
                {children}
            </main >
        </div >
    );
};
