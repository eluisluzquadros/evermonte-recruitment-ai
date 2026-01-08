import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    FileText,
    Target,
    Briefcase,
    Kanban,
    LogOut,
    Presentation,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Quote
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../utils/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

interface LayoutProps {
    children: React.ReactNode;
    user: { name: string, email: string, picture: string } | null;
    onLogout: () => void;
    onLogin: () => void;
    appState: {
        phase1Data: any;
        candidates: any[];
        shortlist: any[];
        phase4Result: any;
        phase5Result?: any;
    };
    chatHistory?: any[];
    onChatHistoryChange?: (history: any[]) => void;
    projectId?: string;
}

const SidebarItem = ({ to, icon: Icon, label, badge, check, isCollapsed }: any) => (
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
                    {check && <span className="ml-auto text-emerald-500 text-xs">✓</span>}
                </motion.div>
            )}
        </AnimatePresence>

        {/* Badge/Check indicator when collapsed */}
        {isCollapsed && (badge || check) && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        )}

        {/* Active Indicator Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </NavLink>
);

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onLogin, appState, chatHistory, onChatHistoryChange, projectId }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    const location = useLocation();

    // Helper to build links
    const getLink = (path: string) => projectId ? `/projects/${projectId}/${path}` : `/${path}`;

    // Close mobile menu on route change
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground selection:bg-primary/30">
            {/* Background Ambient Glow - Evermonte Premium */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-evermonte-gold/5 rounded-full blur-[120px]" />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-4 right-4 z-50 flex gap-2">
                <ThemeToggle />
                <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </Button>
            </div>

            {/* Sidebar - Premium Collapsible */}
            <aside className={cn(
                "fixed md:relative z-40 h-full bg-card/90 backdrop-blur-xl border-r border-border flex flex-col transition-all duration-300 ease-in-out shadow-2xl shadow-primary/5",
                isSidebarCollapsed ? "w-20" : "w-72",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Header - Brand */}
                <div className={cn(
                    "border-b border-border flex items-center transition-all duration-300",
                    isSidebarCollapsed ? "p-4 justify-center" : "p-8 justify-between"
                )}>
                    <div className={cn(
                        "flex items-center gap-3 overflow-visible",
                        isSidebarCollapsed ? "justify-center" : ""
                    )}>
                        <div className="p-2 bg-gradient-to-br from-evermonte-primary to-evermonte-primary-light rounded-xl shadow-lg shadow-primary/20 flex-shrink-0">
                            <Briefcase className="text-white w-5 h-5" />
                        </div>
                        <AnimatePresence>
                            {!isSidebarCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col"
                                >
                                    <h1 className="text-2xl font-bold font-brand text-foreground tracking-tight whitespace-nowrap leading-tight">
                                        Evermonte
                                    </h1>
                                    <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase opacity-70 leading-none">
                                        AI-Headhunter
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Desktop Toggle & Theme */}
                    {!isSidebarCollapsed && (
                        <div className="hidden md:flex items-center gap-2">
                            <ThemeToggle />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {isSidebarCollapsed && (
                    <div className="hidden md:flex flex-col items-center py-4 border-b border-border gap-4">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}



                {/* Navigation */}
                <nav className={cn(
                    "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
                    isSidebarCollapsed ? "p-3 space-y-2" : "p-6 space-y-2"
                )}>
                    {projectId ? (
                        <SidebarItem to="/projects" icon={ChevronLeft} label="Voltar aos Projetos" isCollapsed={isSidebarCollapsed} />
                    ) : null}

                    <SidebarItem to={getLink("dashboard")} icon={Kanban} label="Dashboard" isCollapsed={isSidebarCollapsed} />

                    <div className={cn(
                        "text-xs font-bold text-muted-foreground/50 uppercase tracking-widest",
                        isSidebarCollapsed ? "pt-4 pb-2 text-center" : "pt-6 pb-3 pl-3"
                    )}>
                        {!isSidebarCollapsed ? "Processo Seletivo" : "•••"}
                    </div>

                    <SidebarItem
                        to={getLink("phase1")}
                        icon={LayoutDashboard}
                        label="Alinhamento"
                        check={appState.phase1Data}
                        isCollapsed={isSidebarCollapsed}
                    />
                    <SidebarItem
                        to={getLink("phase2")}
                        icon={Users}
                        label="Entrevistas"
                        badge={appState.candidates.length || undefined}
                        isCollapsed={isSidebarCollapsed}
                    />
                    <SidebarItem
                        to={getLink("phase3")}
                        icon={FileText}
                        label="Shortlist"
                        badge={appState.shortlist.length > 0 ? appState.shortlist.length : undefined}
                        isCollapsed={isSidebarCollapsed}
                    />
                    <SidebarItem
                        to={getLink("phase4")}
                        icon={Target}
                        label="Decisão"
                        check={appState.phase4Result}
                        isCollapsed={isSidebarCollapsed}
                    />
                    <SidebarItem
                        to={getLink("phase5")}
                        icon={Quote}
                        label="Referências"
                        check={appState.phase5Result}
                        isCollapsed={isSidebarCollapsed}
                    />

                    <div className={cn(
                        "text-xs font-bold text-muted-foreground/50 uppercase tracking-widest",
                        isSidebarCollapsed ? "pt-4 pb-2 text-center" : "pt-6 pb-3 pl-3"
                    )}>
                        {!isSidebarCollapsed ? "Apresentação" : "•••"}
                    </div>

                    <SidebarItem
                        to={getLink("report")}
                        icon={Presentation}
                        label="Relatório"
                        isCollapsed={isSidebarCollapsed}
                    />
                </nav>

                {/* User Section (Moved to Bottom) */}
                <div className={cn(
                    "border-t border-border transition-all duration-300 mb-0",
                    isSidebarCollapsed ? "p-3" : "p-6"
                )}>
                    {user ? (
                        <div className={cn(
                            "flex items-center gap-4 p-3 rounded-xl bg-accent/50 border border-border hover:border-primary/20 transition-colors",
                            isSidebarCollapsed ? "flex-col p-2 gap-2" : ""
                        )}>
                            <img
                                src={user.picture}
                                alt="User"
                                className={cn(
                                    "rounded-full border-2 border-primary/20 flex-shrink-0",
                                    isSidebarCollapsed ? "w-8 h-8" : "w-10 h-10"
                                )}
                            />
                            <AnimatePresence>
                                {!isSidebarCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex-1 min-w-0"
                                    >
                                        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <button
                                onClick={onLogout}
                                className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground text-center py-2 italic opacity-50">
                            {!isSidebarCollapsed && "Workspace Mode"}
                        </div>
                    )}
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={cn(
                            "min-h-full p-6 md:p-8 mx-auto transition-all duration-300",
                            isSidebarCollapsed ? "max-w-none px-6 md:px-10" : "max-w-7xl"
                        )}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

        </div>
    );
};
