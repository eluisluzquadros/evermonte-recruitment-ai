# 🎨 Evermonte Design System - Premium C-Level HR Suite

## ✅ IMPLEMENTAÇÃO CONCLUÍDA

Design system premium alinhado com a **identidade visual real da Evermonte**, criando uma experiência profissional, elegante e moderna digna de uma plataforma C-Level.

---

## 🎯 **IDENTIDADE VISUAL EVERMONTE**

### **Inspiração**
Baseado na identidade visual oficial de https://evermonte.com/:
- **Tom**: Profissional, elegante e inovador
- **Estilo**: Minimalista corporativo moderno
- **Público**: Executive Search e C-Level Recruitment

---

## 🎨 **PALETA DE CORES**

### **Cores Primárias (Brand Identity)**

```css
/* Azul Evermonte - Cor principal da marca */
--evermonte-primary: #1F4461        /* HSL: 204 53% 25% */
--evermonte-primary-light: #547FA1  /* HSL: 206 34% 48% */
--evermonte-primary-dark: #0F2230   /* HSL: 204 53% 8% */

/* Neutros Evermonte */
--evermonte-dark: #151515           /* HSL: 0 0% 8% */
--evermonte-light: #F2F2F2          /* HSL: 0 0% 95% */
--evermonte-white: #FFFFFF          /* HSL: 0 0% 100% */

/* Acentos Premium */
--evermonte-gold: #D4AF37           /* HSL: 45 65% 52% */
--evermonte-gold-light: #E6C968     /* HSL: 45 65% 65% */
```

### **Sistema de Cores Semântico**

#### **Light Theme (Default)**
- **Primary**: Azul Evermonte (#1F4461) - Navegação ativa, botões principais, links
- **Secondary**: Azul claro (#547FA1) - Elementos secundários
- **Accent**: Azul muito claro (204 25% 96%) - Hovers, backgrounds sutis
- **Muted**: Cinza clarinho (#F2F2F2) - Backgrounds, estados desabilitados
- **Background**: Branco puro (#FFFFFF)
- **Foreground**: Azul Evermonte (#1F4461) - Texto principal

#### **Dark Theme**
- **Primary**: Gold (#D4AF37) - Contraste premium no dark mode
- **Secondary**: Azul claro (#547FA1) - Mantido
- **Accent**: Cinza azulado escuro (204 30% 18%)
- **Background**: Azul muito escuro (#0F2230)
- **Foreground**: Branco quase puro (0 0% 98%)

---

## ✍️ **TIPOGRAFIA PREMIUM**

### **Fontes (2025 Modern Stack)**

```css
/* Primary UI Font - Plus Jakarta Sans (2025 moderna e profissional) */
font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
- Uso: Corpo de texto, UI geral, interfaces
- Pesos: 200-800 (variable font)
- Característica: Clean, versátil, excelente legibilidade digital

/* Brand Font - Montserrat (Identidade Evermonte) */
font-family: 'Montserrat', sans-serif;
- Uso: Títulos, branding, headers, elementos de destaque
- Pesos: 100-900 (variable font)
- Característica: Profissional, elegante, alta legibilidade

/* Display Font - Montserrat */
font-family: 'Montserrat', sans-serif;
- Uso: Headings grandes, hero sections
- Pesos: 700-900 (bold e black)

/* Monospace - JetBrains Mono */
font-family: 'JetBrains Mono', monospace;
- Uso: Código, dados técnicos, IDs
- Pesos: 300-700

/* Preserved - Oswald (para Relatório "Visão do Cliente") */
font-family: 'Oswald', sans-serif;
- Uso: Apenas no ClientReport para manter layout original
```

### **Escala Tipográfica**

```css
/* Headings - Montserrat */
h1: 2.5rem (40px) / font-brand / font-bold
h2: 2rem (32px) / font-brand / font-bold
h3: 1.5rem (24px) / font-brand / font-semibold
h4: 1.25rem (20px) / font-brand / font-semibold

/* Body - Plus Jakarta Sans */
body: 1rem (16px) / font-sans / font-normal
small: 0.875rem (14px) / font-sans / font-normal
caption: 0.75rem (12px) / font-sans / font-medium
```

### **Classes Tailwind**

```html
<!-- Brand/Display -->
<h1 class="font-brand text-4xl font-bold">Evermonte</h1>
<h2 class="font-display text-3xl font-semibold">Dashboard</h2>

<!-- UI/Body -->
<p class="font-sans text-base">Interface text...</p>
<span class="font-sans text-sm">Secondary text...</span>

<!-- Mono -->
<code class="font-mono text-sm">ABC123</code>
```

---

## 🧩 **COMPONENTES PREMIUM**

### **1. Sidebar Retrátil (Collapsible)**

**Características:**
- ✅ Toggle button (ChevronLeft/Right)
- ✅ Largura: 288px (expandida) → 80px (collapsed)
- ✅ Animações suaves (300ms ease-in-out)
- ✅ Labels escondidos com AnimatePresence (Framer Motion)
- ✅ Indicadores de badge/check quando collapsed
- ✅ Tooltips nos itens quando collapsed
- ✅ Backdrop blur e glassmorphism
- ✅ Sombra premium (shadow-2xl shadow-primary/5)

**Estados:**
```typescript
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
```

**Design:**
- Background: `bg-card/90 backdrop-blur-xl`
- Border: `border-r border-border`
- Logo: Gradiente Evermonte Primary → Primary Light
- Items: `rounded-xl` com hover effects
- Active: `bg-primary/10 text-primary border border-primary/20`

### **2. Navigation Items**

**Active State:**
- Background: `bg-primary/10`
- Text: `text-primary`
- Border: `border border-primary/20`
- Shadow: `shadow-lg shadow-primary/5`

**Hover State:**
- Background: `bg-accent/50`
- Text: `text-foreground`
- Icon scale: `scale-110`

**Collapsed State:**
- Centrado: `justify-center`
- Badge indicator: Dot vermelho (2px)
- Tooltip: `title={label}`

### **3. Ambient Background Glow**

```tsx
<div className="fixed inset-0 pointer-events-none z-0">
  {/* Primary Glow */}
  <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />

  {/* Gold Accent Glow */}
  <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-evermonte-gold/5 rounded-full blur-[120px]" />
</div>
```

---

## 📐 **ESPAÇAMENTO E GRID**

### **Container**
```css
max-width: 1400px (2xl)
padding: 2rem
center: true
```

### **Spacing Scale**
```css
--spacing-xs: 0.25rem   (4px)
--spacing-sm: 0.5rem    (8px)
--spacing-md: 1rem      (16px)
--spacing-lg: 1.5rem    (24px)
--spacing-xl: 2rem      (32px)
--spacing-2xl: 3rem     (48px)
```

### **Border Radius Premium**
```css
--radius: 0.75rem       (12px) - Cards, buttons
--radius-lg: 1rem       (16px) - Modal, large surfaces
--radius-xl: 1.5rem     (24px) - Hero cards
```

---

## 🎭 **EFEITOS VISUAIS**

### **Glassmorphism**
```css
backdrop-blur-xl
bg-card/90 ou bg-card/80
border border-border
```

### **Shadows Premium**
```css
/* Cards */
shadow-lg shadow-primary/5

/* Active items */
shadow-xl shadow-primary/10

/* Elevated surfaces */
shadow-2xl shadow-primary/5
```

### **Transitions Suaves**
```css
transition-all duration-300 ease-in-out
```

### **Hover Effects**
```css
/* Scale */
hover:scale-110 transition-transform

/* Glow */
opacity-0 group-hover:opacity-100 transition-opacity
```

---

## 🌓 **TEMA CLARO/ESCURO**

### **Implementação**
```tsx
// Já implementado com ThemeToggle
<html class="dark"> <!-- Ativa dark mode -->
```

### **Comportamento**
- **Light**: Azul Evermonte como primary (#1F4461)
- **Dark**: Gold como primary (#D4AF37) para contraste premium
- **Auto**: Respeita preferência do sistema

### **Variáveis CSS**
- Light: `:root { ... }`
- Dark: `.dark { ... }`

---

## 📱 **RESPONSIVIDADE**

### **Breakpoints**
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1400px
```

### **Mobile-First Approach**
- Sidebar: Mobile menu (overlay) → Desktop sidebar
- Grid: 1 col → 2 cols → 3 cols → 4 cols
- Padding: `p-6` → `md:p-12`

---

## ♿ **ACESSIBILIDADE**

### **ARIA**
- `aria-label` em ícones
- `role` apropriados
- `title` em elementos collapsed

### **Focus States**
```css
focus:ring-2 focus:ring-primary focus:ring-offset-2
```

### **Contrast Ratios**
- WCAG AA: ✅ Todos os textos
- WCAG AAA: ✅ Títulos e elementos principais

---

## 🚀 **ANIMAÇÕES**

### **Framer Motion**
```tsx
// Page transitions
<AnimatePresence mode="wait">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
```

### **Collapse Animations**
```tsx
<AnimatePresence>
  {!isCollapsed && (
    <motion.div
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: 'auto' }}
      exit={{ opacity: 0, width: 0 }}
      transition={{ duration: 0.2 }}
    >
```

---

## 📦 **COMO USAR**

### **Cores**
```html
<!-- Primary -->
<div class="bg-evermonte-primary text-white">
<div class="text-evermonte-primary">

<!-- Semânticas (respondem ao tema) -->
<div class="bg-primary text-primary-foreground">
<div class="bg-accent text-accent-foreground">
```

### **Tipografia**
```html
<!-- Branding -->
<h1 class="font-brand text-4xl font-bold">

<!-- UI -->
<p class="font-sans text-base">

<!-- Código -->
<code class="font-mono text-sm">
```

### **Componentes**
```tsx
// Sidebar item (já implementado)
<SidebarItem
  to="/path"
  icon={Icon}
  label="Label"
  badge={count}
  isCollapsed={isCollapsed}
/>
```

---

## 🎯 **DIFERENCIAL PREMIUM**

### **Antes**
- ❌ Cores genéricas (azul #3B82F6)
- ❌ Fonte padrão (Inter)
- ❌ Sidebar fixa
- ❌ Sem identidade visual

### **Depois**
- ✅ Cores Evermonte (#1F4461 - brand identity real)
- ✅ Fontes premium 2025 (Plus Jakarta Sans + Montserrat)
- ✅ Sidebar retrátil com animações suaves
- ✅ Design system completo e consistente
- ✅ Glassmorphism e ambient glows
- ✅ Dark mode com Gold accent
- ✅ Profissional, elegante e moderno

---

## 📊 **STACK TÉCNICO**

```json
{
  "Framework": "React 19 + TypeScript",
  "Styling": "Tailwind CSS 4.0",
  "Animations": "Framer Motion",
  "Icons": "Lucide React",
  "Fonts": "Google Fonts (Plus Jakarta Sans, Montserrat)",
  "Theme": "Dark/Light mode with CSS variables",
  "Design": "Evermonte Brand Identity"
}
```

---

## ✨ **PRÓXIMOS PASSOS**

Agora que o design system está implementado, você pode:

1. **Atualizar outros componentes** com as novas cores/fontes
2. **Criar componentes reutilizáveis** seguindo o design system
3. **Personalizar ainda mais** ajustando variáveis CSS
4. **Adicionar animações** em transições de página
5. **Implementar micro-interações** para UX premium

---

**Design System criado seguindo:**
- ✅ Identidade visual real da Evermonte (https://evermonte.com/)
- ✅ Tendências de design 2025
- ✅ Melhores práticas de UI/UX
- ✅ Padrões premium de C-Level platforms
- ✅ Inspiração de 21st.dev (componentes modernos)
