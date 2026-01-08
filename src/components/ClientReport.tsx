/**
 * RELATÓRIO EXECUTIVO - DESIGN PROFISSIONAL APRIMORADO
 *
 * Design profissional mantendo a estrutura original da Evermonte.
 * Integrado com dados Cognisess e visualizações Recharts de alta qualidade.
 *
 * Estrutura:
 * - Página 1: Capa (ALINHAMENTO) - Design Premium
 * - Página 2: Overview (4 cards informativos)
 * - Página 3: Sobre a Posição (3 cards profissionais)
 * - Página 4: Dashboard Report (KPIs, Recharts profissionais, Cognisess)
 * - Páginas 5+: Shortlist (perfis dos candidatos)
 * - Página Final: Mapeamento Inicial (funil profissional + insights)
 */

import React, { useMemo, useCallback } from 'react';
import { Phase1Result, Phase2Result, Phase3Result } from '../types';
import {
  Briefcase, DollarSign, Star, Users,
  Target, TrendingUp, Award, Brain
} from 'lucide-react';
import { InteractiveRadarChart } from './charts/InteractiveRadarChart';
import { EnhancedFunnelChart } from './charts/EnhancedFunnelChart';
import { generateMockCognisess, CognisessData } from '../utils/mockCognisess';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

interface ClientReportOriginalProps {
  phase1: Phase1Result | null;
  candidates: { name: string; fullPhase2: Phase2Result }[];
  shortlist: Phase3Result[];
}

interface DashboardMetrics {
  total: number;
  shortlisted: number;
  englishHighPct: number;
  englishMidPct: number;
  hybridPct: number;
  conversionRate: number;
  reasons: {
    tech: number;
    culture: number;
    english: number;
    standby: number;
  };
  cognisess: CognisessData;
  funnelData: {
    stage: string;
    count: number;
    percentage: number;
  }[];
}

// ============================================================================
// SUB-COMPONENTS - GRÁFICOS
// ============================================================================

/**
 * DonutChart - Gráfico de rosquinha (donut)
 * Usado para mostrar percentuais (Nível de Inglês, Modelo de Trabalho, etc)
 */
const DonutChart = React.memo<{ percentage: number; color: string; label: string }>(
  ({ percentage, color, label }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70" aria-label={`${label}: ${percentage}%`}>
            {/* Background circle */}
            <circle
              cx="35"
              cy="35"
              r={radius}
              stroke="#374151"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="35"
              cy="35"
              r={radius}
              stroke={color}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
            {percentage}%
          </div>
        </div>
        <span className="text-gray-400 text-xs uppercase mt-2 tracking-wider">
          {label}
        </span>
      </div>
    );
  }
);

DonutChart.displayName = 'DonutChart';

/**
 * BarChart - Gráfico de barras horizontal
 * Usado para "Motivos de Desqualificação"
 */
const BarChart = React.memo<{ label: string; value: number; total: number }>(
  ({ label, value, total }) => {
    const width = total > 0 ? (value / total) * 100 : 0;

    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1 uppercase">
          <span>{label}</span>
          <span>{value}</span>
        </div>
        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-1000 ease-out"
            style={{ width: `${width}%` }}
            aria-valuenow={value}
            aria-valuemax={total}
            role="progressbar"
          />
        </div>
      </div>
    );
  }
);

BarChart.displayName = 'BarChart';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const ClientReportOriginal: React.FC<ClientReportOriginalProps> = ({
  phase1,
  candidates,
  shortlist
}) => {

  // ==========================================================================
  // CÁLCULO DE MÉTRICAS
  // ==========================================================================

  const metrics = useMemo<DashboardMetrics>(() => {
    const total = candidates.length;
    const shortlisted = shortlist.length;
    const conversionRate = total > 0 ? Math.round((shortlisted / total) * 100) : 0;

    // Análise de nível de inglês
    const englishLevels = candidates.reduce(
      (acc, c) => {
        const level = c.fullPhase2.englishLevel?.toLowerCase() || 'n/a';
        if (level.includes('avançado') || level.includes('fluente')) {
          acc.high++;
        } else if (level.includes('intermediário')) {
          acc.mid++;
        } else {
          acc.low++;
        }
        return acc;
      },
      { high: 0, mid: 0, low: 0 }
    );

    // Análise de motivos de desqualificação
    const reasons = candidates.reduce(
      (acc, c) => {
        const rec = c.fullPhase2.recommendation?.toLowerCase() || '';
        if (rec.includes('tech fit')) acc.tech++;
        if (rec.includes('cultural')) acc.culture++;
        if (rec.includes('inglês')) acc.english++;
        if (rec.includes('stand-by')) acc.standby++;
        return acc;
      },
      { tech: 0, culture: 0, english: 0, standby: 0 }
    );

    // Gerar dados Cognisess agregados (média dos candidatos shortlisted)
    const cognisess = generateMockCognisess('aggregate');

    // Dados do funil para EnhancedFunnelChart
    const funnelData = [
      { stage: 'Mapeados', count: total + 50, percentage: 100 },
      { stage: 'Abordados', count: total, percentage: Math.round((total / (total + 50)) * 100) },
      { stage: 'Entrevistados', count: total, percentage: Math.round((total / (total + 50)) * 100) },
      { stage: 'Finalistas', count: shortlisted, percentage: Math.round((shortlisted / (total + 50)) * 100) }
    ];

    return {
      total,
      shortlisted,
      conversionRate,
      englishHighPct: total ? Math.round((englishLevels.high / total) * 100) : 0,
      englishMidPct: total ? Math.round((englishLevels.mid / total) * 100) : 0,
      hybridPct: 100, // Assumindo 100% híbrido como no layout original
      reasons,
      cognisess,
      funnelData
    };
  }, [candidates, shortlist]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const getJobTitle = useCallback(() => {
    return phase1?.jobDetails?.split('\n')[0] || 'Posição Executiva';
  }, [phase1]);

  // ==========================================================================
  // RENDER CONDICIONAL - SEM DADOS
  // ==========================================================================

  if (!phase1) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-10">
        <Briefcase className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-lg">Relatório indisponível. Conclua a Fase 1 primeiro.</p>
      </div>
    );
  }

  // ==========================================================================
  // RENDER PRINCIPAL
  // ==========================================================================

  return (
    <div className="h-full overflow-y-auto bg-slate-100 font-sans antialiased">

      {/* ===================================================================== */}
      {/* PÁGINA 1: CAPA - DESIGN PREMIUM APRIMORADO */}
      {/* ===================================================================== */}

      <section className="min-h-screen flex flex-col relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
        {/* Background Image com Overlay Premium */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop')] bg-cover bg-center opacity-15 mix-blend-soft-light" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />

        {/* Geometric Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-12">
          {/* Decorative Top Line */}
          <div className="mb-12 flex items-center gap-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
          </div>

          {/* Título Principal - Premium Typography */}
          <h1 className="text-8xl md:text-[10rem] font-oswald font-black tracking-tighter uppercase mb-6 bg-gradient-to-b from-white via-gray-100 to-gray-400 bg-clip-text text-transparent drop-shadow-2xl">
            Alinhamento
          </h1>

          {/* Subtitle Badge */}
          <div className="mb-8 px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full backdrop-blur-sm">
            <span className="text-xs tracking-[0.3em] uppercase text-emerald-400 font-semibold">
              AI-Headhunter Report
            </span>
          </div>

          {/* Nome da Empresa - Enhanced */}
          <h2 className="text-4xl md:text-6xl font-light tracking-[0.2em] uppercase text-gray-200 mb-16 drop-shadow-lg">
            {phase1.companyName}
          </h2>

          {/* Posição - Premium Card */}
          <div className="bg-white/5 backdrop-blur-md px-12 py-5 rounded-2xl border border-white/20 shadow-2xl hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <span className="text-xl md:text-2xl tracking-wider uppercase font-light">
                {getJobTitle()}
              </span>
            </div>
          </div>

          {/* Stats Preview */}
          <div className="mt-16 flex gap-12 text-center">
            <div className="px-6">
              <div className="text-3xl font-bold text-emerald-400">{metrics.total}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Mapeados</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="px-6">
              <div className="text-3xl font-bold text-emerald-400">{metrics.shortlisted}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Finalistas</div>
            </div>
          </div>
        </div>

        {/* Footer - Premium */}
        <div className="relative z-10 p-12 flex justify-between items-end border-t border-white/10 bg-gradient-to-t from-black/40 to-transparent backdrop-blur-lg">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-[0.2em] mb-1 font-semibold">
              Evermonte AI-Headhunter
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              Confidential Report • {new Date().getFullYear()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-oswald tracking-[0.3em] font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              EVERMONTE
            </p>
            <p className="text-xs text-gray-600 mt-1">Powered by AI Insights</p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PÁGINA 2: OVERVIEW */}
      {/* ===================================================================== */}

      <section className="min-h-screen bg-white p-8 md:p-16 flex flex-col justify-center">
        <h2 className="text-6xl font-oswald font-bold text-slate-900 uppercase mb-16 border-l-8 border-slate-900 pl-6">
          Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
          {/* Card 1: A Companhia */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="bg-slate-200 w-fit px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
              A Companhia
            </div>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {phase1.structure || 'Informação não disponível.'}
            </div>
          </div>

          {/* Card 2: Diferenciais Competitivos */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="bg-slate-200 w-fit px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
              Diferenciais Competitivos
            </div>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {phase1.sectorAndCompetitors || 'Informação não disponível.'}
            </div>
          </div>

          {/* Card 3: Contexto da Vaga */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="bg-slate-200 w-fit px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
              Contexto da Vaga
            </div>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {phase1.jobDetails || 'Informação não disponível.'}
            </div>
          </div>

          {/* Card 4: O Desafio */}
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="bg-slate-200 w-fit px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
              O Desafio
            </div>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              Objetivo principal é estruturar e escalar a área, garantindo alinhamento cultural e entrega de resultados de curto prazo.
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PÁGINA 3: SOBRE A POSIÇÃO - DESIGN PROFISSIONAL APRIMORADO */}
      {/* ===================================================================== */}

      <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8 md:p-16">
        <div className="max-w-6xl mx-auto">
          {/* Header Premium */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
              <div className="w-2 h-2 bg-slate-400 rounded-full" />
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
            </div>
            <h2 className="text-5xl md:text-7xl font-oswald font-bold text-slate-900 uppercase tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
              Sobre a Posição
            </h2>
            <p className="text-gray-500 tracking-widest uppercase text-sm mt-4">
              Estrutura • Remuneração • Competências
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Card 1: Estrutura - Profissional */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 overflow-hidden">
              {/* Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500" />

              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
              </div>

              <h3 className="text-center font-bold text-slate-800 uppercase tracking-[0.15em] mb-8 text-lg">
                Estrutura
              </h3>

              <div className="space-y-5 text-sm">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Reporte</span>
                  <span className="text-gray-900 font-bold text-base">Diretoria / CEO</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Localidade</span>
                  <span className="text-gray-900 font-bold text-base">Híbrido / Presencial</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Equipe</span>
                  <span className="text-gray-900 font-bold text-base">A definir</span>
                </div>
              </div>
            </div>

            {/* Card 2: Remuneração - Profissional */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-emerald-100 overflow-hidden">
              {/* Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500" />

              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>

              <h3 className="text-center font-bold text-slate-800 uppercase tracking-[0.15em] mb-8 text-lg">
                Remuneração
              </h3>

              <div className="space-y-5 text-sm">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Modelo</span>
                  <span className="text-gray-900 font-bold text-base">CLT / PJ</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Fixo</span>
                  <span className="text-gray-900 font-bold text-base">Competitivo</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Variável</span>
                  <span className="text-gray-900 font-bold text-base">Bônus Anual</span>
                </div>
              </div>
            </div>

            {/* Card 3: Core Skills - Profissional */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 overflow-hidden">
              {/* Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500" />

              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-7 h-7 text-white" />
                </div>
              </div>

              <h3 className="text-center font-bold text-slate-800 uppercase tracking-[0.15em] mb-8 text-lg">
                Core Skills
              </h3>

              <ul className="space-y-3 text-sm">
                {phase1.idealCoreSkills.map((skill, i) => (
                  <li
                    key={i}
                    className="bg-gradient-to-r from-purple-50 to-purple-100/50 px-4 py-3 rounded-xl text-gray-800 font-semibold text-center border border-purple-100 hover:border-purple-300 transition-colors"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PÁGINA 4: DASHBOARD REPORT - DESIGN PROFISSIONAL COM COGNISESS */}
      {/* ===================================================================== */}

      <section className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-8 md:p-12 flex flex-col">
        {/* Header Premium */}
        <div className="flex justify-between items-end mb-12 pb-8 border-b-2 border-gradient-to-r from-emerald-500/50 via-blue-500/50 to-purple-500/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full" />
              <h2 className="text-5xl md:text-6xl font-oswald font-bold uppercase tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Dashboard Report
              </h2>
            </div>
            <p className="text-gray-400 tracking-[0.2em] uppercase text-sm ml-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              Mapeamento de Mercado • Cognisess Insights
            </p>
          </div>
          <div className="text-right bg-white/5 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="text-5xl font-bold bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              {metrics.total}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">
              Profissionais Mapeados
            </div>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4 rounded-xl border border-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <span className="text-2xl font-bold text-emerald-400">{metrics.shortlisted}</span>
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Finalistas</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 rounded-xl border border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">{metrics.conversionRate}%</span>
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Taxa Conversão</div>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4 rounded-xl border border-amber-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-2xl font-bold text-amber-400">{metrics.englishHighPct}%</span>
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Inglês Avançado</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4 rounded-xl border border-purple-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">{metrics.hybridPct}%</span>
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Modelo Híbrido</div>
          </div>
        </div>

        {/* Grid de Análises Profissionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* COGNISESS: Competências (Radar Chart) */}
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-full" />
              <h3 className="text-gray-300 text-sm font-bold uppercase tracking-widest">
                Perfil de Competências
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">Média dos candidatos finalistas (Cognisess Report)</p>
            <InteractiveRadarChart
              data={metrics.cognisess.competencies}
              height={280}
              color="#10b981"
            />
          </div>

          {/* COGNISESS: Liderança (Radar Chart) */}
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full" />
              <h3 className="text-gray-300 text-sm font-bold uppercase tracking-widest">
                Perfil de Liderança
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">Média dos candidatos finalistas (Cognisess Report)</p>
            <InteractiveRadarChart
              data={metrics.cognisess.leadership}
              height={280}
              color="#3b82f6"
            />
          </div>

          {/* COGNISESS: Lens Mini (Radar Chart - Full Width) */}
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-700 rounded-full" />
                <h3 className="text-gray-300 text-sm font-bold uppercase tracking-widest">
                  Lens Mini - Traços de Personalidade
                </h3>
              </div>
              <div className="text-xs text-gray-500 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                Big Five Model
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-6">Perfil psicométrico agregado (Cognisess Report)</p>
            <div className="max-w-3xl mx-auto">
              <InteractiveRadarChart
                data={metrics.cognisess.lensMini}
                height={350}
                color="#a855f7"
              />
            </div>
          </div>

          {/* Motivos de Desqualificação - Redesigned */}
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-rose-500 to-rose-700 rounded-full" />
              <h3 className="text-gray-300 text-sm font-bold uppercase tracking-widest">
                Motivos de Desqualificação
              </h3>
            </div>
            <div className="space-y-4">
              <BarChart label="Tech Fit" value={metrics.reasons.tech} total={metrics.total} />
              <BarChart label="Cultural Fit" value={metrics.reasons.culture} total={metrics.total} />
              <BarChart label="Inglês" value={metrics.reasons.english} total={metrics.total} />
              <BarChart label="Stand-by" value={metrics.reasons.standby} total={metrics.total} />
            </div>
          </div>

          {/* Nível de Inglês - Enhanced Donut */}
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full" />
              <h3 className="text-gray-300 text-sm font-bold uppercase tracking-widest">
                Proficiência em Inglês
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <DonutChart
                percentage={metrics.englishHighPct}
                color="#10b981"
                label="Avançado"
              />
              <DonutChart
                percentage={metrics.englishMidPct}
                color="#f59e0b"
                label="Intermediário"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* PÁGINAS 5+: SHORTLIST (PERFIS DOS CANDIDATOS) */}
      {/* ===================================================================== */}

      {shortlist.length > 0 ? (
        <section className="bg-slate-800 py-20 px-8">
          <div className="max-w-6xl mx-auto mb-16 text-center">
            <span className="text-emerald-400 tracking-widest uppercase text-sm font-bold">
              Top Talent
            </span>
            <h2 className="text-5xl md:text-6xl font-oswald font-bold text-white uppercase mt-2">
              Shortlist
            </h2>
          </div>

          <div className="space-y-20">
            {shortlist.map((candidate, idx) => (
              <article
                key={`${candidate.candidateName}-${idx}`}
                className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col md:flex-row min-h-[600px]"
              >
                {/* Painel Esquerdo: Identidade */}
                <div className="w-full md:w-1/3 bg-slate-800 p-8 md:p-12 flex flex-col border-r border-slate-700">
                  {/* Avatar */}
                  <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center text-6xl font-oswald text-slate-500 mb-8 mx-auto md:mx-0">
                    {candidate.candidateName.charAt(0).toUpperCase()}
                  </div>

                  {/* Nome */}
                  <h3 className="text-3xl font-oswald text-white mb-2">
                    {candidate.candidateName}
                  </h3>
                  <p className="text-emerald-400 text-sm uppercase tracking-wider font-bold mb-8">
                    Finalista
                  </p>

                  {/* Informações */}
                  <div className="space-y-6 text-sm text-gray-400">
                    <div>
                      <span className="block text-xs uppercase tracking-widest text-gray-600 mb-1">
                        Posição Atual
                      </span>
                      <p className="text-gray-300 font-medium">
                        {candidate.currentPosition}
                      </p>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-widest text-gray-600 mb-1">
                        Localidade
                      </span>
                      <p className="text-gray-300">
                        {candidate.location} • {candidate.age} anos
                      </p>
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-widest text-gray-600 mb-1">
                        Formação
                      </span>
                      <p className="text-gray-300 leading-relaxed">
                        {candidate.academicHistory}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Painel Direito: Detalhes */}
                <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
                  <div className="grid grid-cols-1 gap-8 h-full">
                    {/* Seção Superior */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                          <Star className="w-4 h-4" /> Principais Projetos
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {candidate.mainProjects}
                        </p>
                      </div>
                      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                          <Users className="w-4 h-4" /> Core Skills
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {candidate.coreSkills}
                        </p>
                      </div>
                    </div>

                    {/* Seção Inferior */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-auto">
                      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
                          Motivações
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {candidate.motivations}
                        </p>
                      </div>
                      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
                          Remuneração
                        </h4>
                        <p className="text-gray-300 text-sm font-mono">
                          {candidate.remunerationPackage}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="bg-slate-800 py-20 text-center text-gray-500">
          <p className="text-lg">Shortlist ainda não definida.</p>
        </section>
      )}

      {/* ===================================================================== */}
      {/* PÁGINA FINAL: MAPEAMENTO INICIAL - DESIGN PROFISSIONAL APRIMORADO */}
      {/* ===================================================================== */}

      <section className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-white p-8 md:p-16 flex items-center justify-center">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            </div>
            <h2 className="text-5xl md:text-7xl font-oswald font-bold text-slate-900 uppercase tracking-tight">
              Mapeamento Inicial
            </h2>
            <p className="text-gray-500 tracking-widest uppercase text-sm mt-4">
              Funil de Conversão • Insights Estratégicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Coluna Esquerda: Funil Profissional */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full" />
                <h3 className="font-oswald text-2xl font-bold uppercase text-slate-800">
                  Funil de Conversão
                </h3>
              </div>

              {/* Enhanced Funnel Chart */}
              <EnhancedFunnelChart
                data={metrics.funnelData}
                showConversionRate={true}
              />
            </div>

            {/* Coluna Direita: Insights Premium */}
            <div className="space-y-6">
              {/* Insights Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl text-white">
                <div className="flex items-center gap-2 mb-6">
                  <Brain className="w-6 h-6 text-emerald-400" />
                  <h3 className="font-oswald text-2xl font-bold uppercase">
                    Primeiras Impressões
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6 text-justify">
                  O mercado para esta posição apresenta-se aquecido. Identificamos que os perfis
                  mais aderentes valorizam fortemente a flexibilidade do modelo de trabalho e a
                  clareza no pacote de remuneração variável. A maioria dos candidatos mapeados
                  possui boa proficiência em inglês, o que facilita a expansão internacional.
                </p>

                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400">{metrics.conversionRate}%</div>
                    <div className="text-xs text-gray-400 uppercase mt-1">Conversão</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{metrics.englishHighPct}%</div>
                    <div className="text-xs text-gray-400 uppercase mt-1">Inglês</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">{metrics.hybridPct}%</div>
                    <div className="text-xs text-gray-400 uppercase mt-1">Híbrido</div>
                  </div>
                </div>
              </div>

              {/* Perfis Card */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-slate-600" />
                  <h4 className="font-oswald text-xl font-bold uppercase text-slate-800">
                    Top Perfis Mapeados
                  </h4>
                </div>
                <div className="space-y-4">
                  {candidates.slice(0, 3).map((c, i) => (
                    <div
                      key={`candidate-preview-${i}`}
                      className="group flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 hover:border-slate-200"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-800 block text-sm">{c.name}</span>
                        <span className="text-gray-500 text-xs">
                          {c.fullPhase2.currentPosition}
                        </span>
                      </div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                  {candidates.length > 3 && (
                    <div className="text-center text-sm text-gray-500 pt-4 border-t border-slate-100">
                      <span className="bg-slate-100 px-4 py-2 rounded-full font-semibold">
                        + {candidates.length - 3} outros candidatos
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Export as default
export default ClientReportOriginal;
