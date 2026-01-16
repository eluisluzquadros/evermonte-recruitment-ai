import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, MoreVertical, Archive,
  Play, Pause, CheckCircle, Users, Calendar,
  Briefcase, TrendingUp, Download, Copy, FileSpreadsheet, LogOut,
  X, Building2, ArrowRight, Clock, Grid3X3, List,
  ChevronDown, Sparkles, Trash2, Edit3, Target
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/badge';
import { ThemeToggle } from '../components/ThemeToggle';
import { useProjects, Project } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { exportProjectToExcel, exportMultipleProjects, ExportProject, exportProjectToJSON, exportProjectToCSV } from '../utils/excelExporter';
import GlobalChatAssistant from '../components/GlobalChatAssistant';
import { ChatMessage } from '../services/chatService';

// Pipeline phases for the stepper
const PIPELINE_PHASES = [
  { id: 'alignment', label: 'Alinhamento', shortLabel: 'ALIN' },
  { id: 'interviews', label: 'Entrevistas', shortLabel: 'ENTR' },
  { id: 'shortlist', label: 'Shortlist', shortLabel: 'SHORT' },
  { id: 'decision', label: 'Decisão', shortLabel: 'DEC' },
  { id: 'references', label: 'Referências', shortLabel: 'REF' },
  { id: 'report', label: 'Visão Cliente', shortLabel: 'VC' }
];

// Status configuration with colors
const statusConfig = {
  active: { color: 'bg-emerald-500', label: 'Active', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  paused: { color: 'bg-amber-500', label: 'Pausado', badgeClass: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { color: 'bg-blue-500', label: 'Concluído', badgeClass: 'bg-blue-100 text-blue-700 border-blue-200' },
  archived: { color: 'bg-slate-400', label: 'Arquivado', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' }
};

// Project Modal Component (Create/Edit)
interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { companyName: string; roleName: string; funnelMappedCount: number; funnelApproachedCount: number; status: 'active' | 'paused' | 'completed' | 'archived' }) => void;
  isLoading: boolean;
  initialData?: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSubmit, isLoading, initialData }) => {
  const [companyName, setCompanyName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [mappedCount, setMappedCount] = useState('');
  const [approachedCount, setApproachedCount] = useState('');
  const [status, setStatus] = useState<'active' | 'paused' | 'completed' | 'archived'>('active');

  // Populate form when initialData changes or modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      setCompanyName(initialData.companyName);
      setRoleName(initialData.roleName);
      setMappedCount(initialData.funnelMappedCount?.toString() || '0');
      setApproachedCount(initialData.funnelApproachedCount?.toString() || '0');
      setStatus(initialData.status);
    } else if (isOpen && !initialData) {
      // Reset for create mode
      setCompanyName('');
      setRoleName('');
      setMappedCount('');
      setApproachedCount('');
      setStatus('active');
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim() && roleName.trim()) {
      onSubmit({
        companyName: companyName.trim(),
        roleName: roleName.trim(),
        funnelMappedCount: parseInt(mappedCount) || 0,
        funnelApproachedCount: parseInt(approachedCount) || 0,
        status
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                  {initialData ? <Edit3 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {initialData ? 'Editar Workspace' : 'Novo Workspace'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {initialData ? 'Atualizar detalhes do projeto' : 'Criar novo projeto de recrutamento'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nome da Empresa *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: TechCorp Solutions"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Posição / Cargo *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Ex: Senior Product Manager"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Status Selection (Edit Only) */}
            {initialData && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Status do Projeto
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="active">Active (Em andamento)</option>
                    <option value="paused">Pausado</option>
                    <option value="completed">Concluído</option>
                    <option value="archived">Arquivado</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Funnel Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Mapeados
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    value={mappedCount}
                    onChange={(e) => setMappedCount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Abordados
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    value={approachedCount}
                    onChange={(e) => setApproachedCount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                disabled={isLoading || !companyName.trim() || !roleName.trim()}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {initialData ? <Edit3 className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {initialData ? 'Salvar' : 'Criar Workspace'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// Pipeline Stepper Component matching mockup design
const PipelineStepper: React.FC<{ project: Project }> = ({ project }) => {
  // Determine current phase
  const getPhaseStatus = (phaseId: string) => {
    switch (phaseId) {
      case 'alignment':
        return project.phase1Data ? 'completed' : 'current';
      case 'interviews':
        if (!project.phase1Data) return 'pending';
        return (project.candidates?.length || 0) > 0 ? 'completed' : 'current';
      case 'shortlist':
        if ((project.candidates?.length || 0) === 0) return 'pending';
        return (project.shortlist?.length || 0) > 0 ? 'completed' : 'current';
      case 'decision':
        if ((project.shortlist?.length || 0) === 0) return 'pending';
        return project.phase4Result ? 'completed' : 'current';
      case 'references':
        if (!project.phase4Result) return 'pending';
        return project.phase5Result ? 'completed' : 'current';
      case 'report':
        return project.phase5Result ? 'current' : 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className="flex items-center gap-1 py-3">
      {PIPELINE_PHASES.map((phase, index) => {
        const status = getPhaseStatus(phase.id);
        const isCompleted = status === 'completed';
        const isCurrent = status === 'current';

        return (
          <React.Fragment key={phase.id}>
            <div className="flex flex-col items-center flex-1">
              {/* Circle indicator */}
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted
                  ? 'bg-emerald-500 border-emerald-500'
                  : isCurrent
                    ? 'bg-amber-500 border-amber-500'
                    : 'bg-transparent border-slate-300 dark:border-slate-600'
                  }`}
              >
                {isCompleted && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </div>
              {/* Label */}
              <span
                className={`text-[9px] mt-1 font-medium uppercase tracking-wider ${isCompleted
                  ? 'text-emerald-600'
                  : isCurrent
                    ? 'text-amber-600'
                    : 'text-slate-400'
                  }`}
              >
                {phase.shortLabel}
              </span>
            </div>
            {/* Connector line */}
            {index < PIPELINE_PHASES.length - 1 && (
              <div
                className={`flex-1 h-0.5 -mt-4 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Workspace Card Component matching mockup design
const WorkspaceCard: React.FC<{
  project: Project;
  onNavigate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ project, onNavigate, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  // Generate initials from company name
  const initials = project.companyName
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Generate avatar color based on company name
  const avatarColors = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-purple-500 to-purple-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
    'from-cyan-500 to-cyan-600',
  ];
  const colorIndex = project.companyName.length % avatarColors.length;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden group relative">
      <CardContent className="p-5">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Company Avatar */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate text-base">
                {project.companyName}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {project.roleName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs ${statusConfig[project.status].badgeClass}`}
            >
              {statusConfig[project.status].label}
            </Badge>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 overflow-hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pipeline Stepper */}
        <PipelineStepper project={project} />

        {/* Footer Row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {/* Team avatars placeholder */}
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <Users className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              </div>
              {(project.candidatesCount || 0) > 0 && (
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  +{project.candidatesCount}
                </div>
              )}
            </div>
            {/* Last update */}
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {project.createdAt?.toDate().toLocaleDateString('pt-BR') || 'N/A'}
            </span>
          </div>

          {/* CTA Button */}
          <Button
            size="sm"
            variant="ghost"
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white font-medium transition-all group"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate();
            }}
          >
            Go to Workspace
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
export const ProjectsDashboard = () => {
  const { user, logout } = useAuth();

  const { projects, loading, createProject, updateProject, deleteProject } = useProjects(user?.uid || null);
  const navigate = useNavigate();

  // Chat State
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.roleName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.companyName.localeCompare(b.companyName);
      }
      // Sort by recent (updatedAt)
      const dateA = a.createdAt?.toDate() || new Date(0);
      const dateB = b.createdAt?.toDate() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

  // Stats
  const stats = {
    activeRoles: projects.filter(p => p.status === 'active').length,
    totalCandidates: projects.reduce((sum, p) => sum + (p.candidatesCount || 0), 0),
    aiInsights: 5 // Placeholder
  };

  const handleCreateOrUpdateProject = async (data: { companyName: string; roleName: string; funnelMappedCount: number; funnelApproachedCount: number; status: 'active' | 'paused' | 'completed' | 'archived' }) => {
    setIsSaving(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
        setShowModal(false);
        setEditingProject(null);
      } else {
        const projectId = await createProject(data);
        setShowModal(false);
        navigate(`/projects/${projectId}/phase1`);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Erro ao salvar projeto. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans text-foreground selection:bg-primary/30">
      {/* Background Ambient Glow - Evermonte Premium */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="bg-card/90 backdrop-blur-xl border-b border-border sticky top-0 z-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Title & Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                  Evermonte AI-Headhunter
                </h1>
                <Badge variant="outline" className="mt-1 border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-900 dark:text-emerald-400">
                  AI Powered v3.0
                </Badge>
              </div>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 mr-4 border-r border-slate-200 dark:border-slate-800 pr-6">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Active Roles</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.activeRoles}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Candidates</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalCandidates}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Recruiter Admin
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <Users className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  onClick={logout}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por empresa ou cargo..."
              className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-card p-1 rounded-lg border border-border flex items-center">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button
              onClick={handleOpenCreate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Workspace
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'active', 'paused', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${statusFilter === status
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
              {status === 'all' ? 'Todos' : statusConfig[status as keyof typeof statusConfig].label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <AnimatePresence mode="popLayout">
          {filteredProjects.length > 0 ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <WorkspaceCard
                    project={project}
                    onNavigate={() => navigate(`/projects/${project.id}/dashboard`)}
                    onEdit={() => handleOpenEdit(project)}
                    onDelete={() => {
                      if (window.confirm('Tem certeza?')) {
                        deleteProject(project.id);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Nenhum workspace encontrado
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Tente ajustar os filtros ou crie um novo workspace para começar.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Project Modal (Create/Edit) */}
      <ProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateOrUpdateProject}
        isLoading={isSaving}
        initialData={editingProject}
      />
      <GlobalChatAssistant
        appState={{
          phase1Data: null,
          candidates: [],
          shortlist: [],
          phase4Result: null
        }}
        chatHistory={chatHistory}
        onHistoryChange={setChatHistory}
        allProjects={projects}
      />
    </div>
  );
};
