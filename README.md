# LSA OrderFlow Frontend

Sistema completo de gerenciamento de pedidos desenvolvido em Angular 17+ com arquitetura CQRS (Command Query Responsibility Segregation).

![Angular](https://img.shields.io/badge/Angular-17-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![License](https://img.shields.io/badge/license-Private-orange)

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API Integration](#api-integration)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tratamento de Consistência Eventual](#tratamento-de-consistência-eventual)

## 🚀 Sobre o Projeto

O **LSA OrderFlow Frontend** é uma Single Page Application (SPA) moderna para gerenciamento completo de pedidos, integrada com uma API RESTful que utiliza arquitetura CQRS com SQL Server para comandos e MongoDB para queries (read model).

### Principais Características

- ✅ Interface moderna e responsiva
- ✅ Integração completa com API RESTful
- ✅ Tratamento robusto de consistência eventual
- ✅ Sistema de retry inteligente com backoff exponencial
- ✅ Validação client-side completa
- ✅ Feedback visual em tempo real
- ✅ Paginação e busca avançada
- ✅ Suporte a operações CRUD completas

## 🎯 Funcionalidades

### Gerenciamento de Pedidos

- **Listar Pedidos**
  - Visualização paginada
  - Busca por ID, cliente, status
  - Exibição de status com badges coloridos
  - Navegação intuitiva

- **Criar Pedido**
  - Seleção de múltiplos produtos
  - Cálculo automático de totais
  - Validação de quantidade (apenas inteiros >= 1)
  - Preview do total antes de enviar
  - Sistema de retry para sincronização MongoDB

- **Visualizar Detalhes**
  - Informações completas do pedido
  - Lista detalhada de itens
  - Status e valores atualizados
  - Opções de edição e exclusão

- **Editar Pedido**
  - Modificar itens e quantidades
  - Alterar status
  - Atualização com retry automático

- **Alterar Status**
  - Modal dedicado para mudança de status
  - 4 status disponíveis: Pending, Paid, Shipped, Cancelled
  - Sincronização automática com backend

- **Excluir Pedido**
  - Confirmação de exclusão
  - Feedback de sucesso/erro

## 🛠️ Tecnologias

- **Angular 17+** - Framework principal com Standalone Components
- **TypeScript 5.2** - Linguagem de programação
- **RxJS 7.8** - Programação reativa e gerenciamento de estado
- **HttpClient** - Comunicação com API REST
- **Angular Router** - Navegação SPA
- **FormsModule** - Formulários e validações

## 🏗️ Arquitetura

### Padrão de Design

O projeto segue uma arquitetura em camadas:

```
┌─────────────────────────────────────┐
│         Components (UI)             │
│   (Lista, Detalhes, Formulários)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          Services (BLL)             │
│   (OrderService, ProductService)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Models/Interfaces (DTOs)       │
│    (Order, Product, Requests)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          API REST (HTTPS)           │
│      https://localhost:7069/api     │
└─────────────────────────────────────┘
```

### Componentes Principais

1. **OrderListComponent** - Listagem com paginação e busca
2. **OrderDetailComponent** - Visualização detalhada com ações
3. **OrderFormComponent** - Criação e edição de pedidos

### Serviços

1. **OrderService** - CRUD completo de pedidos com retry
2. **ProductService** - Gerenciamento de produtos (hardcoded)

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+ (incluído com Node.js)
- Angular CLI 17+ (opcional)

### Passos

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd lsa-orderflow-frontend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure o ambiente (veja próxima seção)**

4. **Inicie o servidor de desenvolvimento:**
```bash
npm start
```

5. **Acesse a aplicação:**
```
http://localhost:4200
```

## ⚙️ Configuração

### API Backend

Configure o endpoint da API no arquivo de ambiente:

**`src/environments/environment.ts`** (Desenvolvimento):
```typescript
export const environment = {
  production: false,
  apiUrl: '/api'  // Usa proxy (veja proxy.conf.json)
};
```

**`src/environments/environment.prod.ts`** (Produção):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://localhost:7069/api'
};
```

### Configuração de Proxy

O projeto usa proxy para evitar problemas de CORS e SSL durante o desenvolvimento:

**`proxy.conf.json`:**
```json
{
  "/api": {
    "target": "https://localhost:7069",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### Cliente Fixo

O sistema usa um cliente fixo (configurável em `order-form.component.ts`):

```typescript
customerId = '11111111-1111-1111-1111-111111111111';
```

### Produtos Fixos

Três produtos estão hardcoded no `ProductService`:

| ID (GUID) | Nome | Preço |
|-----------|------|-------|
| `22222222-2222-2222-2222-222222222221` | Keyboard | R$ 199,90 |
| `22222222-2222-2222-2222-222222222222` | Mouse | R$ 79,90 |
| `22222222-2222-2222-2222-222222222223` | Headset | R$ 249,90 |

## 📖 Uso

### Criar um Novo Pedido

1. Clique em **"+ Novo Pedido"**
2. Selecione um produto na lista
3. Digite a quantidade (apenas números inteiros)
4. Clique em **"+ Adicionar Item"** para adicionar mais produtos
5. Visualize o total calculado
6. Clique em **"Criar Pedido"**
7. Aguarde a sincronização (retry automático com MongoDB)
8. Você será redirecionado para os detalhes do pedido

### Buscar Pedidos

1. Na página inicial, use a caixa de busca
2. Digite: ID do pedido, cliente ou status
3. Clique em **"Buscar"**
4. Use **"Limpar"** para resetar os filtros

### Alterar Status de um Pedido

1. Acesse os detalhes do pedido
2. Clique em **"Alterar Status"**
3. Selecione o novo status no modal
4. Clique em **"Atualizar"**
5. Aguarde a sincronização

### Editar um Pedido

1. Acesse os detalhes do pedido
2. Clique em **"Editar"**
3. Modifique os itens conforme necessário
4. Altere o status se desejar
5. Clique em **"Atualizar Pedido"**

### Excluir um Pedido

1. Acesse os detalhes do pedido
2. Clique em **"Excluir"**
3. Confirme a exclusão no modal
4. Você será redirecionado para a lista

## 🔌 API Integration

### Endpoints Utilizados

#### Orders

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/orders` | Lista pedidos (paginado, com busca) |
| GET | `/api/orders/{id}` | Busca pedido por ID |
| POST | `/api/orders` | Cria novo pedido |
| PUT | `/api/orders/{id}` | Atualiza pedido completo |
| DELETE | `/api/orders/{id}` | Exclui pedido |

### Modelos de Dados

#### CreateOrderRequest
```typescript
{
  customerId: string,      // GUID
  items: [
    {
      productId: string,   // GUID
      quantity: number     // int >= 1
    }
  ]
}
```

#### UpdateOrderRequest
```typescript
{
  orderId: string,         // GUID
  newStatus?: number,      // 1=Pending, 2=Paid, 3=Shipped, 4=Cancelled
  replaceItems?: [
    {
      productId: string,
      quantity: number
    }
  ]
}
```

#### OrderDetailsVm (Response)
```typescript
{
  id: string,              // GUID
  customerId: string,      // GUID
  orderDate: string,       // ISO DateTime
  status: string,          // "Pending" | "Paid" | "Shipped" | "Cancelled"
  totalAmount: number,
  items: [
    {
      id: string,          // GUID
      productId: string,   // GUID
      productName: string,
      unitPrice: number,
      quantity: number,
      totalPrice: number
    }
  ]
}
```

### Status Enum

| Nome | Valor | Badge |
|------|-------|-------|
| Pending | 1 | 🟡 Amarelo |
| Paid | 2 | 🔵 Azul |
| Shipped | 3 | 🟢 Verde |
| Cancelled | 4 | 🔴 Vermelho |

## 📁 Estrutura do Projeto

```
lsa-orderflow-frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── order-list/           # Listagem de pedidos
│   │   │   │   ├── order-list.component.ts
│   │   │   │   ├── order-list.component.html
│   │   │   │   └── order-list.component.css
│   │   │   ├── order-detail/         # Detalhes do pedido
│   │   │   │   ├── order-detail.component.ts
│   │   │   │   ├── order-detail.component.html
│   │   │   │   └── order-detail.component.css
│   │   │   └── order-form/           # Criar/Editar pedido
│   │   │       ├── order-form.component.ts
│   │   │       ├── order-form.component.html
│   │   │       └── order-form.component.css
│   │   ├── models/
│   │   │   └── order.models.ts       # Interfaces TypeScript
│   │   ├── services/
│   │   │   ├── order.service.ts      # Serviço de pedidos
│   │   │   └── product.service.ts    # Serviço de produtos
│   │   ├── app.component.ts          # Componente raiz
│   │   ├── app.config.ts             # Configuração da app
│   │   └── app.routes.ts             # Rotas
│   ├── environments/
│   │   ├── environment.ts            # Config desenvolvimento
│   │   └── environment.prod.ts       # Config produção
│   ├── styles.css                    # Estilos globais
│   ├── index.html                    # HTML principal
│   └── main.ts                       # Bootstrap
├── angular.json                      # Config Angular CLI
├── proxy.conf.json                   # Config proxy
├── package.json                      # Dependências
├── tsconfig.json                     # Config TypeScript
└── README.md                         # Este arquivo
```

## 🔄 Tratamento de Consistência Eventual

O backend usa CQRS com SQL Server (write) e MongoDB (read). Como há latência na sincronização, implementamos:

### Sistema de Retry Inteligente

**Criar Pedido:**
- Delay inicial: 1 segundo
- Até 10 tentativas
- Backoff exponencial: 500ms, 750ms, 1125ms... até 3s
- Logs detalhados no console

**Atualizar Pedido:**
- Delay: 1.5 segundos
- Recarrega automaticamente após update
- Até 10 tentativas de busca

**Buscar Pedido:**
- Retry automático em caso de 404
- Backoff exponencial
- Mensagens informativas no console

### Logs de Debug

Abra o Console do navegador (F12) para acompanhar:

```
✅ Pedido criado com sucesso. ID: xxx
⏳ Aguardando sincronização com MongoDB...
🔍 Iniciando busca do pedido no read model...
🔁 Aguardando sincronização... Tentativa 1/10 em 500ms
✅ Pedido criado e sincronizado com sucesso!
```

## 🎨 Interface e UX

### Design System

- **Cores primárias**: Azul (#3498db), Cinza (#2c3e50)
- **Fonte**: System fonts (San Francisco, Segoe UI, Roboto)
- **Espaçamento**: 8px base grid
- **Border radius**: 6-8px
- **Sombras**: Suaves (0 2px 4px rgba)

### Responsividade

- **Mobile First**: Design adaptado para dispositivos móveis
- **Breakpoints**: 768px (tablet), 1200px (desktop)
- **Componentes fluidos**: Grids e flexbox

### Feedback Visual

- ✅ Loading spinners durante operações
- ✅ Mensagens de erro estruturadas
- ✅ Badges coloridos para status
- ✅ Animações suaves em botões
- ✅ Estados disabled claros

## 🧪 Desenvolvimento

### Comandos Úteis

```bash
# Desenvolvimento
npm start                 # Inicia dev server (localhost:4200)
npm run build             # Build para produção
npm run watch             # Build com watch mode

# Testes (se implementados)
npm test                  # Executa testes unitários
```

### Boas Práticas

- ✅ Standalone Components (Angular 17+)
- ✅ Tipagem forte com TypeScript
- ✅ Reactive Programming com RxJS
- ✅ Separation of Concerns
- ✅ Error Handling centralizado
- ✅ Code reusability

## 🐛 Troubleshooting

### Erro de CORS

Se encontrar erros de CORS:
1. Verifique se o proxy está configurado (`proxy.conf.json`)
2. Confirme que o backend permite `http://localhost:4200`
3. Reinicie o servidor Angular após mudar o proxy

### Erro de Certificado SSL

Para desenvolvimento com HTTPS self-signed:
1. Acesse `https://localhost:7069/api/orders` no navegador
2. Aceite o aviso de certificado
3. Volte para `http://localhost:4200`

### Pedido não aparece após criar

Isso é normal devido à consistência eventual:
- O sistema faz retry automático (até 10 tentativas)
- Aguarde os logs no console
- Se persistir, verifique a sincronização MongoDB no backend

### Produtos não carregam

Os produtos são hardcoded no `ProductService`:
- Não há endpoint de API
- Se aparecer erro, verifique o serviço
- Produtos são carregados via Observable

## 📝 Licença

Este projeto é privado e proprietário. © 2026 LSA OrderFlow - Todos os direitos reservados.

## 👥 Equipe de Desenvolvimento

Desenvolvido com ❤️ usando Angular e TypeScript.

## 🔗 Links Úteis

- [Documentação Angular](https://angular.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Documentation](https://rxjs.dev/)

---

**Versão:** 1.0.0  
**Data:** Janeiro 2026  
**Status:** ✅ Produção
