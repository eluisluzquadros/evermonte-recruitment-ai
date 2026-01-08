# PRD: Project Antigravity (Evermonte Next Gen)

**Versão:** 2.0  
**Última Atualização:** Dezembro 2024  
**Status Geral:** Fase 4 (Refinamento & Escala)  
**Filosofia:** "Recruitment at the Speed of Thought"

---

## 1. Visão do Produto

O **Project Antigravity** remove a "gravidade" (atrito, peso operacional, lentidão) do processo de recrutamento executivo. A plataforma é um **exoesqueleto cognitivo** para o recrutador, integrada ao ecossistema Google e Firebase.

### Público-Alvo
- Consultores de recrutamento executivo (C-Level)
- Equipe interna Evermonte
- Clientes (visualização de relatórios)

### Métricas de Sucesso
- Tempo de processo reduzido em 40%
- Qualidade das contratações via feedback pós-placement
- NPS de consultores e clientes

---

## 2. Status dos Pilares de Transformação

### ✅ Pilar 1: Frictionless Integration (Concluído)
**Meta:** Eliminar o "Alt-Tab" entre sistemas.
- Login único (SSO) via Google OAuth
- Importação direta do Google Drive
- Leitura de e-mails do Gmail
- Multi-tenancy com workspaces isolados

### ✅ Pilar 2: Cognitive Upgrade (Concluído)
**Meta:** Aumentar a capacidade de raciocínio da IA.
- Pipeline de 5 fases com Gemini AI
- Análise de personalidade na Fase 4
- Formalização de referências na Fase 5
- RAG Chatbot com contexto global
- Retry com backoff exponencial
- AI Cost Tracking por projeto

### ✅ Pilar 3: Holographic Insights (Concluído)
**Meta:** A IA atua proativamente.
- Dashboard Kanban com insights
- Cards de alerta automáticos
- Chatbot "Shadow Recruiter"

### ✅ Pilar 4: Zero-Gravity Data (Concluído)
**Meta:** Persistência robusta de dados.
- Auto-save em Firestore por projeto
- Carregamento de estado ao login
- Exportação Excel estruturada
- Backup JSON portátil

### ✅ Pilar 5: Premium Experience (Concluído)
**Meta:** UX de nível C-Level.
- [x] Design System com cores Evermonte
- [x] Dark/Light mode em todas as páginas
- [x] Sidebar retrátil com animações
- [x] Relatório executivo multi-página
- [x] Human-in-the-Loop: edição manual + aprovação
- [x] Upload de PDF/DOCX em todas as fases
- [ ] Micro-animações e polish
- [ ] Responsividade mobile completa

### ✅ Pilar 6: Scale & Quality (Concluído Parcialmente)
**Meta:** Produção-ready.
- [ ] Testes automatizados (Vitest + Testing Library)
- [x] Deploy Firebase Hosting
- [ ] Monitoramento de erros (Sentry)
- [ ] Analytics de uso
- [x] i18n (Inglês/Português)

---

## 3. Funcionalidades Implementadas

### 3.1 Multi-Projeto (Workspaces)
```
/projects                 → Lista de todos os projetos
/projects/:id/*           → Rotas do projeto específico
  /projects/:id/dashboard → Dashboard Kanban do projeto
  /projects/:id/phase1    → Fase 1
  /projects/:id/phase2    → Fase 2
  /projects/:id/phase3    → Fase 3
  /projects/:id/phase4    → Fase 4
```

**Dados por Projeto:**
- `phase1Data` - Alinhamento cultural
- `candidates[]` - Lista de candidatos avaliados
- `shortlist[]` - Candidatos selecionados
- `phase4Result` - Decisão executiva
- `chatHistory[]` - Histórico do chatbot
- `funnelData` - Métricas de funil

### 3.2 Pipeline de IA (4 Fases)

| Fase | Input | Output |
|------|-------|--------|
| **1. Alinhamento** | Transcrição de reunião | Cultura, requisitos, KPIs (editável) |
| **2. Entrevistas** | CV + Transcrição | Avaliação completa |
| **3. Shortlist** | Candidatos avaliados | Ranking justificado (editável) |
| **4. Decisão** | Shortlist + Cognisess | Recomendação executiva (editável) |
| **5. Referências** | PDF/DOCX de referências | Texto formalizado e anonimizado |

### 3.3 Relatório Executivo (Visão Cliente)

| Rota | Página |
|------|--------|
| `/report` | Capa com grid de candidatos |
| `/report/overview` | Resumo do projeto |
| `/report/position` | Descrição do cargo |
| `/report/finalists` | Cards dos finalistas |
| `/report/candidate/:id` | Perfil detalhado |
| `/report/comparative` | Comparativo entre candidatos |
| `/report/backcover` | Contracapa institucional |

### 3.4 Exportações
- **Excel (.xlsx):** 5 abas (Overview, Candidatos, Shortlist, Decisão, Funil)
- **JSON:** Backup completo do estado

---

## 4. Arquitetura Técnica

### Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 + Framer Motion
- **Auth:** Firebase Auth (Google OAuth + Email)
- **Database:** Cloud Firestore
- **AI:** Google Gemini via @google/generative-ai
- **Hosting:** Firebase Hosting (preparado)

### Segurança (Firestore Rules)
```javascript
// Projetos isolados por userId
allow read, write: if resource.data.userId == request.auth.uid;
```

### Modelo de Dados
```typescript
interface Project {
  id: string;
  name: string;
  userId: string;
  status: 'active' | 'completed' | 'archived';
  phase1Data: Phase1Result | null;
  candidates: CandidateEntry[];
  shortlist: Phase3Result[];
  phase4Result: Phase4Result | null;
  chatHistory: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
```

---

## 5. Gaps Identificados

### Alta Prioridade
1. **Sem testes automatizados** - Risco de regressões
2. **Sem CI/CD** - Deploy manual
3. **Tratamento de erros básico** - UX pode ser confusa em falhas
4. **Sem rate limiting** - Vulnerável a abuso de API

### Média Prioridade
5. **Mobile responsiveness incompleta**
6. **Sem cache/offline** - Dependente de conexão
7. **Logs básicos** - Dificulta debugging produção
8. **Documentação de API interna**

### Baixa Prioridade
9. **i18n** - ✅ Implementado parcialmente (EN/PT)
10. **A11y** - Acessibilidade parcial
11. **SEO** - SPA sem SSR

---

## 6. Definition of Done (v2.0)

A versão 2.0 será considerada pronta quando:

1. ✅ Multi-projeto funcionando com persistência
2. ✅ 4 fases de IA operacionais
3. ✅ Relatório executivo completo
4. ✅ Exportação Excel funcional
5. ⏳ Cobertura de testes > 60%
6. ⏳ Deploy em produção
7. ⏳ Monitoramento de erros ativo

---

> *"Aspirations become capabilities when friction is removed."*