import React, { useState, useEffect } from 'react';
import { runPhase3Shortlist } from '../services/geminiService';
import { Phase3Result, Phase2Result } from '../types';
import { Loader2 } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/Textarea';
import { motion } from 'framer-motion';
import { cn } from '../utils/utils';
import { toast } from 'sonner';
import { Clipboard } from 'lucide-react';

interface CandidateData {
    name: string;
    cvText: string;
    interviewReport: string;
    fullPhase2?: Phase2Result;
}

interface Props {
    candidates: CandidateData[];
    shortlist: Phase3Result[];
    onShortlistFinalized: (results: Phase3Result[]) => void;
    projectId?: string;
}

const Phase3Shortlist: React.FC<Props> = ({ candidates, shortlist, onShortlistFinalized, projectId }) => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Phase3Result[]>(shortlist || []);
    const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

    // Human approval workflow
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editedResult, setEditedResult] = useState<Phase3Result | null>(null);

    useEffect(() => {
        if (shortlist && shortlist.length > 0) {
            setResults(shortlist);
        }
    }, [shortlist]);

    useEffect(() => {
        if (candidates.length > 0 && selectedCandidates.length === 0) {
            setSelectedCandidates(candidates.map(c => c.name));
        }
    }, [candidates.length]);

    // Start editing a specific candidate result
    const startEditingResult = (index: number) => {
        setEditingIndex(index);
        setEditedResult({ ...results[index] });
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingIndex(null);
        setEditedResult(null);
    };

    // Approve and save changes for one candidate
    const approveResultChanges = () => {
        if (editedResult !== null && editingIndex !== null) {
            const newResults = [...results];
            newResults[editingIndex] = editedResult;
            setResults(newResults);
            onShortlistFinalized(newResults);
            setEditingIndex(null);
            setEditedResult(null);
        }
    };

    // Update a field in edited result
    const updateEditedField = (field: keyof Phase3Result, value: any) => {
        if (editedResult) {
            setEditedResult({ ...editedResult, [field]: value });
        }
    };

    const toggleCandidate = (name: string) => {
        setSelectedCandidates(prev =>
            prev.includes(name)
                ? prev.filter(n => n !== name)
                : [...prev, name]
        );
    };

    const toggleAll = () => {
        if (selectedCandidates.length === candidates.length) {
            setSelectedCandidates([]);
        } else {
            setSelectedCandidates(candidates.map(c => c.name));
        }
    };

    const handleAnalyze = async () => {
        const candidatesToAnalyze = candidates.filter(c => selectedCandidates.includes(c.name));

        if (candidatesToAnalyze.length === 0) {
            alert("Selecione pelo menos um candidato para gerar a shortlist.");
            return;
        }

        setLoading(true);
        try {
            const data = await runPhase3Shortlist(candidatesToAnalyze, projectId);
            setResults(data);
            onShortlistFinalized(data);
        } catch (e) {
            console.error(e);
            alert(`Error generating shortlist analysis: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success("Copiado!");
        }).catch(console.error);
    };

    const formatCandidateForClipboard = (r: Phase3Result) => {
        return `
CANDIDATO: ${r.candidateName} (ID: ${r.shortlistId})
--------------------------------------------------
IDADE: ${r.age}
LOCALIDADE: ${r.location}
POSIÇÃO ATUAL: ${r.currentPosition}
REMUNERAÇÃO: ${r.remunerationPackage}

HISTÓRICO ACADÊMICO:
${r.academicHistory}

EXPERIÊNCIA PROFISSIONAL:
${r.professionalExperience}

PRINCIPAIS PROJETOS:
${r.mainProjects}

CORE SKILLS:
${r.coreSkills}

MOTIVAÇÕES:
${r.motivations}
--------------------------------------------------
`;
    };

    const handleCopyAll = () => {
        const allText = results.map(r => formatCandidateForClipboard(r)).join('\n\n');
        copyToClipboard(allText);
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="bg-card border-border shrink-0">
                    <CardHeader>
                        <CardTitle className="text-2xl text-foreground flex items-center gap-3">
                            Fase 3: Shortlist Comparativa
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">
                            Selecione os candidatos aprovados na Fase 2 para gerar uma matriz comparativa executiva.
                        </p>
                    </CardHeader>
                </Card>
            </motion.div>

            <div className="flex-1 overflow-hidden flex flex-col">
                {candidates.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 bg-card border-dashed border-border text-center h-full">

                        <h3 className="text-lg font-bold text-foreground mb-2">Nenhum candidato na fila</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Vá para a aba <strong>Fase 2: Entrevistas</strong> e avalie pelo menos um candidato para gerar a shortlist.
                        </p>
                    </Card>
                ) : (
                    <div className="flex flex-col h-full space-y-6">
                        {/* Selection Area */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="shrink-0 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-muted-foreground flex items-center">
                                    Seleção de Finalistas ({selectedCandidates.length}/{candidates.length})
                                </h4>
                                <Button
                                    onClick={toggleAll}
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-primary hover:text-primary/80"
                                >
                                    {selectedCandidates.length === candidates.length ? "Desmarcar Todos" : "Marcar Todos"}
                                </Button>
                            </div>

                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1 custom-scrollbar"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.1
                                        }
                                    }
                                }}
                                initial="hidden"
                                animate="show"
                            >
                                {candidates.map((c, idx) => {
                                    const isSelected = selectedCandidates.includes(c.name);
                                    const recommendation = c.fullPhase2?.recommendation || "N/A";
                                    const isRecommended = recommendation.toLowerCase().includes('aprovado') || recommendation.toLowerCase().includes('avançar');

                                    return (
                                        <motion.div
                                            key={idx}
                                            variants={{
                                                hidden: { opacity: 0, y: 20 },
                                                show: { opacity: 1, y: 0 }
                                            }}
                                            onClick={() => toggleCandidate(c.name)}
                                            className={cn(
                                                "cursor-pointer relative p-3 rounded-lg border transition-all duration-200 group",
                                                isSelected
                                                    ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20'
                                                    : 'bg-card border-border hover:border-primary/20 hover:bg-accent'
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    <input type="checkbox" checked={isSelected} readOnly className="w-4 h-4 cursor-pointer accent-blue-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-foreground text-sm truncate">{c.name}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                        {c.fullPhase2?.currentPosition || 'Posição não informada'}
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className={cn(
                                                            "text-[10px] px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]",
                                                            isRecommended ? 'bg-emerald-500/20 text-emerald-500' : 'bg-accent text-muted-foreground'
                                                        )}>
                                                            {recommendation}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>

                            <Button
                                onClick={handleAnalyze}
                                disabled={loading || selectedCandidates.length === 0}
                                variant="premium"
                                className="w-full md:w-auto shadow-lg shadow-primary/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 w-4 h-4" />
                                        Processando IA...
                                    </>
                                ) : (
                                    <>
                                        Gerar Shortlist
                                        <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-xs">
                                            {selectedCandidates.length}
                                        </span>
                                    </>
                                )}
                            </Button>
                        </motion.div>

                        {/* Results View - Cards */}
                        {results.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 flex flex-col min-h-0 border-t border-border pt-6"
                            >
                                <div className="flex items-center justify-between mb-4 shrink-0">
                                    <h3 className="text-lg font-bold text-foreground flex items-center">
                                        Shortlist Gerada
                                    </h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyAll}
                                        className="text-muted-foreground"
                                    >
                                        Copiar dados
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
                                    {results.map((r, idx) => (
                                        <Card key={idx} className={cn("bg-card border-border overflow-hidden transition-all", editingIndex === idx ? "ring-2 ring-primary" : "")}>
                                            <CardHeader className="bg-accent/30 border-b border-border pb-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-4 w-full">
                                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
                                                            {r.shortlistId}
                                                        </div>
                                                        <div className="w-full">
                                                            {editingIndex === idx ? (
                                                                <div className="space-y-4">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div className="space-y-1">
                                                                            <label className="text-xs font-bold text-muted-foreground">CANDIDATO</label>
                                                                            <input
                                                                                className="w-full bg-background border border-input rounded px-2 py-1 text-lg font-bold"
                                                                                value={editedResult?.candidateName}
                                                                                onChange={(e) => updateEditedField('candidateName', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-xs font-bold text-muted-foreground">POSIÇÃO ATUAL</label>
                                                                            <input
                                                                                className="w-full bg-background border border-input rounded px-2 py-1"
                                                                                value={editedResult?.currentPosition}
                                                                                onChange={(e) => updateEditedField('currentPosition', e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-1">
                                                                            <label className="text-xs font-bold text-muted-foreground">IDADE</label>
                                                                            <input
                                                                                className="w-full bg-background border border-input rounded px-2 py-1"
                                                                                value={editedResult?.age}
                                                                                onChange={(e) => updateEditedField('age', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-xs font-bold text-muted-foreground">LOCALIDADE</label>
                                                                            <input
                                                                                className="w-full bg-background border border-input rounded px-2 py-1"
                                                                                value={editedResult?.location}
                                                                                onChange={(e) => updateEditedField('location', e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <CardTitle className="text-xl text-foreground font-bold">
                                                                        {r.candidateName}
                                                                    </CardTitle>
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                                        <div>
                                                                            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1">POSIÇÃO ATUAL</h4>
                                                                            <p className="text-sm font-medium">{r.currentPosition}</p>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1">IDADE</h4>
                                                                            <p className="text-sm">{r.age}{r.age?.includes('anos') ? '' : ' anos'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1">LOCALIDADE</h4>
                                                                            <p className="text-sm">{r.location}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-2 shrink-0 ml-4">
                                                        {editingIndex === idx ? (
                                                            <>
                                                                <Button size="sm" onClick={approveResultChanges} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                                    Salvar
                                                                </Button>
                                                                <Button size="sm" variant="outline" onClick={cancelEditing}>
                                                                    Cancelar
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => startEditingResult(idx)}
                                                                    className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                                                                >
                                                                    Editar
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        copyToClipboard(formatCandidateForClipboard(r));
                                                                    }}
                                                                    className="text-muted-foreground"
                                                                >
                                                                    Copiar dados
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="p-6 space-y-6">
                                                {editingIndex === idx ? (
                                                    <div className="space-y-6">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold uppercase text-primary">HISTÓRICO ACADÊMICO</label>
                                                            <Textarea
                                                                value={editedResult?.academicHistory}
                                                                onChange={e => updateEditedField('academicHistory', e.target.value)}
                                                                rows={4}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold uppercase text-primary">EXPERIÊNCIA PROFISSIONAL</label>
                                                            <Textarea
                                                                value={editedResult?.professionalExperience}
                                                                onChange={e => updateEditedField('professionalExperience', e.target.value)}
                                                                rows={6}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold uppercase text-primary">PRINCIPAIS PROJETOS DA CARREIRA</label>
                                                            <Textarea
                                                                value={editedResult?.mainProjects}
                                                                onChange={e => updateEditedField('mainProjects', e.target.value)}
                                                                rows={6}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold uppercase text-primary">PACOTE DE REMUNERAÇÃO ATUAL</label>
                                                            <Textarea
                                                                value={editedResult?.remunerationPackage}
                                                                onChange={e => updateEditedField('remunerationPackage', e.target.value)}
                                                                rows={2}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold uppercase text-primary">CORE SKILLS</label>
                                                            <Textarea
                                                                value={editedResult?.coreSkills}
                                                                onChange={e => updateEditedField('coreSkills', e.target.value)}
                                                                rows={5}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-bold uppercase text-primary">MOTIVAÇÕES</label>
                                                            <Textarea
                                                                value={editedResult?.motivations}
                                                                onChange={e => updateEditedField('motivations', e.target.value)}
                                                                rows={3}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Read-Only View
                                                    <>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-primary mb-2 uppercase flex items-center">
                                                                HISTÓRICO ACADÊMICO
                                                            </h4>
                                                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                                                {r.academicHistory}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <h4 className="text-sm font-bold text-primary mb-2 uppercase flex items-center">
                                                                EXPERIÊNCIA PROFISSIONAL
                                                            </h4>
                                                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-accent/20 p-3 rounded-lg border border-border/50">
                                                                {r.professionalExperience}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <h4 className="text-sm font-bold text-primary mb-2 uppercase flex items-center">
                                                                PRINCIPAIS PROJETOS DA CARREIRA
                                                            </h4>
                                                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                                                {r.mainProjects}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <h4 className="text-sm font-bold text-primary mb-2 uppercase flex items-center">
                                                                PACOTE DE REMUNERAÇÃO ATUAL
                                                            </h4>
                                                            <p className="text-sm text-foreground/90 font-medium">
                                                                {r.remunerationPackage}
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div>
                                                                <h4 className="text-sm font-bold text-primary mb-2 uppercase flex items-center">
                                                                    CORE SKILLS
                                                                </h4>
                                                                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                                                    {r.coreSkills}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-bold text-primary mb-2 uppercase flex items-center">
                                                                    MOTIVAÇÕES
                                                                </h4>
                                                                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                                                    {r.motivations}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Phase3Shortlist;