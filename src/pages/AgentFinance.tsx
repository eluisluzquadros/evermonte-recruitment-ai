
import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Loader2, DollarSign, Zap, FolderKanban, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from '../components/ThemeToggle';

interface TokenUsageRecord {
    id: string;
    timestamp: any;
    modelId: string;
    type: 'input' | 'output';
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
    estimatedCostUSD: number;
    context: {
        phase?: string;
        projectId?: string;
        projectName?: string;
        companyName?: string;
        candidateName?: string;
    };
}

const COLORS = ['#0d9488', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#65a30d'];

export function AgentFinance() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<TokenUsageRecord[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('all');

    useEffect(() => {
        // Wait for auth to be ready and user to be authenticated
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                console.log('[Finance] Fetching data for authenticated user:', user.uid);
                const q = query(
                    collection(db, 'token_usage'),
                    orderBy('timestamp', 'desc'),
                    limit(500)
                );

                const querySnapshot = await getDocs(q);
                const data: TokenUsageRecord[] = [];
                querySnapshot.forEach((doc) => {
                    data.push({ id: doc.id, ...doc.data() } as TokenUsageRecord);
                });

                console.log('[Finance] Fetched', data.length, 'records');
                setRecords(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching finance data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading]);

    if (loading || authLoading) return (
        <div className="flex items-center justify-center h-screen bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    if (!user) return (
        <div className="flex items-center justify-center h-screen bg-background text-foreground">
            <p>Por favor, faça login para ver os dados de custo.</p>
        </div>
    );

    // Build a map of projectId -> displayName (using companyName from context)
    const projectNameMap = records.reduce((acc, r) => {
        const projectId = r.context?.projectId || 'global';
        const displayName = r.context?.companyName || r.context?.projectName;
        if (displayName && !acc[projectId]) {
            acc[projectId] = displayName;
        }
        return acc;
    }, {} as Record<string, string>);

    // Helper function to get display name for a project
    const getProjectDisplayName = (projectId: string): string => {
        if (projectId === 'global') return 'Global (sem projeto)';
        return projectNameMap[projectId] || `Projeto ${projectId.substring(0, 8)}...`;
    };

    // Get unique projects
    const projects = Array.from(new Set(records.map(r => r.context?.projectId || 'global'))).filter(Boolean);

    // Filter records by selected project
    const filteredRecords = selectedProject === 'all'
        ? records
        : records.filter(r => (r.context?.projectId || 'global') === selectedProject);

    // Aggregations
    const totalCost = filteredRecords.reduce((acc, r) => acc + (r.estimatedCostUSD || 0), 0);
    const totalTokens = filteredRecords.reduce((acc, r) => acc + (r.totalTokenCount || 0), 0);
    const inputTokens = filteredRecords.reduce((acc, r) => acc + (r.promptTokenCount || 0), 0);
    const outputTokens = filteredRecords.reduce((acc, r) => acc + (r.candidatesTokenCount || 0), 0);

    // Cost by Phase
    const costByPhase = filteredRecords.reduce((acc, r) => {
        const phase = r.context?.phase || 'Unknown';
        acc[phase] = (acc[phase] || 0) + (r.estimatedCostUSD || 0);
        return acc;
    }, {} as Record<string, number>);

    const phaseChartData = Object.keys(costByPhase)
        .map(key => ({
            name: key.replace('Phase ', ''),
            cost: costByPhase[key],
            fullCost: `$${costByPhase[key].toFixed(4)}`
        }))
        .sort((a, b) => b.cost - a.cost);

    // Cost by Project (for pie chart)
    const costByProject = records.reduce((acc, r) => {
        const project = r.context?.projectId || 'Global';
        acc[project] = (acc[project] || 0) + (r.estimatedCostUSD || 0);
        return acc;
    }, {} as Record<string, number>);

    const projectChartData = Object.keys(costByProject).map((key, idx) => ({
        name: getProjectDisplayName(key),
        fullName: getProjectDisplayName(key),
        value: costByProject[key],
        color: COLORS[idx % COLORS.length]
    }));

    return (
        <div className="p-6 md:p-8 space-y-8 bg-background min-h-screen text-foreground">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Agent-Finance Dashboard</h1>
                    <p className="text-muted-foreground">Monitoramento de custos de IA por workspace e agente.</p>
                </div>

                {/* Project Filter & Theme */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-muted-foreground shrink-0">Workspace:</label>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="bg-card border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                        >
                            <option value="all">Todos os Workspaces</option>
                            {projects.map(p => (
                                <option key={p} value={p}>
                                    {getProjectDisplayName(p)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="h-8 w-[1px] bg-border mx-2" />
                    <ThemeToggle />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custo Total</div>
                            <div className="text-xl font-bold text-primary">R${totalCost.toFixed(4)}</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tokens Totais</div>
                            <div className="text-xl font-bold text-blue-500">{(totalTokens / 1000).toFixed(1)}k</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-500 group-hover:scale-110 transition-transform">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Input / Output</div>
                            <div className="text-xl font-bold text-purple-500">
                                {(inputTokens / 1000).toFixed(0)}k / {(outputTokens / 1000).toFixed(0)}k
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-500 group-hover:scale-110 transition-transform">
                            <FolderKanban className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operações</div>
                            <div className="text-xl font-bold text-orange-500">{filteredRecords.length}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-foreground">Custo por Fase/Agente</CardTitle>
                        <CardDescription className="text-muted-foreground">Distribuição de custos entre os agentes de IA</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {phaseChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={phaseChartData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis type="number" fontSize={12} tick={{ fill: 'currentColor' }} tickFormatter={(v) => `R$${v.toFixed(3)}`} />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        fontSize={11}
                                        tick={{ fill: 'currentColor', fontWeight: 500 }}
                                        width={140}
                                        textAnchor="end"
                                    />
                                    <Tooltip
                                        formatter={(value: number) => [`R$${value.toFixed(6)}`, 'Custo']}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            color: 'hsl(var(--foreground))'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 'bold', marginBottom: '4px' }}
                                    />
                                    <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Nenhum dado disponível
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-foreground">Custo por Workspace</CardTitle>
                        <CardDescription className="text-muted-foreground">Distribuição de custos entre projetos</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {projectChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={projectChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: R$${value.toFixed(3)}`}
                                        labelLine={{ stroke: 'currentColor' }}
                                    >
                                        {projectChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number, name, props) => [`R$${value.toFixed(6)}`, props.payload.fullName]}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                            color: 'hsl(var(--foreground))'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Nenhum dado disponível
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Transaction Table */}
            <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-foreground">Transações Recentes</CardTitle>
                    <CardDescription className="text-muted-foreground">Log de operações de IA e seus custos</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredRecords.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border">
                                    <TableHead className="text-muted-foreground">Hora</TableHead>
                                    <TableHead className="text-muted-foreground">Fase</TableHead>
                                    <TableHead className="text-muted-foreground">Projeto</TableHead>
                                    <TableHead className="text-muted-foreground">Contexto</TableHead>
                                    <TableHead className="text-muted-foreground">Tokens</TableHead>
                                    <TableHead className="text-right text-muted-foreground">Custo (BRL)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRecords.slice(0, 15).map((record) => (
                                    <TableRow key={record.id} className="border-border">
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {record.timestamp?.toDate ? format(record.timestamp.toDate(), 'HH:mm dd/MM') : 'Agora'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-teal-500/50 text-teal-400 text-xs">
                                                {record.context?.phase?.replace('Phase ', '') || 'Unknown'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {getProjectDisplayName(record.context?.projectId || 'global')}
                                        </TableCell>
                                        <TableCell className="text-sm text-foreground">
                                            {record.context?.companyName || record.context?.candidateName || '—'}
                                        </TableCell>
                                        <TableCell className="text-foreground">{record.totalTokenCount?.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-medium text-primary">
                                            R${(record.estimatedCostUSD || 0).toFixed(6)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Nenhuma transação registrada ainda.</p>
                            <p className="text-sm mt-2">Execute análises de IA em um projeto para ver os custos aqui.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
