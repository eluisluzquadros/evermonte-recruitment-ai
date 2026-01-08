import * as XLSX from 'xlsx';
import { Phase1Result, Phase2Result, Phase3Result, Phase4Result } from '../types';

export interface ExportProject {
  companyName: string;
  roleName: string;
  createdAt: Date;
  phase1Data: Phase1Result | null;
  candidates: {
    name: string;
    phase: string;
    cvText?: string;
    interviewReport?: string;
    fullPhase2: Phase2Result;
  }[];
  shortlist: Phase3Result[];
  phase4Result: Phase4Result | null;
}

export const exportProjectToExcel = (project: ExportProject) => {
  const wb = XLSX.utils.book_new();

  // ============= ABA 1: OVERVIEW =============
  const overviewData = [
    ['RELATÓRIO DE RECRUTAMENTO - EVERMONTE'],
    [''],
    ['INFORMAÇÕES DO PROJETO'],
    ['Empresa', project.companyName],
    ['Posição', project.roleName],
    ['Data de Início', project.createdAt.toLocaleDateString('pt-BR')],
    ['Status', 'Ativo'],
    [''],
    ['RESUMO EXECUTIVO'],
    ['Total de Candidatos Mapeados', project.candidates.length],
    ['Candidatos em Shortlist', project.shortlist.length],
    ['Taxa de Aprovação', `${project.shortlist.length > 0 ? ((project.shortlist.length / project.candidates.length) * 100).toFixed(1) : 0}%`],
  ];

  if (project.phase1Data) {
    overviewData.push(
      [''],
      ['SOBRE A POSIÇÃO'],
      ['Empresa', project.phase1Data.companyName],
      ['Estrutura', project.phase1Data.structure],
      ['Setor', project.phase1Data.sectorAndCompetitors],
      ['Descrição da Vaga', project.phase1Data.jobDetails]
    );
  }

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);

  // Styling: Merge cells for title
  wsOverview['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }
  ];

  // Column widths
  wsOverview['!cols'] = [
    { wch: 30 },
    { wch: 50 }
  ];

  XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

  // ============= ABA 2: CANDIDATOS ENTREVISTADOS =============
  const candidatesData = project.candidates.map(c => ({
    'Nome': c.fullPhase2.candidateName,
    'Posição Atual': c.fullPhase2.currentPosition,
    'Experiência': c.fullPhase2.experience,
    'Principais Projetos': c.fullPhase2.mainProjects,
    'Motivação': c.fullPhase2.motivation,
    'Mobilidade': c.fullPhase2.mobility,
    'Nível de Inglês': c.fullPhase2.englishLevel,
    'Remuneração': c.fullPhase2.remuneration,
    'Comunicação': c.fullPhase2.communication,
    'Core Skills': c.fullPhase2.coreSkills,
    'Recomendação': c.fullPhase2.recommendation,
    'Conclusão do Entrevistador': c.fullPhase2.interviewerConclusion
  }));

  const wsCandidates = XLSX.utils.json_to_sheet(candidatesData);
  wsCandidates['!cols'] = [
    { wch: 25 }, // Nome
    { wch: 30 }, // Posição Atual
    { wch: 40 }, // Experiência
    { wch: 40 }, // Principais Projetos
    { wch: 40 }, // Motivação
    { wch: 20 }, // Mobilidade
    { wch: 15 }, // Inglês
    { wch: 20 }, // Remuneração
    { wch: 30 }, // Comunicação
    { wch: 40 }, // Core Skills
    { wch: 30 }, // Recomendação
    { wch: 50 }  // Conclusão
  ];

  XLSX.utils.book_append_sheet(wb, wsCandidates, 'Candidatos Entrevistados');

  // ============= ABA 3: SHORTLIST DETALHADO =============
  if (project.shortlist.length > 0) {
    const shortlistData = project.shortlist.map(s => ({
      'ID': s.shortlistId,
      'Nome': s.candidateName,
      'Idade': s.age,
      'Posição Atual': s.currentPosition,
      'Localidade': s.location,
      'Histórico Acadêmico': s.academicHistory,
      'Experiência Profissional': s.professionalExperience,
      'Principais Projetos': s.mainProjects,
      'Pacote de Remuneração Atual': s.remunerationPackage,
      'Core Skills': s.coreSkills,
      'Motivações': s.motivations
    }));

    const wsShortlist = XLSX.utils.json_to_sheet(shortlistData);
    wsShortlist['!cols'] = [
      { wch: 15 }, // ID
      { wch: 25 }, // Nome
      { wch: 10 }, // Idade
      { wch: 30 }, // Posição
      { wch: 20 }, // Localidade
      { wch: 40 }, // Acadêmico
      { wch: 50 }, // Experiência
      { wch: 50 }, // Projetos
      { wch: 25 }, // Remuneração
      { wch: 40 }, // Skills
      { wch: 40 }  // Motivações
    ];

    XLSX.utils.book_append_sheet(wb, wsShortlist, 'Shortlist');
  }

  // ============= ABA 4: DECISÃO EXECUTIVA =============
  if (project.phase4Result) {
    const decisionData: any[] = [
      ['INTRODUÇÃO'],
      [project.phase4Result.introduction],
      [''],
      ['ANÁLISE DE CANDIDATOS']
    ];

    project.phase4Result.candidates.forEach(c => {
      decisionData.push(
        [''],
        ['CANDIDATO', c.candidateName],
        ['Sumário Executivo', c.executiveSummary],
        ['Cenário de Decisão', c.decisionScenario],
        ['Justificativa', c.whyDecision]
      );
    });

    const wsDecision = XLSX.utils.aoa_to_sheet(decisionData);
    wsDecision['!cols'] = [
      { wch: 25 },
      { wch: 80 }
    ];

    XLSX.utils.book_append_sheet(wb, wsDecision, 'Decisão Executiva');
  }

  // ============= ABA 5: FUNIL DE MERCADO =============
  const funnelData = [
    ['Etapa', 'Quantidade', 'Percentual'],
    ['Candidatos Mapeados', project.candidates.length, '100%'],
    ['Candidatos Entrevistados', project.candidates.length, `${((project.candidates.length / project.candidates.length) * 100).toFixed(0)}%`],
    ['Candidatos Shortlist', project.shortlist.length, `${project.candidates.length > 0 ? ((project.shortlist.length / project.candidates.length) * 100).toFixed(0) : 0}%`],
    ['Finalistas', project.shortlist.length, `${project.candidates.length > 0 ? ((project.shortlist.length / project.candidates.length) * 100).toFixed(0) : 0}%`]
  ];

  const wsFunnel = XLSX.utils.aoa_to_sheet(funnelData);
  wsFunnel['!cols'] = [
    { wch: 30 },
    { wch: 15 },
    { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, wsFunnel, 'Funil de Mercado');

  // ============= EXPORTAR =============
  const fileName = `${project.companyName.replace(/\s+/g, '_')}_${project.roleName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return fileName;
};

export const exportProjectToJSON = (project: ExportProject) => {
  const jsonString = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.companyName.replace(/\s+/g, '_')}_${project.roleName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return link.download;
};

export const exportProjectToCSV = (project: ExportProject) => {
  // Export Candidates List as the primary CSV content
  const candidatesData = project.candidates.map(c => ({
    'Nome': c.fullPhase2.candidateName,
    'Posição Atual': c.fullPhase2.currentPosition,
    'Experiência': c.fullPhase2.experience,
    'Principais Projetos': c.fullPhase2.mainProjects?.replace(/\n/g, '; '),
    'Motivação': c.fullPhase2.motivation,
    'Mobilidade': c.fullPhase2.mobility,
    'Nível de Inglês': c.fullPhase2.englishLevel,
    'Remuneração': c.fullPhase2.remuneration,
    'Comunicação': c.fullPhase2.communication,
    'Core Skills': c.fullPhase2.coreSkills,
    'Recomendação': c.fullPhase2.recommendation,
    'Conclusão do Entrevistador': c.fullPhase2.interviewerConclusion
  }));

  const ws = XLSX.utils.json_to_sheet(candidatesData);
  const csvData = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.companyName.replace(/\s+/g, '_')}_${project.roleName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return link.download;
};

export const exportMultipleProjects = (projects: ExportProject[]) => {
  const wb = XLSX.utils.book_new();

  // ============= ABA 1: VISÃO GERAL DE TODOS OS PROJETOS =============
  const summaryData = projects.map(p => ({
    'Empresa': p.companyName,
    'Posição': p.roleName,
    'Data Início': p.createdAt.toLocaleDateString('pt-BR'),
    'Total Candidatos': p.candidates.length,
    'Shortlist': p.shortlist.length,
    'Taxa Aprovação': `${p.shortlist.length > 0 ? ((p.shortlist.length / p.candidates.length) * 100).toFixed(1) : 0}%`
  }));

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 30 },
    { wch: 30 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 18 }
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Geral');

  // ============= ABAS INDIVIDUAIS POR PROJETO =============
  projects.forEach((project, index) => {
    const shortlistData = project.shortlist.map(s => ({
      'Nome': s.candidateName,
      'Posição Atual': s.currentPosition,
      'Localidade': s.location,
      'Core Skills': s.coreSkills,
      'Remuneração': s.remunerationPackage
    }));

    if (shortlistData.length > 0) {
      const ws = XLSX.utils.json_to_sheet(shortlistData);
      ws['!cols'] = [
        { wch: 25 },
        { wch: 30 },
        { wch: 20 },
        { wch: 40 },
        { wch: 25 }
      ];

      // Limit sheet name to 31 characters (Excel limit)
      const sheetName = `${index + 1}_${project.companyName.substring(0, 25)}`;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  });

  // ============= EXPORTAR =============
  const fileName = `Evermonte_Multiplos_Projetos_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return fileName;
};
