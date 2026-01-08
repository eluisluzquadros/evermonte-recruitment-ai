import React, { useState, useEffect, useRef } from 'react';
import { runPhase4Decision } from '../services/geminiService';
import { Phase3Result, Phase4Result, Phase1Result, Phase2Result } from '../types';
import { Loader2, Copy } from 'lucide-react';
import { parseFile } from '../utils/fileParser';
import { matchFileToCandidate } from '../utils/fileMatching';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/Textarea';
import { motion } from 'framer-motion';
import { cn } from '../utils/utils';
import { toast } from 'sonner';

interface Props {
    shortlist: Phase3Result[];
    phase1Data: Phase1Result | null;
    phase2Data: Phase2Result[];
    onDecisionGenerated: (result: Phase4Result) => void;
    savedResult: Phase4Result | null;
    projectId?: string;
}

type CandidateDocs = {
    lensMini?: string;
    competency?: string;
    leadership?: string;
};

const Phase4Decision: React.FC<Props> = ({ shortlist, phase1Data, phase2Data, onDecisionGenerated, savedResult, projectId }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Phase4Result | null>(savedResult);

    const [candidateDocuments, setCandidateDocuments] = useState<Record<string, CandidateDocs>>({});
    const [processingFiles, setProcessingFiles] = useState<Record<string, boolean>>({});

    const batchInputRef = useRef<HTMLInputElement>(null);
    const [batchProcessing, setBatchProcessing] = useState(false);
    const [matchStats, setMatchStats] = useState<{ total: number, matched: number } | null>(null);

    // Human approval workflow
    const [isEditing, setIsEditing] = useState(false);
    const [editedResult, setEditedResult] = useState<Phase4Result | null>(null);

    useEffect(() => {
        if (savedResult) {
            setResult(savedResult);
        }
    }, [savedResult]);

    // Start editing
    const startEditing = () => {
        if (result) {
            setEditedResult(JSON.parse(JSON.stringify(result))); // Deep clone
            setIsEditing(true);
        }
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditedResult(null);
        setIsEditing(false);
    };

    // Approve and save
    const approveChanges = () => {
        if (editedResult) {
            setResult(editedResult);
            onDecisionGenerated(editedResult);
            setIsEditing(false);
            setEditedResult(null);
        }
    };

    // Display data (edited or original)
    const displayData = isEditing && editedResult ? editedResult : result;

    const updateIntroduction = (value: string) => {
        if (editedResult) {
            setEditedResult({ ...editedResult, introduction: value });
        }
    };

    const updateCandidateField = (index: number, field: keyof Phase4Result['candidates'][0], value: string) => {
        if (editedResult) {
            const newCandidates = [...editedResult.candidates];
            newCandidates[index] = { ...newCandidates[index], [field]: value };
            setEditedResult({ ...editedResult, candidates: newCandidates });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, candidateName: string, docType: keyof CandidateDocs) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const processKey = `${candidateName}-${docType}`;
        setProcessingFiles(prev => ({ ...prev, [processKey]: true }));

        try {
            const text = await parseFile(file);
            setCandidateDocuments(prev => ({
                ...prev,
                [candidateName]: {
                    ...prev[candidateName],
                    [docType]: text
                }
            }));
        } catch (err) {
            alert(`Erro ao ler arquivo de ${candidateName}`);
        } finally {
            setProcessingFiles(prev => ({ ...prev, [processKey]: false }));
            e.target.value = '';
        }
    };

    const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setBatchProcessing(true);
        let matchedCount = 0;
        const candidateNames = shortlist.map(c => c.candidateName);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const match = matchFileToCandidate(file.name, candidateNames);

            if (match) {
                try {
                    const text = await parseFile(file);
                    setCandidateDocuments(prev => ({
                        ...prev,
                        [match.candidateName]: {
                            ...prev[match.candidateName],
                            [match.docType]: text
                        }
                    }));
                    matchedCount++;
                } catch (err) {
                    console.error(`Error reading file ${file.name}`, err);
                }
            }
        }

        setMatchStats({ total: files.length, matched: matchedCount });
        setBatchProcessing(false);
        if (batchInputRef.current) batchInputRef.current.value = '';
        setTimeout(() => setMatchStats(null), 5000);
    };

    const handleGenerateDecision = async () => {
        if (shortlist.length === 0) return;
        setLoading(true);
        try {
            const data = await runPhase4Decision(phase1Data, shortlist, phase2Data, candidateDocuments, projectId);
            setResult(data);
            onDecisionGenerated(data);
        } catch (e) {
            alert("Error generating decision report.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const renderUploadButton = (candidateName: string, docType: keyof CandidateDocs, label: string) => {
        const isUploaded = !!candidateDocuments[candidateName]?.[docType];
        const isProcessing = processingFiles[`${candidateName}-${docType}`];

        return (
            <label className={cn(
                "flex flex-col items-center justify-center p-3 rounded-lg border border-dashed transition-all cursor-pointer h-24",
                isUploaded
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : 'bg-card border-border hover:bg-accent hover:border-primary/20 text-muted-foreground'
            )}>
                <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    disabled={isProcessing}
                    onChange={(e) => handleFileUpload(e, candidateName, docType)}
                />

                {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin mb-1 text-primary" />
                ) : isUploaded ? (
                    <span className="text-xl mb-1 text-emerald-500">✓</span>
                ) : (
                    <span className="text-xl mb-1 opacity-70">📄</span>
                )}

                <span className="text-[10px] font-medium text-center leading-tight">
                    {isUploaded ? "Anexado" : label}
                </span>
            </label>
        );
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="bg-card border-border shrink-0">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle className="text-2xl text-foreground flex items-center gap-3">
                                    Fase 4: Tomada de Decisão
                                </CardTitle>
                                <p className="text-muted-foreground mt-2">
                                    Relatório executivo combinando todas as fases e Relatórios Cognisess.
                                </p>
                            </div>
                            {result && (
                                <Button
                                    onClick={handleGenerateDecision}
                                    disabled={loading}
                                    variant="outline"
                                    className="border-border hover:bg-accent"
                                >
                                    {loading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                                    Regerar Relatório
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                </Card>
            </motion.div>

            <div className="flex-1 overflow-y-auto space-y-6">
                {shortlist.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 bg-card border-dashed border-border text-center">
                        <div className="bg-amber-500/20 p-4 rounded-full mb-4">
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Aguardando Shortlist</h3>
                        <p className="text-muted-foreground text-sm">Finalize a Fase 3 antes de prosseguir para a decisão.</p>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn("transition-all", result ? 'opacity-75 hover:opacity-100' : '')}
                        >
                            <Card className="bg-card border-border">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                                        <div>
                                            <h3 className="font-bold text-foreground flex items-center">
                                                Relatórios de Input (Obrigatórios)
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Para cada finalista, anexe os 3 relatórios (Lens Mini, Competência, Liderança).
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <Button
                                                onClick={() => batchInputRef.current?.click()}
                                                disabled={batchProcessing}
                                                variant="premium"
                                                size="sm"
                                                className="from-indigo-600 to-purple-600"
                                            >
                                                {batchProcessing && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                                                {batchProcessing ? "Processando..." : "Upload Inteligente em Lote"}
                                            </Button>
                                            <input
                                                type="file"
                                                multiple
                                                ref={batchInputRef}
                                                className="hidden"
                                                accept=".pdf,.docx,.txt"
                                                onChange={handleBatchUpload}
                                            />
                                            {matchStats && (
                                                <span className="text-[10px] text-green-500 font-medium mt-1">
                                                    {matchStats.matched} de {matchStats.total} arquivos associados.
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        {shortlist.map((candidate, idx) => (
                                            <div key={idx} className="bg-accent/50 p-4 rounded border border-border shadow-sm hover:bg-accent transition-colors">
                                                <div className="flex items-center mb-3 border-b border-border pb-2">
                                                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold mr-3">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="font-semibold text-foreground">{candidate.candidateName}</span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {renderUploadButton(candidate.candidateName, 'lensMini', 'Lens Mini')}
                                                    {renderUploadButton(candidate.candidateName, 'competency', 'Competência')}
                                                    {renderUploadButton(candidate.candidateName, 'leadership', 'Liderança')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {!result && (
                            <Button
                                onClick={handleGenerateDecision}
                                disabled={loading}
                                variant="premium"
                                className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : "Gerar Relatório de Decisão"}
                            </Button>
                        )}
                    </div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                Relatório de Apoio à Tomada de Decisão
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const text = `
RELATÓRIO DE DECISÃO EXECUTIVO
==================================================

INTRODUÇÃO:
${displayData.introduction}

==================================================
` + displayData.candidates.map(c => `
CANDIDATO: ${c.candidateName} (ID: ${c.shortlistId})
--------------------------------------------------
SUMÁRIO EXECUTIVO:
${c.executiveSummary}

CENÁRIO DE DECISÃO:
${c.decisionScenario}

O PORQUÊ DO CENÁRIO:
${c.whyDecision}
--------------------------------------------------
`).join('\n');
                                    navigator.clipboard.writeText(text).then(() => {
                                        toast.success("Copiado!");
                                    }).catch(console.error);
                                }}
                                className="text-muted-foreground"
                            >
                                Copiar dados
                            </Button>
                            {!isEditing ? (
                                <Button
                                    onClick={startEditing}
                                    variant="outline"
                                    size="sm"
                                    className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                                >
                                    Editar
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={cancelEditing} variant="outline" size="sm">
                                        Cancelar
                                    </Button>
                                    <Button onClick={approveChanges} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        Salvar
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Introduction Card */}
                        <Card className="bg-card border-border shadow-sm">
                            <CardHeader className="bg-accent/30 border-b border-border pb-3">
                                <CardTitle className="text-base font-semibold text-primary flex items-center">
                                    INTRODUÇÃO
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                {isEditing ? (
                                    <Textarea
                                        value={displayData?.introduction || ''}
                                        onChange={(e) => updateIntroduction(e.target.value)}
                                        className="min-h-[150px] bg-accent/50 border-border"
                                    />
                                ) : (
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {displayData?.introduction}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Candidate Decision Cards */}
                        <div className="grid grid-cols-1 gap-6">
                            {displayData?.candidates.map((candidate, index) => (
                                <Card key={index} className="bg-card border-border overflow-hidden">
                                    <CardHeader className="bg-accent/30 border-b border-border pb-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                    {candidate.shortlistId}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CANDIDATO</div>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={candidate.candidateName}
                                                            onChange={(e) => updateCandidateField(index, 'candidateName', e.target.value)}
                                                            className="text-lg font-bold text-foreground bg-accent/50 border border-border rounded px-2 py-1 w-full"
                                                        />
                                                    ) : (
                                                        <CardTitle className="text-lg text-foreground font-bold">
                                                            {candidate.candidateName}
                                                        </CardTitle>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Left Column: Executive Summary */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-primary mb-3 flex items-center">
                                                    SUMÁRIO EXECUTIVO
                                                </h4>
                                                {isEditing ? (
                                                    <Textarea
                                                        value={candidate.executiveSummary}
                                                        onChange={(e) => updateCandidateField(index, 'executiveSummary', e.target.value)}
                                                        className="min-h-[200px] bg-accent/50 border-border"
                                                    />
                                                ) : (
                                                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap p-4 bg-accent/20 rounded-lg border border-border/50">
                                                        {candidate.executiveSummary}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Right Column: Decision & Why */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-emerald-600 mb-3 flex items-center">
                                                        CENÁRIO DE DECISÃO
                                                    </h4>
                                                    {isEditing ? (
                                                        <Textarea
                                                            value={candidate.decisionScenario}
                                                            onChange={(e) => updateCandidateField(index, 'decisionScenario', e.target.value)}
                                                            className="min-h-[100px] bg-accent/50 border-border"
                                                        />
                                                    ) : (
                                                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                                            {candidate.decisionScenario}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-primary mb-3 flex items-center">
                                                        O PORQUÊ DO CENÁRIO (JUSTIFICATIVA)
                                                    </h4>
                                                    {isEditing ? (
                                                        <Textarea
                                                            value={candidate.whyDecision}
                                                            onChange={(e) => updateCandidateField(index, 'whyDecision', e.target.value)}
                                                            className="min-h-[150px] bg-accent/50 border-border"
                                                        />
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                            {candidate.whyDecision}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div >
    );
};

export default Phase4Decision;
