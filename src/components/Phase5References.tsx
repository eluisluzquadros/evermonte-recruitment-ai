import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Clipboard } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Phase2Result, Phase3Result, Phase5Result, ReferenceItem } from '../types';
import { runPhase5References } from '../services/geminiService';
import { parseFile } from '../utils/fileParser';
import { toast } from 'sonner';

interface Phase5ReferencesProps {
    candidates: { name: string; fullPhase2: Phase2Result }[]; // From Phase 2
    shortlist: Phase3Result[]; // Or from Phase 3, context dependent
    onReferenceEvaluated: (result: Phase5Result) => void;
    savedData?: Phase5Result | null;
    projectId?: string;
}

export const Phase5References: React.FC<Phase5ReferencesProps> = ({
    candidates,
    shortlist,
    onReferenceEvaluated,
    savedData,
    projectId
}) => {
    const [selectedCandidate, setSelectedCandidate] = useState<string>('');
    const [rawNotes, setRawNotes] = useState('');
    const [isPositive, setIsPositive] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedReferences, setGeneratedReferences] = useState<ReferenceItem[]>([]);

    // Filter unique candidates from Phase 2 and Shortlist
    const uniqueCandidates = Array.from(new Set([
        ...candidates.map(c => c.name),
        ...shortlist.map(s => s.candidateName)
    ])).filter(Boolean);

    const handleGenerate = async () => {
        if (!selectedCandidate || !rawNotes.trim()) {
            toast.error('Selecione um candidato e insira as notas.');
            return;
        }

        setIsGenerating(true);
        try {
            const result = await runPhase5References(selectedCandidate, rawNotes, projectId);

            // Merge results if needed, or just display
            const newRefs = result.references.map(ref => ({
                ...ref,
                originalText: rawNotes // Keep the input for reference
            }));

            setGeneratedReferences(prev => [...prev, ...newRefs]);
            toast.success('Referências processadas com sucesso!');

            // Clear input
            setRawNotes('');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao gerar referências. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        if (!selectedCandidate || generatedReferences.length === 0) return;

        const result: Phase5Result = {
            candidateName: selectedCandidate,
            references: generatedReferences
        };

        onReferenceEvaluated(result);
        toast.success('Dados salvos no projeto!');
    };

    const handleDeleteRef = (index: number) => {
        setGeneratedReferences(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        Fase 5: Referências
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Formalização e anonimização de referências profissionais.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Column */}
                <Card className="lg:col-span-1 border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Nova Referência
                        </CardTitle>
                        <CardDescription>
                            Insira as notas brutas (áudio transcrito ou anotações) para processamento.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Candidato</label>
                            <select
                                value={selectedCandidate}
                                onChange={(e) => {
                                    setSelectedCandidate(e.target.value);
                                    setGeneratedReferences([]); // Reset local state on candidate change? Or keep? Let's reset for clarity.
                                }}
                                className="w-full p-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            >
                                <option value="">Selecione...</option>
                                {uniqueCandidates.map((name, idx) => (
                                    <option key={idx} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notas ou Arquivos</label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    className="w-full border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    Carregar Arquivos (.pdf, .docx, .txt)
                                </Button>
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    accept=".txt,.md,.csv,.json,.pdf,.docx"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const files = e.target.files;
                                        if (!files || files.length === 0) return;

                                        let combinedText = rawNotes ? rawNotes + '\n\n' : '';

                                        for (let i = 0; i < files.length; i++) {
                                            const file = files[i];
                                            try {
                                                const text = await parseFile(file);
                                                combinedText += `--- INÍCIO ARQUIVO: ${file.name} ---\n${text}\n--- FIM ARQUIVO ---\n\n`;
                                            } catch (err) {
                                                toast.error(`Erro ao processar ${file.name}`);
                                                console.error(err);
                                            }
                                        }

                                        setRawNotes(combinedText);
                                        toast.success(`${files.length} arquivo(s) carregado(s)!`);
                                        e.target.value = '';
                                    }}
                                />
                            </div>
                            <textarea
                                value={rawNotes}
                                onChange={(e) => setRawNotes(e.target.value)}
                                placeholder="Cole aqui as anotações ou carregue arquivos..."
                                className="w-full h-48 p-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 resize-none focus:ring-2 focus:ring-pink-500 focus:outline-none"
                            />
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !selectedCandidate || !rawNotes}
                            className="w-full bg-pink-600 hover:bg-pink-700"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processando com IA...
                                </>
                            ) : (
                                <>
                                    Analisar Referências
                                </>
                            )}
                        </Button>
                    </CardContent >
                </Card >

                {/* Results Column */}
                < div className="lg:col-span-2 space-y-6" >
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">REFERÊNCIAS PROCESSADAS</h2>
                        <div className="flex gap-2">
                            {generatedReferences.length > 0 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const text = generatedReferences.map(ref => `[${ref.sourceName || 'Referência'}]\n${ref.polishedText}`).join('\n\n');
                                            navigator.clipboard.writeText(text).then(() => toast.success("Copiado!"));
                                        }}
                                        className="text-muted-foreground mr-2"
                                    >
                                        Copiar todos
                                    </Button>
                                    <Button onClick={handleSave} variant="premium" size="sm">
                                        Salvar no Projeto
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {
                        generatedReferences.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                <p className="text-slate-500">Nenhuma referência gerada ainda.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {generatedReferences.map((ref, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm relative group"
                                    >
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(ref.polishedText).then(() => toast.success("Copiado!"));
                                                }}
                                                className="h-8 w-8 text-slate-400 hover:text-primary"
                                            >
                                                <Clipboard className="h-4 w-4" />
                                            </Button>
                                            <button
                                                onClick={() => handleDeleteRef(idx)}
                                                className="p-2 text-slate-400 hover:text-red-500"
                                            >
                                                Excluir
                                            </button>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 p-2 rounded-full ${ref.isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                {ref.isPositive ? '✓' : '!'}
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {selectedCandidate}
                                                    </span>
                                                    <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                                                        {ref.sourceName || "Referência"}
                                                    </span>
                                                </div>
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                                    "{ref.polishedText}"
                                                </p>
                                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                                                    <p className="text-xs text-slate-400 font-mono line-clamp-2">
                                                        Original: {ref.originalText}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    }
                </div >
            </div >
        </div >
    );
};

export default Phase5References;
