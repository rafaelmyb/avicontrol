# AviControl — Funcionalidades e Tecnologias

Sistema web de gestão avícola para controle de plantel, ciclos de choco, estoque de ração e finanças. Cada usuário possui dados isolados (multi-tenant por conta).

---

## Visão geral

O AviControl centraliza a operação de um galinheiro em um painel único: cadastro e acompanhamento das galinhas, previsão de eventos de choco, alertas de reabastecimento de ração e controle financeiro com estimativas de receita por ovos.

A interface é exibida em **português (Brasil)**; o código-fonte segue convenções em **inglês** (nomes de variáveis, módulos e APIs).

---

## Funcionalidades

### Autenticação e conta

| Recurso | Descrição |
|--------|-----------|
| Cadastro | Criação de conta com e-mail e senha (hash com bcrypt) |
| Login | Autenticação por credenciais via NextAuth (sessão JWT, 30 dias) |
| Logout | Encerramento de sessão com confirmação |
| Isolamento de dados | Todas as operações filtram registros pelo `userId` da sessão |

### Visão geral (Dashboard)

- **Resumo financeiro do mês**: despesas, receita registrada e lucro (inclui receita estimada de ovos).
- **Plantel**: total de galinhas, quantidade em postura e em choco.
- **Produção estimada**: ovos previstos no mês com base no número de galinhas em postura e média configurável.
- **Próximos eventos de choco**: ciclos ativos com data prevista de eclosão.
- **Alertas de ração**: previsão de reabastecimento por tipo de ração (pré-inicial, crescimento, postura), considerando consumo por ave e aves ativas por faixa etária.

### Galinhas

- Cadastro individual ou **em lote** (nome do lote, quantidade, raça, data de nascimento, origem).
- Campos: nome, lote, raça, data de nascimento, status, origem (comprada / nascida no galinheiro), preço de compra.
- **Status automático** por idade e contexto de choco: pintinho → franga → em postura; estados manuais ou derivados: chocando, recuperação, aposentada, vendida, óbito.
- Cálculo de **idade em dias** e **data prevista de início da postura** (~150 dias).
- Listagem com paginação, filtros por status e lote, ordenação (criação, nome, nascimento).
- Visualização, edição e exclusão de registros.

### Choco (ciclos de incubação)

- Cadastro de ciclo vinculado a uma galinha: data de início, quantidade de ovos.
- **Datas calculadas automaticamente**:
  - Eclosão prevista: início + 21 dias.
  - Retorno à postura: eclosão + 60 dias (padrão).
- Registro de quantidade eclodida e atualização de status do ciclo.
- Listagem de ciclos e detalhe por ID.

### Ração (estoque)

- Cadastro de lotes de ração: nome, lote, tipo (`pre_inicial`, `crescimento`, `postura`), peso (kg), preço, consumo por ave (g/dia), data da compra.
- **Previsão de reabastecimento**: duração do estoque = peso total ÷ consumo diário do grupo etário correspondente.
- Agrupamento de alertas por tipo de ração no dashboard.
- CRUD completo (criar, listar, editar, excluir).
- Cadastro em lote de ração (API dedicada).

### Financeiro

- **Despesas**: valor, descrição, categoria, data; vínculo opcional com galinha ou estoque de ração (ex.: compra de ave ou ração).
- **Receitas**: valor, descrição, origem, data.
- Resumo mensal: despesas, receita registrada, receita estimada de ovos e lucro.
- **Projeção anual** com base na média de lucro dos meses já decorridos no ano corrente.
- Abas de despesas e receitas com paginação, edição e exclusão.

### Relatórios

Gráficos interativos (últimos 12 meses), via Recharts:

1. **Crescimento do plantel** — evolução do total de galinhas cadastradas.
2. **Produção de ovos (estimada)** — barras mês a mês.
3. **Receita** — receita registrada por mês.
4. **Lucro** — lucro mensal (receita − despesas).

### Configurações

- Definição do **valor do ovo (R$/unidade)** usado para estimar receita com ovos no dashboard e na área financeira.

---

## Regras de negócio (domínio)

| Área | Regra |
|------|--------|
| Idade / status | &lt; 30 dias → pintinho; &lt; 150 dias → franga; ≥ 150 dias → em postura (salvo brood/recuperação ou status terminal). |
| Choco | Galinha em ciclo ativo → chocando; após eclosão → recuperação até data de retorno à postura. |
| Ração × idade | Até 21 dias → pré-inicial; até 150 dias → crescimento; acima → postura. |
| Ovos | Estimativa: galinhas em postura × média padrão de 20 ovos/mês (constante configurável no código). |
| Lucro | Receitas registradas + receita estimada de ovos − despesas do período. |

Constantes principais em `src/shared/constants.ts` (dias para postura, incubação, recuperação pós-eclosão, média de ovos).

---

## Arquitetura

O projeto adota **Clean Architecture** por módulos de domínio:

```
src/
├── app/              # Next.js App Router (páginas e Route Handlers)
├── modules/          # Domínio: application, domain, infrastructure, presentation
├── services/         # Cliente HTTP (fetch) + React Query (queries/mutations)
├── components/       # UI compartilhada (shadcn/ui, formulários, tabelas)
├── lib/              # Prisma, NextAuth, React Query provider, utilitários
└── shared/           # i18n (PT-BR), constantes, formatação
```

### Módulos de domínio

| Módulo | Responsabilidade |
|--------|------------------|
| `chicken` | Entidades, status, idade, postura, estimativa de ovos |
| `brood` | Ciclos de choco e cálculos de datas |
| `feed` | Estoque, consumo e previsão de reabastecimento |
| `finance` | Despesas, receitas, lucro e projeções |
| `reports` | Agregação de dados para gráficos |

Cada módulo expõe casos de uso em `application/`, regras puras em `domain/`, persistência em `infrastructure/` (repositórios Prisma) e, quando aplicável, componentes em `presentation/`.

### API REST (Route Handlers)

Endpoints sob `src/app/api/`, protegidos por sessão NextAuth:

- `auth/[...nextauth]`, `auth/register`
- `chickens`, `chickens/[id]`, `chickens/batch`, `chickens/batch-names`
- `brood`, `brood/[id]`
- `feed`, `feed/[id]`, `feed/batch`, `feed/batch-names`
- `expenses`, `expenses/[id]`
- `revenue`, `revenue/[id]`
- `dashboard`, `reports`, `settings`

O front-end consome essas rotas via `fetch` (camada `src/services/requests/`) e cache/estado com TanStack React Query (`src/services/queries/`).

---

## Tecnologias

### Core

| Tecnologia | Versão / uso |
|------------|----------------|
| **Next.js** | 14.2 — App Router, SSR/CSR, API Routes |
| **React** | 18 |
| **TypeScript** | 5 |
| **Node** | Runtime (dev: `next dev`; prod: `next start`) |

### Dados e persistência

| Tecnologia | Uso |
|------------|-----|
| **PostgreSQL** | Banco relacional |
| **Prisma** | ORM, migrações e Prisma Client |
| **bcryptjs** | Hash de senhas no cadastro |

### Autenticação

| Tecnologia | Uso |
|------------|-----|
| **NextAuth.js** | Credenciais (e-mail/senha), estratégia JWT |

### UI e estilo

| Tecnologia | Uso |
|------------|-----|
| **Tailwind CSS** | Estilização utilitária |
| **tailwindcss-animate** | Animações |
| **shadcn/ui** | Componentes (Radix UI: Dialog, Slot) |
| **class-variance-authority**, **clsx**, **tailwind-merge** | Variantes e classes CSS |
| **lucide-react** | Ícones |
| **Recharts** | Gráficos na página de relatórios |

### Formulários e validação

| Tecnologia | Uso |
|------------|-----|
| **react-hook-form** | Formulários controlados |
| **Zod** | Validação de schemas (API e inputs) |

### Estado e dados no cliente

| Tecnologia | Uso |
|------------|-----|
| **TanStack React Query** | Cache, loading e mutations das requisições |

### Qualidade e ferramentas

| Tecnologia | Uso |
|------------|-----|
| **Vitest** | Testes unitários (domínio: idade, status, ovos, ração, choco, lucro) |
| **Testing Library** | Testes de componentes React |
| **ESLint** | Lint (`eslint-config-next`) |
| **Yarn** | Gerenciador de pacotes |

---

## Modelo de dados (Prisma)

Entidades principais:

- **User** — conta, `eggPricePerUnit` opcional.
- **Chicken** — ave do plantel (`ChickenStatus`, `ChickenSource`).
- **BroodCycle** — ciclo de choco ligado a uma galinha.
- **FeedInventory** — lote de ração (`FeedType`).
- **Expense** — despesa; FK opcional para `Chicken` ou `FeedInventory`.
- **Revenue** — receita avulsa.

Relacionamentos com `onDelete: Cascade` ou `SetNull` conforme o vínculo.

---

## Variáveis de ambiente

| Variável | Finalidade |
|----------|------------|
| `DATABASE_URL` | Conexão PostgreSQL |
| `NEXTAUTH_SECRET` | Assinatura de tokens JWT |
| `NEXTAUTH_URL` | URL base da aplicação (produção) |

Copie `.env.example` para `.env` e preencha antes do primeiro `prisma migrate`.

---

## Scripts disponíveis

| Comando | Ação |
|---------|------|
| `yarn dev` | Servidor de desenvolvimento |
| `yarn build` | `prisma generate` + build de produção |
| `yarn start` | Servidor de produção |
| `yarn test` | Testes (Vitest, modo run) |
| `yarn test:watch` | Testes em modo watch |
| `yarn lint` | ESLint |

---

## Fluxo típico de uso

1. Cadastrar conta em **Cadastrar** e fazer login.
2. Em **Configurações**, informar o valor do ovo (opcional, para estimativas).
3. Cadastrar galinhas (individual ou em lote).
4. Registrar compras de ração e acompanhar alertas no dashboard.
5. Ao iniciar choco, criar ciclo na galinha correspondente.
6. Lançar despesas e receitas em **Financeiro**.
7. Acompanhar tendências em **Relatórios** e indicadores em **Visão geral**.

---

## Observações

- Não há cliente **axios** no projeto; as requisições HTTP usam a API nativa **`fetch`**.
- Testes cobrem principalmente a camada de **domínio** (funções puras); a UI e as rotas API dependem de testes manuais ou expansão futura da suíte.
- O README na raiz do repositório contém instruções rápidas de setup; este documento detalha o escopo funcional e o stack técnico do sistema atual.
