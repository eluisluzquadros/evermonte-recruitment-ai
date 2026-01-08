# Evermonte Recruitment AI

**Recruitment OS Powered by Google Gemini**

Plataforma de inteligência artificial para centralizar, automatizar e elevar o processo de recrutamento executivo da Evermonte. O sistema utiliza IA Generativa de ponta para auxiliar consultores desde o alinhamento cultural até a tomada de decisão, totalmente integrado ao Firebase e Google Workspace.

---

## 📊 Status Atual do Projeto

| Componente | Status | Descrição |
|------------|--------|-----------|
| **Multi-Tenancy** | ✅ Concluído | Sistema de múltiplos projetos com dashboard de workspaces |
| **Autenticação** | ✅ Concluído | Google OAuth + Email/Senha via Firebase Auth |
| **Persistência** | ✅ Concluído | Firestore com auto-save e load por projeto |
| **AI Pipeline (5 Fases)** | ✅ Concluído | Alinhamento → Entrevistas → Shortlist → Decisão → Referências |
| **Human Approval Cycle** | ✅ Concluído | Edição manual e aprovação de resultados de IA |
| **Chatbot RAG** | ✅ Concluído | Assistente contextual com dados de todas as fases |
| **Relatório Executivo** | ✅ Concluído | Sistema de relatório multi-página para clientes |
| **AI Cost Tracking** | ✅ Concluído | Dashboard de custos de IA por projeto |
| **PDF/DOCX Upload** | ✅ Concluído | Suporte a upload de arquivos em todas as fases |
| **Dark/Light Mode** | ✅ Concluído | Toggle de tema disponível em todas as páginas |
| **Exportação Excel** | ✅ Concluído | Planilha estruturada com 5 abas |
| **Testes Automatizados** | ❌ Não Implementado | Sem cobertura de testes |
| **Deploy Produção** | ✅ Concluído | Firebase Hosting configurado e deployado |
| **i18n (Multi-idioma)** | ✅ Parcial | Inglês e Português implementados (Subtitle e Seletor) |

---

## 🧠 Strategic Cognitive Audit (WEF 2025 Framework)

Baseado no relatório "Future of Jobs 2025" do Fórum Econômico Mundial:

### 1. Analytical Thinking
**Feature:** Dashboard Kanban com Insights Proativos  
O sistema cruza informações da Fase 1 (Cultura) com a Fase 2 (Candidatos) para identificar riscos de cultural fit e destaques automaticamente.

### 2. Creative Thinking
**Feature:** Evermonte AI Assistant (RAG Contextual)  
Um "Shadow Recruiter" disponível 24/7 para comparar perfis, sugerir perguntas de entrevista e analisar gaps.

### 3. Critical Thinking
**Feature:** Human-in-the-Loop (Validação)  
A IA extrai e sugere, mas o consultor valida antes da consolidação.

### 4. Resilience & Agility
**Feature:** Input Universal  
Aceita texto colado, PDF/DOCX arrastado, ou importação do Google Drive/Gmail.

---

## 🏗️ Arquitetura do Sistema

```
evermonte-recruitment-ai/
├── src/
│   ├── pages/                 # 14 páginas React
│   │   ├── ProjectsDashboard  # Multi-project workspace
│   │   ├── ReportCover        # Relatório executivo (capa)
│   │   └── ...                # Report pages, Client views
│   ├── components/            # 18 componentes
│   │   ├── Phase1Alignment    # Fase 1: Alinhamento cultural
│   │   ├── Phase2Interview    # Fase 2: Entrevistas
│   │   ├── Phase3Shortlist    # Fase 3: Shortlist
│   │   ├── Phase4Decision     # Fase 4: Decisão
│   │   ├── DashboardKanban    # Visualização Kanban
│   │   ├── GlobalChatAssistant# Chatbot RAG
│   │   └── charts/            # Gráficos Recharts
│   ├── services/              # 7 serviços
│   │   ├── geminiService      # AI (4 fases)
│   │   ├── chatService        # RAG Chatbot
│   │   ├── persistenceService # Firebase Firestore
│   │   ├── authService        # Google OAuth
│   │   └── driveService       # Google Drive API
│   ├── hooks/
│   │   ├── useAuth            # Autenticação
│   │   └── useProjects        # CRUD de projetos
│   └── config/
│       └── firebase           # Configuração Firebase
└── firestore.rules            # Regras de segurança
```

---

## 🛠️ Stack Tecnológico

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Framework** | React | 19.2.0 |
| **Build** | Vite | 7.2.4 |
| **Linguagem** | TypeScript | 5.8.2 |
| **Estilização** | Tailwind CSS | 4.1.17 |
| **Animações** | Framer Motion | 12.23.24 |
| **Ícones** | Lucide React | 0.555.0 |
| **Gráficos** | Recharts | 3.5.1 |
| **AI Core** | @google/generative-ai | 0.24.1 |
| **Backend** | Firebase | 12.6.0 |
| **Excel** | xlsx | latest |

---

## 📦 Instalação

### Pré-requisitos
- Node.js v18+
- Firebase Project configurado
- Gemini API Key (Google AI Studio)

### Passos

1. **Clone e instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure as variáveis de ambiente (`.env`):**
   ```env
   # AI
   VITE_GEMINI_API_KEY=sua_chave_gemini
   
   # Firebase
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   
   # Google OAuth (opcional para Drive/Gmail)
   VITE_GOOGLE_CLIENT_ID=...
   ```

3. **Execute o projeto:**
   ```bash
   npm run dev
   ```

---

## 🚀 Funcionalidades Principais

### Multi-Projeto (Workspaces)
- Dashboard com todos os projetos do usuário
- Filtros por status (Ativo, Concluído, Arquivado)
- CRUD completo de projetos
- Navegação project-aware

### Pipeline de Recrutamento (5 Fases)

| Fase | Funcionalidade |
|------|----------------|
| **Fase 1** | Alinhamento cultural da empresa/cargo (pré-fill do nome da empresa) |
| **Fase 2** | Avaliação de candidatos (CV + Entrevista) |
| **Fase 3** | Seleção de shortlist com justificativas |
| **Fase 4** | Decisão executiva com relatórios Cognisess |
| **Fase 5** | Formalização e anonimização de referências (PDF/DOCX) |

### Relatório Executivo
- Capa personalizada
- Visão geral do projeto
- Perfis detalhados dos finalistas
- Comparativo entre candidatos
- Contracapa institucional

### AI Assistant
- Contexto de todas as fases
- Comparação de candidatos
- Sugestões de perguntas
- Análise de riscos

---

## 📖 Documentação Adicional

| Documento | Descrição |
|-----------|-----------|
| [PRD_ANTIGRAVITY.md](./PRD_ANTIGRAVITY.md) | Product Requirements Document |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Sistema de design e estilo |
| [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | Guia de implementação |
| [ACTION_PLAN.md](./ACTION_PLAN.md) | Plano de ação e melhorias |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Configuração do Firebase |

---

**Desenvolvido para Evermonte Executive Search**  
*"Recruitment at the Speed of Thought"*