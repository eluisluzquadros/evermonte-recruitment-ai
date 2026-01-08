import React, { useState, useRef, useEffect } from 'react';
import { runPhase1Alignment } from '../services/geminiService';
import { Phase1Result } from '../types';
import { Loader2 } from 'lucide-react';
import GmailPicker from './GmailPicker';
import DrivePicker from './DrivePicker';
import { parseFile } from '../utils/fileParser';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { motion } from 'framer-motion';
import { cn } from '../utils/utils';
import { toast } from 'sonner';

interface Props {
  onComplete?: (result: Phase1Result) => void;
  savedData?: Phase1Result | null;
  projectId?: string;
  initialCompanyName?: string;
}

const Phase1Alignment: React.FC<Props> = ({ onComplete, savedData, projectId, initialCompanyName }) => {
  const [companyName, setCompanyName] = useState(savedData?.companyName || initialCompanyName || '');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Phase1Result | null>(savedData || null);
  const [copied, setCopied] = useState(false);
  const [showGmailPicker, setShowGmailPicker] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsingFile, setParsingFile] = useState(false);

  // Human approval workflow states
  const [isEditing, setIsEditing] = useState(false);
  const [editedResult, setEditedResult] = useState<Phase1Result | null>(null);

  useEffect(() => {
    if (savedData) {
      setResult(savedData);
      setCompanyName(savedData.companyName);
    }
  }, [savedData]);

  // Initialize editing mode
  const startEditing = () => {
    if (result) {
      setEditedResult({ ...result });
      setIsEditing(true);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditedResult(null);
    setIsEditing(false);
  };

  // Approve and save changes
  const approveChanges = () => {
    if (editedResult) {
      setResult(editedResult);
      if (onComplete) onComplete(editedResult);
      setIsEditing(false);
      setEditedResult(null);
    }
  };

  // Update a field in editedResult
  const updateField = (field: keyof Phase1Result, value: any) => {
    if (editedResult) {
      setEditedResult({ ...editedResult, [field]: value });
    }
  };

  // Current display data (edited or original)
  const displayData = isEditing && editedResult ? editedResult : result;

  const handleProcess = async () => {
    if (!companyName || !transcript) return;
    setLoading(true);
    try {
      const data = await runPhase1Alignment(transcript, companyName, projectId);
      setResult(data);
      if (onComplete) onComplete(data);
    } catch (e) {
      console.error(e);
      alert("Failed to process alignment phase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `
Empresa: ${result.companyName}
Estrutura: ${result.structure}
Setor/Concorrência: ${result.sectorAndCompetitors}
Detalhes da Vaga: ${result.jobDetails}
Core Skills: ${result.idealCoreSkills.join(', ')}
    `;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Conteúdo copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setParsingFile(true);
    let combinedText = transcript ? transcript + "\n\n" : "";
    let processedCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await parseFile(file);
        combinedText += `--- INÍCIO DO ARQUIVO: ${file.name} ---\n${text}\n--- FIM DO ARQUIVO ---\n\n`;
        processedCount++;
      }
      setTranscript(combinedText);
    } catch (error: any) {
      alert(error.message || "Failed to parse file");
    } finally {
      setParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {showGmailPicker && (
        <GmailPicker
          onSelect={(text) => setTranscript(prev => prev + "\n\n--- Importado do Gmail ---\n" + text)}
          onClose={() => setShowGmailPicker(false)}
        />
      )}
      {showDrivePicker && (
        <DrivePicker
          onSelect={(text) => setTranscript(prev => prev + "\n\n--- Importado do Google Drive ---\n" + text)}
          onClose={() => setShowDrivePicker(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground flex items-center gap-3">
              Fase 1: Alinhamento Estratégico
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Análise profunda da cultura, desafios e contexto da vaga via IA.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome da Empresa</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Evermonte"
                  className="bg-accent/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <label className="text-sm font-medium text-foreground">Contexto (Transcrição / Notas / Documentos)</label>
                <div className="flex gap-2">

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 border-blue-500/20 text-blue-600 hover:bg-blue-500/10 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    disabled={parsingFile}
                  >
                    {parsingFile && <Loader2 className="animate-spin w-3 h-3 mr-2" />}
                    {parsingFile ? "Processando..." : "Adicionar Arquivos"}
                  </Button>
                </div>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  accept=".txt,.md,.csv,.json,.pdf,.docx"
                  onChange={handleFileUpload}
                />
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full p-4 bg-accent/50 border border-border rounded-lg h-48 focus:ring-2 focus:ring-primary/50 focus:outline-none text-sm font-mono leading-relaxed text-foreground placeholder:text-muted-foreground/50 resize-none"
                placeholder="Cole o texto da reunião ou faça upload de múltiplos arquivos para compor o contexto..."
              />
              <p className="text-xs text-muted-foreground text-right">
                A IA analisará este contexto para extrair cultura, desafios e skills.
              </p>
            </div>

            <Button
              onClick={handleProcess}
              disabled={loading || !companyName || !transcript}
              variant="premium"
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Processando Alinhamento com IA...
                </>
              ) : (
                "Gerar Relatório de Alinhamento"
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h3 className="text-xl font-bold text-foreground font-serif">Resultado da Análise</h3>
            <div className="flex gap-2">
              {!isEditing ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startEditing}
                    className="text-amber-600 border-amber-500/30 hover:bg-amber-500/10 h-8 font-bold"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = `
EMPRESA: ${displayData?.companyName}
--------------------------------------------------
1. ESTRUTURA: ${displayData?.structure}
2. SETOR/CONCORRÊNCIA: ${displayData?.sectorAndCompetitors}
3. MOMENTO: ${displayData?.momentContext}
4. DESAFIOS: ${displayData?.mainChallenges}
5. OBJETIVOS VAGA: ${displayData?.jobDetails}
--------------------------------------------------
`;
                      navigator.clipboard.writeText(text).then(() => toast.success("Copiado!"));
                    }}
                    className="text-muted-foreground h-8"
                  >
                    Copiar dados
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={cancelEditing}
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-accent"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={approveChanges}
                    variant="default"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Aprovar e Salvar
                  </Button>
                </>
              )}
            </div>
          </div>


          <div className="grid grid-cols-1 gap-6">

            {/* Header: Empresa & Localidade (Ungrouped as requested) */}
            <h4 className="text-lg font-bold text-muted-foreground mt-2 mb-2">Sobre a Empresa</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Empresa</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayData?.companyName || ''}
                      onChange={(e) => updateField('companyName', e.target.value)}
                      className="w-full px-2 py-1 text-lg font-serif text-evermonte-gold bg-accent/50 border border-border rounded"
                    />
                  ) : (
                    <div className="text-lg font-serif text-evermonte-gold">{displayData?.companyName}</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Localidade</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayData?.location || ''}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-accent/50 border border-border rounded"
                    />
                  ) : (
                    <div className="text-sm font-medium">{displayData?.location}</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Modelo de Contratação</div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayData?.contractModel || ''}
                      onChange={(e) => updateField('contractModel', e.target.value)}
                      className="w-full px-2 py-1 text-sm bg-accent/50 border border-border rounded"
                    />
                  ) : (
                    <div className="text-sm font-medium">{displayData?.contractModel}</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Estrutura da Empresa</div>
                {isEditing ? (
                  <Textarea
                    value={displayData?.structure || ''}
                    onChange={(e) => updateField('structure', e.target.value)}
                    rows={3}
                    className="bg-accent/50 border-border text-foreground"
                  />
                ) : (
                  <div className="text-sm text-foreground/90 whitespace-pre-wrap">{displayData?.structure}</div>
                )}
              </CardContent>
            </Card>

            {/* Contexto & Desafios da Empresa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">SETOR, CONCORRÊNCIA E DIFERENCIAIS COMPETITIVOS</div>
                  {isEditing ? (
                    <Textarea value={displayData?.sectorAndCompetitors || ''} onChange={(e) => updateField('sectorAndCompetitors', e.target.value)} rows={3} className="bg-accent/50 border-border" />
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed text-foreground/90 text-sm">{displayData?.sectorAndCompetitors}</div>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">MOMENTO / CONTEXTO DA EMPRESA</div>
                  {isEditing ? (
                    <Textarea value={displayData?.momentContext || ''} onChange={(e) => updateField('momentContext', e.target.value)} rows={3} className="bg-accent/50 border-border" />
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed text-foreground/90 text-sm">{displayData?.momentContext}</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">PRINCIPAIS DESAFIOS ATUAIS DA EMPRESA</div>
                {isEditing ? (
                  <Textarea value={displayData?.mainChallenges || ''} onChange={(e) => updateField('mainChallenges', e.target.value)} rows={3} className="bg-accent/50 border-border" />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground/90 text-sm">{displayData?.mainChallenges}</div>
                )}
              </CardContent>
            </Card>

            {/* A Vaga */}
            <h4 className="text-lg font-bold text-muted-foreground mt-4 mb-2">Sobre a Posição</h4>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">PRINCIPAIS OBJETIVOS E DESAFIOS DA VAGA</div>
                {isEditing ? (
                  <Textarea value={displayData?.jobObjectives || ''} onChange={(e) => updateField('jobObjectives', e.target.value)} rows={3} className="bg-accent/50 border-border" />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground/90 text-sm">{displayData?.jobObjectives}</div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Reporte Direto</div>
                  {isEditing ? (
                    <input value={displayData?.directReport || ''} onChange={(e) => updateField('directReport', e.target.value)} className="w-full px-2 py-1 text-sm bg-accent/50 border border-border rounded" />
                  ) : (
                    <div className="text-sm text-foreground/90">{displayData?.directReport}</div>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Equipe</div>
                  {isEditing ? (
                    <input value={displayData?.teamStructure || ''} onChange={(e) => updateField('teamStructure', e.target.value)} className="w-full px-2 py-1 text-sm bg-accent/50 border border-border rounded" />
                  ) : (
                    <div className="text-sm text-foreground/90">{displayData?.teamStructure}</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Remuneração */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-6">
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Salário Fixo Mensal</div>
                  {isEditing ? (
                    <input value={displayData?.salaryDetails || ''} onChange={(e) => updateField('salaryDetails', e.target.value)} className="w-full px-2 py-1 text-sm bg-accent/50 border border-border rounded" />
                  ) : (
                    <div className="text-sm font-medium text-foreground/90">{displayData?.salaryDetails}</div>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-emerald-500/5 border-emerald-500/20">
                <CardContent className="p-6">
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">Remuneração Variável</div>
                  {isEditing ? (
                    <Textarea value={displayData?.variableBonus || ''} onChange={(e) => updateField('variableBonus', e.target.value)} rows={3} className="bg-accent/50 border-border" />
                  ) : (
                    <div className="text-sm font-medium text-foreground/90 whitespace-pre-wrap">{displayData?.variableBonus}</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Perfil Ideal */}
            <h4 className="text-lg font-bold text-muted-foreground mt-4 mb-2">Perfil do Candidato</h4>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">EXPERIÊNCIA PROFISSIONAL IDEAL DO EXECUTIVO</div>
                {isEditing ? (
                  <Textarea value={displayData?.idealExperience || ''} onChange={(e) => updateField('idealExperience', e.target.value)} rows={3} className="bg-accent/50 border-border" />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground/90 text-sm">{displayData?.idealExperience}</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">HISTÓRICO ACADÊMICO IDEAL DO EXECUTIVO</div>
                {isEditing ? (
                  <Textarea value={displayData?.academicBackground || ''} onChange={(e) => updateField('academicBackground', e.target.value)} rows={3} className="bg-accent/50 border-border" />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground/90 text-sm">{displayData?.academicBackground}</div>
                )}
              </CardContent>
            </Card>

            {/* Core Skills */}
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardContent className="p-6">
                <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-4">Core Skills Ideais</div>
                <div className="space-y-4">
                  {(displayData?.idealCoreSkills || []).map((skill, i) => (
                    <div key={i} className="flex flex-col gap-1 items-start">
                      <span className="text-[10px] font-bold text-blue-600/70 uppercase">
                        CORE SKILL IDEAL {i + 1}
                      </span>
                      {isEditing ? (
                        <input
                          value={skill}
                          onChange={(e) => {
                            const newSkills = [...(displayData?.idealCoreSkills || [])];
                            newSkills[i] = e.target.value;
                            updateField('idealCoreSkills', newSkills);
                          }}
                          className="w-full px-2 py-1 text-sm bg-accent/50 border border-border rounded"
                        />
                      ) : (
                        <div className="text-sm text-foreground/90 leading-relaxed bg-background/50 p-3 rounded w-full border border-blue-500/10 shadow-sm">
                          {skill}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">REQUISITOS ESPECÍFICOS PARA O EXECUTIVO</div>
                {isEditing ? (
                  <Textarea value={displayData?.specificRequirements || ''} onChange={(e) => updateField('specificRequirements', e.target.value)} rows={3} className="bg-accent/50 border-border" />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground/90 text-sm">{displayData?.specificRequirements}</div>
                )}
              </CardContent>
            </Card>

          </div>
        </motion.div>
      )
      }
    </div >
  );
};

export default Phase1Alignment;
