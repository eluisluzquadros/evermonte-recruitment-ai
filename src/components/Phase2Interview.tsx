import React, { useState, useRef, useEffect } from 'react';
import { runPhase2Interview } from '../services/geminiService';
import { Phase2Result } from '../types';
import { Loader2 } from 'lucide-react';
import GmailPicker from './GmailPicker';
import DrivePicker from './DrivePicker';
import { parseFile } from '../utils/fileParser';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/utils';
import { toast } from 'sonner';

interface Props {
    onCandidateEvaluated: (candidate: Phase2Result, cvText: string, reportText: string) => void;
    pendingFiles?: any[];
    candidates?: { name: string; fullPhase2: Phase2Result }[];
    projectId?: string;
}

interface QueueItem {
    id: string;
    candidateName: string;
    files: File[];
    status: 'pending' | 'processing' | 'success' | 'error';
    result?: Phase2Result;
    errorMsg?: string;
}

const Phase2Interview: React.FC<Props> = ({ onCandidateEvaluated, candidates = [], projectId }) => {
    // --- Single Mode States ---
    const [candidateName, setCandidateName] = useState('');
    const [cvText, setCvText] = useState('');
    const [interviewTranscript, setInterviewTranscript] = useState('');
    const [consultantNotes, setConsultantNotes] = useState('');

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Phase2Result | null>(null);
    const [showGmailPicker, setShowGmailPicker] = useState(false);
    const [showDrivePicker, setShowDrivePicker] = useState<'cv' | 'transcript' | null>(null);

    const [parsingCv, setParsingCv] = useState(false);
    const [parsingTranscript, setParsingTranscript] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const cvInputRef = useRef<HTMLInputElement>(null);
    const transcriptInputRef = useRef<HTMLInputElement>(null);

    // --- Batch Mode States ---
    const [batchQueue, setBatchQueue] = useState<QueueItem[]>([]);
    const [isProcessingBatch, setIsProcessingBatch] = useState(false);
    const batchInputRef = useRef<HTMLInputElement>(null);

    // Form state for editing
    const [editedResult, setEditedResult] = useState<Phase2Result | null>(null);

    useEffect(() => {
        if (result) {
            setEditedResult(result);
            setIsEditing(false); // Make editing explicit
        }
    }, [result]);

    // --- Single Mode Logic ---
    const handleProcess = async () => {
        if (!candidateName || !cvText) return;
        setLoading(true);
        try {
            const transcriptToUse = interviewTranscript || "Nenhuma transcrição fornecida. Basear análise apenas no CV e Notas.";
            const data = await runPhase2Interview(candidateName, cvText, transcriptToUse, consultantNotes, projectId);
            setResult(data);
        } catch (e) {
            alert("Error processing interview data.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToPipeline = () => {
        if (!editedResult) return;

        onCandidateEvaluated(
            editedResult,
            cvText,
            `Conclusão: ${editedResult.interviewerConclusion}.`
        );

        handleReset();
        alert("Candidato validado e adicionado à Pipeline com sucesso!");
    };

    const handleReset = () => {
        setCandidateName('');
        setCvText('');
        setInterviewTranscript('');
        setConsultantNotes('');
        setResult(null);
        setEditedResult(null);
        setIsEditing(false);
    };

    const handleCopy = () => {
        if (!editedResult) return;
        const text = `
Candidato: ${editedResult.candidateName}
Posição Atual: ${editedResult.currentPosition}
Conclusão: ${editedResult.interviewerConclusion}
Projetos: ${editedResult.mainProjects}
Core Skills: ${editedResult.coreSkills}
Experiência: ${editedResult.experience}
Recomendação: ${editedResult.recommendation}
    `;
        navigator.clipboard.writeText(text);
        toast.success("Conteúdo copiado para a área de transferência!");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'cv' | 'transcript') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const setter = target === 'cv' ? setCvText : setInterviewTranscript;
        const loadingSetter = target === 'cv' ? setParsingCv : setParsingTranscript;
        const inputRef = target === 'cv' ? cvInputRef : transcriptInputRef;

        loadingSetter(true);
        try {
            const text = await parseFile(file);
            setter(text);
        } catch (error: any) {
            alert(error.message || "Failed to parse file");
        } finally {
            loadingSetter(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    const updateField = (field: keyof Phase2Result, value: string) => {
        if (editedResult) {
            setEditedResult({ ...editedResult, [field]: value });
        }
    };

    // --- Batch Mode Logic ---
    const extractNameFromFilename = (filename: string): string => {
        let name = filename.substring(0, filename.lastIndexOf('.'));
        name = name.toLowerCase();
        name = name.replace(/[-_]/g, ' ');
        const keywords = ['cv', 'curriculo', 'currículo', 'resume', 'transcricao', 'transcrição', 'entrevista', 'interview', 'meeting', 'reuniao', 'anotacoes', 'notas', 'alinhamento'];
        keywords.forEach(k => {
            const regex = new RegExp(`\\b${k}\\b`, 'gi');
            name = name.replace(regex, '');
        });
        return name.replace(/\s+/g, ' ').trim();
    };

    const handleBatchSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files: File[] = Array.from(e.target.files);
            const newItemsMap = new Map<string, File[]>();

            files.forEach(file => {
                const extractedName = extractNameFromFilename(file.name);
                const key = extractedName.length > 2 ? extractedName : file.name;
                if (!newItemsMap.has(key)) {
                    newItemsMap.set(key, []);
                }
                newItemsMap.get(key)?.push(file);
            });

            const newQueueItems: QueueItem[] = Array.from(newItemsMap.entries()).map(([name, candidateFiles]) => ({
                id: Math.random().toString(36).substring(7),
                candidateName: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                files: candidateFiles,
                status: 'pending'
            }));

            setBatchQueue(prev => [...prev, ...newQueueItems]);
        }
        if (batchInputRef.current) batchInputRef.current.value = '';
    };

    const processBatchQueue = async () => {
        if (isProcessingBatch) return;
        setIsProcessingBatch(true);

        const processItem = async (item: QueueItem) => {
            try {
                setBatchQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' } : i));

                let combinedText = "";
                for (const file of item.files) {
                    const text = await parseFile(file);
                    combinedText += `\n\n=== CONTEÚDO DO ARQUIVO: ${file.name} ===\n${text}`;
                }

                const aiResult = await runPhase2Interview(
                    item.candidateName,
                    combinedText,
                    "Analise o texto combinado acima que pode conter CV e Transcrição da Entrevista.",
                    "Processamento em Lote - Múltiplos Arquivos",
                    projectId
                );

                onCandidateEvaluated(
                    aiResult,
                    combinedText,
                    `Importação em Lote (${item.files.length} arquivos): ${aiResult.interviewerConclusion}`
                );

                setBatchQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'success', result: aiResult } : i));

            } catch (error: any) {
                console.error(error);
                setBatchQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', errorMsg: "Falha na análise." } : i));
            }
        };

        const pending = batchQueue.filter(i => i.status === 'pending' || i.status === 'error');
        for (const item of pending) {
            await processItem(item);
        }
        setIsProcessingBatch(false);
    };

    const removeQueueItem = (id: string) => {
        setBatchQueue(prev => prev.filter(i => i.id !== id));
    };

    const clearQueue = () => {
        setBatchQueue([]);
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto items-start p-4 md:p-0">
            {/* SIDEBAR: Processed Candidates */}
            <div className="w-full md:w-1/4 space-y-4">
                <Card className="bg-card border-border overflow-hidden sticky top-4">
                    <div className="p-3 bg-accent/50 border-b border-border">
                        <h3 className="font-bold text-sm text-foreground flex items-center">
                            Candidatos ({candidates.length})
                        </h3>
                    </div>
                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-2 space-y-1">
                        {candidates.length === 0 && (
                            <p className="text-xs text-muted-foreground p-2 text-center">Nenhum candidato processado.</p>
                        )}
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-xs font-semibold mb-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            onClick={handleReset}
                        >
                            Novo Candidato
                        </Button>
                        {candidates.map((c, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setResult(c.fullPhase2);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={cn(
                                    "w-full text-left p-2 rounded text-xs transition-colors border",
                                    result?.candidateName === c.name
                                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-700 dark:text-indigo-300 font-bold"
                                        : "bg-transparent border-transparent hover:bg-accent hover:border-border text-foreground"
                                )}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="flex-1 space-y-8 min-w-0">
                {showGmailPicker && (
                    <GmailPicker
                        onSelect={(text) => setInterviewTranscript(text)}
                        onClose={() => setShowGmailPicker(false)}
                    />
                )}
                {showDrivePicker && (
                    <DrivePicker
                        onSelect={(text) => {
                            if (showDrivePicker === 'cv') setCvText(text);
                            else setInterviewTranscript(text);
                        }}
                        onClose={() => setShowDrivePicker(null)}
                    />
                )}

                {/* Header & Batch Actions */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                                <div>
                                    <CardTitle className="text-2xl text-foreground flex items-center gap-3">
                                        Fase 2: Entrevista & Avaliação
                                    </CardTitle>
                                    <p className="text-muted-foreground mt-2">
                                        Analise candidatos e forneça dados para avaliação <span className="text-indigo-500 font-semibold">com IA</span>.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    {result && (
                                        <Button onClick={handleReset} variant="outline" className="border-border hover:bg-accent">
                                            Cancelar Edição
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </motion.div>

                {/* --- BATCH QUEUE PANEL --- */}
                {batchQueue.length > 0 && !result && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        <Card className="bg-card border-border overflow-hidden">
                            <div className="p-4 bg-accent/50 border-b border-border flex justify-between items-center">
                                <h3 className="font-bold text-foreground flex items-center">
                                    Fila de Processamento ({batchQueue.filter(i => i.status === 'success').length}/{batchQueue.length})
                                </h3>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={clearQueue}
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-muted-foreground hover:text-destructive"
                                    >
                                        Limpar
                                    </Button>
                                    <Button
                                        onClick={processBatchQueue}
                                        disabled={isProcessingBatch || !batchQueue.some(i => i.status === 'pending' || i.status === 'error')}
                                        variant="premium"
                                        size="sm"
                                        className="from-indigo-600 to-purple-600"
                                    >
                                        {isProcessingBatch ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        {isProcessingBatch ? "Processando..." : "Iniciar Fila"}
                                    </Button>
                                </div>
                            </div>

                            <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-1 gap-2">
                                {batchQueue.map(item => (
                                    <div key={item.id} className="bg-card p-3 rounded border border-border flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={cn("w-2 h-8 rounded-full shrink-0",
                                                item.status === 'pending' ? 'bg-gray-500' :
                                                    item.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                                                        item.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                                            )}></div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold text-foreground truncate">{item.candidateName}</p>
                                                    <span className="text-[10px] bg-accent text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                                                        {item.files.length} arquivo{item.files.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                    {item.files.map(f => f.name).join(', ')}
                                                </p>
                                                <p className={cn("text-xs mt-1 font-medium",
                                                    item.status === 'success' ? 'text-green-500' :
                                                        item.status === 'error' ? 'text-red-500' :
                                                            'text-indigo-500'
                                                )}>
                                                    {item.status === 'pending' && "Aguardando..."}
                                                    {item.status === 'processing' && "Lendo e Analisando..."}
                                                    {item.status === 'success' && "Processado e Salvo"}
                                                    {item.status === 'error' && item.errorMsg}
                                                </p>
                                            </div>
                                        </div>

                                        {item.status !== 'processing' && (
                                            <button
                                                onClick={() => removeQueueItem(item.id)}
                                                className="text-muted-foreground hover:text-destructive p-1 ml-2"
                                            >
                                                Excluir
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-2 bg-indigo-500/10 text-xs text-indigo-500 border-t border-border">
                                * O sistema agrupou os arquivos automaticamente pelo nome.
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* --- SINGLE CANDIDATE FORM --- */}
                {!result ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn("space-y-6", batchQueue.length > 0 && 'opacity-50 grayscale pointer-events-none blur-[1px]')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Candidato</label>
                                <Input
                                    value={candidateName}
                                    onChange={(e) => setCandidateName(e.target.value)}
                                    placeholder="Ex: Ana Souza"
                                    className="bg-accent/50 border-border text-foreground placeholder:text-muted-foreground/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Notas do Consultor (Contexto Extra)</label>
                                <Input
                                    value={consultantNotes}
                                    onChange={(e) => setConsultantNotes(e.target.value)}
                                    placeholder="Ex: Candidata indicada pelo CEO..."
                                    className="bg-accent/50 border-border text-foreground placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-foreground">Currículo (Texto/PDF)</label>
                                    <div className="flex gap-2">

                                        <Button
                                            onClick={() => cvInputRef.current?.click()}
                                            variant="outline" size="sm" className="h-7 text-xs border-blue-500/20 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400"
                                            disabled={parsingCv}
                                        >
                                            {parsingCv && <Loader2 className="animate-spin w-3 h-3 mr-1" />}
                                            Upload
                                        </Button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={cvInputRef}
                                        className="hidden"
                                        accept=".txt,.md,.pdf,.docx"
                                        onChange={(e) => handleFileUpload(e, 'cv')}
                                    />
                                </div>
                                <Textarea
                                    value={cvText}
                                    onChange={(e) => setCvText(e.target.value)}
                                    className="h-40 bg-accent/50 border-border text-xs font-mono text-foreground placeholder:text-muted-foreground/30 resize-none"
                                    placeholder="Cole o texto ou faça upload..."
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-foreground">Transcrição da Entrevista</label>
                                    <div className="flex gap-2">

                                        <Button
                                            onClick={() => transcriptInputRef.current?.click()}
                                            variant="outline" size="sm" className="h-7 text-xs border-blue-500/20 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400"
                                            disabled={parsingTranscript}
                                        >
                                            {parsingTranscript && <Loader2 className="animate-spin w-3 h-3 mr-1" />}
                                            Upload
                                        </Button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={transcriptInputRef}
                                        className="hidden"
                                        accept=".txt,.md,.pdf,.docx"
                                        onChange={(e) => handleFileUpload(e, 'transcript')}
                                    />
                                </div>
                                <Textarea
                                    value={interviewTranscript}
                                    onChange={(e) => setInterviewTranscript(e.target.value)}
                                    className="h-40 bg-accent/50 border-border text-xs font-mono text-foreground placeholder:text-muted-foreground/30 resize-none"
                                    placeholder="Cole o texto ou faça upload..."
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleProcess}
                            disabled={loading || !candidateName || !cvText}
                            variant="premium"
                            className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : "Analisar Candidato"}
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start">
                            <div>
                                <h4 className="font-bold text-amber-500 text-sm">Revisão Humana Obrigatória</h4>
                                <p className="text-amber-500/80 text-xs mt-1">
                                    A IA gerou a análise abaixo. Por favor, revise e edite quaisquer imprecisões antes de salvar.
                                </p>
                            </div>
                        </div>

                        <Card className="bg-card border-border overflow-hidden">
                            <div className="p-6 bg-accent/50 border-b border-border flex justify-between items-center">
                                <div className="w-full max-w-md">
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Candidato</label>
                                    <Input
                                        className={cn(
                                            "bg-transparent border-none focus:ring-0 font-bold text-foreground p-0 text-lg w-full h-auto shadow-none px-0",
                                            !isEditing && "pointer-events-none"
                                        )}
                                        value={editedResult?.candidateName}
                                        onChange={(e) => updateField('candidateName', e.target.value)}
                                        readOnly={!isEditing}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    {!isEditing ? (
                                        <>
                                            <Button
                                                onClick={() => setIsEditing(true)}
                                                variant="outline"
                                                size="sm"
                                                className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                onClick={handleCopy}
                                                variant="outline"
                                                size="sm"
                                                className="border-border hover:bg-accent"
                                            >
                                                Copiar dados
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={() => setIsEditing(false)}
                                            variant="outline"
                                            size="sm"
                                            className="border-border hover:bg-accent"
                                        >
                                            Cancelar
                                        </Button>
                                    )}
                                    <div className="mx-2 h-6 w-px bg-border hidden md:block" />
                                    <span className="text-sm text-muted-foreground mr-2">Posição Atual:</span>
                                    <Input
                                        className="bg-card border-border text-foreground w-64 h-8"
                                        value={editedResult?.currentPosition}
                                        onChange={(e) => updateField('currentPosition', e.target.value)}
                                        readOnly={!isEditing}
                                    />
                                </div>
                            </div>

                            <CardContent className="p-6 space-y-6">
                                <EditableSection
                                    title="Conclusão do Entrevistador"
                                    value={editedResult?.interviewerConclusion || ''}
                                    onChange={(v) => updateField('interviewerConclusion', v)}
                                    rows={3}
                                    disabled={!isEditing}
                                />
                                <EditableSection
                                    title="Principais Projetos"
                                    value={editedResult?.mainProjects || ''}
                                    onChange={(v) => updateField('mainProjects', v)}
                                    rows={4}
                                    disabled={!isEditing}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <EditableSection
                                        title="Core Skills"
                                        value={editedResult?.coreSkills || ''}
                                        onChange={(v) => updateField('coreSkills', v)}
                                        rows={4}
                                        disabled={!isEditing}
                                    />
                                    <EditableSection
                                        title="Experiência"
                                        value={editedResult?.experience || ''}
                                        onChange={(v) => updateField('experience', v)}
                                        rows={4}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-accent/30 rounded-lg border border-border">
                                    <EditableSection
                                        title="Motivação"
                                        value={editedResult?.motivation || ''}
                                        onChange={(v) => updateField('motivation', v)}
                                        rows={2}
                                        disabled={!isEditing}
                                    />
                                    <EditableSection
                                        title="Remuneração"
                                        value={editedResult?.remuneration || ''}
                                        onChange={(v) => updateField('remuneration', v)}
                                        rows={2}
                                        disabled={!isEditing}
                                    />
                                    <EditableSection
                                        title="Mobilidade"
                                        value={editedResult?.mobility || ''}
                                        onChange={(v) => updateField('mobility', v)}
                                        rows={1}
                                        disabled={!isEditing}
                                    />
                                    <EditableSection
                                        title="Inglês"
                                        value={editedResult?.englishLevel || ''}
                                        onChange={(v) => updateField('englishLevel', v)}
                                        rows={1}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <EditableSection
                                    title="Comunicação"
                                    value={editedResult?.communication || ''}
                                    onChange={(v) => updateField('communication', v)}
                                    rows={2}
                                    disabled={!isEditing}
                                />

                                <EditableSection
                                    title="Recomendação"
                                    value={editedResult?.recommendation || ''}
                                    onChange={(v) => updateField('recommendation', v)}
                                    rows={1}
                                    disabled={!isEditing}
                                />
                            </CardContent>

                            <div className="bg-accent/50 p-6 border-t border-border flex justify-end gap-3">
                                <Button
                                    onClick={() => setResult(null)}
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Descartar
                                </Button>
                                <Button
                                    onClick={handleSaveToPipeline}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                                >
                                    Confirmar Validação
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
                {/* ... closing div for content column ... */}
            </div>
        </div>
    );
};

const EditableSection: React.FC<{ title: string, value: string, onChange: (val: string) => void, rows?: number, disabled?: boolean }> = ({ title, value, onChange, rows = 3, disabled = false }) => (
    <div className="w-full">
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{title}</label>
        <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            disabled={disabled}
            className="bg-card border-border text-foreground focus:bg-accent/50 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
    </div>
)

export default Phase2Interview;