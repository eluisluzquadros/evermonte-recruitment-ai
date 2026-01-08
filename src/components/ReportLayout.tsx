import React from 'react';
import { useNavigate, useLocation, useParams, NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    FileText,
    LogOut,
    ChevronRight,
    Briefcase,
    BookOpen,
    Menu,
    X,
    ChevronLeft
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../utils/utils';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { AnimatePresence, motion } from 'framer-motion';

interface ReportLayoutProps {
    children: React.ReactNode;
}

const SidebarItem = ({ to, icon: Icon, label, badge, isCollapsed }: any) => (
    <NavLink
        to={to}
        className={({ isActive }) => cn(
            "flex items-center p-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
            isActive
                ? "bg-primary/10 text-primary shadow-lg shadow-primary/5 border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            isCollapsed ? "justify-center" : ""
        )}
        title={isCollapsed ? label : undefined}
    >
        <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />

        <AnimatePresence>
            {!isCollapsed && (
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center ml-3 overflow-hidden"
                >
                    <span className="font-medium whitespace-nowrap">{label}</span>
                    {badge && (
                        <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/10">
                            {badge}
                        </span>
                    )}
                </motion.div>
            )}
        </AnimatePresence>

        {isCollapsed && badge && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        )}

        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </NavLink>
);

export const ReportLayout: React.FC<ReportLayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const { user, logout } = useAuth();

    // State matching Layout.tsx
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

    const basePath = projectId ? `/projects/${projectId}/report` : '/report';
    const dashboardPath = projectId ? `/projects/${projectId}/dashboard` : '/dashboard';

    // Menu Configuration
    const menuItems = [
        {
            section: 'NAVEGAÇÃO',
            items: [
                { icon: BookOpen, label: 'Capa', Path: `${basePath}/cover` }
            ]
        },
        {
            section: 'SEÇÕES DO RELATÓRIO',
            items: [
                { icon: FileText, label: 'Overview', Path: `${basePath}/overview` },
                { icon: Briefcase, label: 'Sobre a Posição', Path: `${basePath}/position` },
                { icon: Users, label: 'Finalistas', Path: `${basePath}/finalists`, badge: '2' }, // Hardcoded badge for layout sync
                { icon: FileText, label: 'Simulação de Cenários', Path: `${basePath}/comparative` }
            ]
        },
        {
            section: 'AÇÕES',
            items: [
                { icon: LayoutDashboard, label: 'Voltar ao Dashboard', Path: dashboardPath }
            ]
        }
    ];

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground selection:bg-primary/30">
            {/* Background Ambient Glow - Matching Layout.tsx */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-4 right-4 z-50 flex gap-2">
                <ThemeToggle />
                <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </Button>
            </div>

            {/* Sidebar */}
            <aside className={cn(
                "fixed md:relative z-40 h-full bg-card/90 backdrop-blur-xl border-r border-border flex flex-col transition-all duration-300 ease-in-out shadow-2xl shadow-primary/5",
                isSidebarCollapsed ? "w-20" : "w-72",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Header - Brand */}
                <div className={cn(
                    "border-b border-border transition-all duration-300",
                    isSidebarCollapsed ? "p-4 flex flex-col items-center gap-3" : "px-8 py-[50px] flex justify-between items-center"
                )}>
                    <div className={cn("flex items-center gap-3 overflow-visible", isSidebarCollapsed && "justify-center")}>
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-lg shadow-amber-500/20 flex-shrink-0">
                            <span className="text-slate-900 font-bold text-sm block w-6 h-6 text-center leading-6">E</span>
                        </div>
                        <AnimatePresence>
                            {!isSidebarCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-visible"
                                >
                                    <h1 className="text-2xl font-bold font-brand text-foreground tracking-tight whitespace-nowrap leading-tight">
                                        Evermonte
                                    </h1>
                                    <p className="text-[10px] text-muted-foreground tracking-widest uppercase opacity-60 leading-none">
                                        AI-Headhunter
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Desktop Toggle & Theme */}
                    <div className={cn("hidden md:flex items-center gap-2", isSidebarCollapsed && "flex-col")}>
                        {isSidebarCollapsed && <ThemeToggle />}
                        {!isSidebarCollapsed && <ThemeToggle />}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        >
                            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className={cn(
                    "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
                    isSidebarCollapsed ? "p-3 space-y-2" : "p-6 space-y-2"
                )}>
                    {menuItems.map((section, idx) => (
                        <div key={idx} className="mb-4">
                            {!isSidebarCollapsed ? (
                                <h3 className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest px-3 mb-2">
                                    {section.section}
                                </h3>
                            ) : (
                                <div className="h-4 border-b border-border/50 mb-2 mx-2" />
                            )}
                            <div className="space-y-1">
                                {section.items.map((item, itemIdx) => (
                                    <SidebarItem
                                        key={itemIdx}
                                        to={item.Path}
                                        icon={item.icon}
                                        label={item.label}
                                        badge={item.badge}
                                        isCollapsed={isSidebarCollapsed}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User Section (Moved to Bottom) */}
                <div className={cn(
                    "border-t border-border transition-all duration-300",
                    isSidebarCollapsed ? "p-3" : "p-6"
                )}>
                    {user ? (
                        <div className={cn(
                            "flex items-center gap-4 p-3 rounded-xl bg-accent/50 border border-border hover:border-primary/20 transition-colors",
                            isSidebarCollapsed ? "flex-col p-2 gap-2" : ""
                        )}>
                            {user.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="User"
                                    className={cn(
                                        "rounded-full border-2 border-primary/20 flex-shrink-0",
                                        isSidebarCollapsed ? "w-8 h-8" : "w-10 h-10"
                                    )}
                                />
                            ) : (
                                <div className={cn(
                                    "bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0",
                                    isSidebarCollapsed ? "w-8 h-8 text-[10px]" : "w-10 h-10"
                                )}>
                                    {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'EL'}
                                </div>
                            )}

                            <AnimatePresence>
                                {!isSidebarCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex-1 min-w-0"
                                    >
                                        <p className="text-sm font-medium text-foreground truncate">{user.displayName || "User"}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <button
                                onClick={logout}
                                className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className={cn(
                    "text-[10px] text-muted-foreground/30 text-center border-t border-border uppercase tracking-widest",
                    isSidebarCollapsed ? "p-3" : "p-6"
                )}>
                    {!isSidebarCollapsed && "Powered by Gemini 3.0 Pro"}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="min-h-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};
