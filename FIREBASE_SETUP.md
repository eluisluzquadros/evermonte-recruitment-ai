# Configuração do Firebase

Este guia explica como configurar o Firebase para o projeto Evermonte Recruitment AI.

## 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto (ex: "evermonte-recruitment")
4. Siga os passos para criar o projeto

## 2. Configurar Authentication

1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Na aba "Sign-in method", ative os seguintes provedores:
   - **Email/Password**: Clique e ative
   - **Google**: Clique, ative e configure o email de suporte

## 3. Configurar Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Selecione "Iniciar no modo de produção"
4. Escolha a região (recomendado: southamerica-east1 para Brasil)
5. Clique em "Ativar"

### Configurar Regras de Segurança

1. Na aba "Regras", substitua o conteúdo pelo arquivo `firestore.rules` do projeto
2. Ou copie o conteúdo abaixo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    match /projects/{projectId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    match /candidates/{candidateId} {
      allow read: if isAuthenticated() &&
                     exists(/databases/$(database)/documents/projects/$(resource.data.projectId)) &&
                     get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.userId == request.auth.uid;
      allow create: if isAuthenticated() &&
                       exists(/databases/$(database)/documents/projects/$(request.resource.data.projectId)) &&
                       get(/databases/$(database)/documents/projects/$(request.resource.data.projectId)).data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() &&
                               exists(/databases/$(database)/documents/projects/$(resource.data.projectId)) &&
                               get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.userId == request.auth.uid;
    }
  }
}
```

3. Clique em "Publicar"

### Configurar Índices

1. Na aba "Índices", clique em "Adicionar índice"
2. Adicione os seguintes índices (ou use o arquivo `firestore.indexes.json`):

**Índice 1 - projects:**
- Collection: `projects`
- Campo 1: `userId` (Ascending)
- Campo 2: `updatedAt` (Descending)
- Escopo da consulta: Collection

**Índice 2 - candidates:**
- Collection: `candidates`
- Campo 1: `projectId` (Ascending)
- Campo 2: `createdAt` (Descending)
- Escopo da consulta: Collection

## 4. Configurar Storage (opcional)

Se você planeja usar upload de arquivos:

1. No menu lateral, clique em "Storage"
2. Clique em "Começar"
3. Aceite as regras padrão
4. Escolha a mesma região do Firestore

## 5. Obter Credenciais do Projeto

1. Clique no ícone de engrenagem ao lado de "Visão geral do projeto"
2. Selecione "Configurações do projeto"
3. Role até "Seus apps"
4. Clique no ícone `</>` (Web) para adicionar um app da web
5. Dê um nome (ex: "Web App")
6. Marque "Também configurar o Firebase Hosting" (opcional)
7. Clique em "Registrar app"
8. Copie a configuração do Firebase

## 6. Configurar Variáveis de Ambiente

1. Abra o arquivo `.env.local` na raiz do projeto
2. Substitua os valores das variáveis Firebase pelas suas credenciais:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-messaging-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
```

## 7. Testar a Aplicação

1. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse a aplicação no navegador
3. Tente criar uma conta com email/senha ou fazer login com Google
4. Crie um projeto e verifique se é salvo no Firestore

## 8. Deploy das Regras (via CLI)

Se preferir usar o Firebase CLI:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Fazer login
firebase login

# Inicializar Firebase no projeto
firebase init

# Selecione:
# - Firestore
# - Authentication (se quiser configurar)
# - Hosting (opcional)

# Deploy das regras
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Troubleshooting

### Erro: "Missing or insufficient permissions"
- Verifique se as regras de segurança foram publicadas corretamente
- Confirme que o usuário está autenticado antes de fazer operações

### Erro: "The query requires an index"
- Acesse o link fornecido no erro para criar o índice automaticamente
- Ou configure manualmente conforme as instruções acima

### Autenticação não funciona
- Verifique se o domínio está autorizado em Authentication > Settings > Authorized domains
- Para desenvolvimento local, `localhost` deve estar na lista

## Recursos Adicionais

- [Documentação do Firebase](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
