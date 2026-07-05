# CLAUDE.md — Guia do repositório AviControl

Orientações para o Claude Code (e qualquer subagente) trabalhar neste repositório. Leia **antes** de implementar qualquer mudança. Documentação funcional detalhada em `docs/SISTEMA.md`.

---

## O que é

AviControl é um sistema web de **gestão avícola** (multi-tenant por conta): plantel de galinhas, ciclos de choco, estoque de ração e finanças, com dashboard, relatórios e estimativas de receita por ovos. Cada usuário só enxerga os próprios dados (isolamento por `userId`).

- **UI em português (Brasil)**; **código-fonte em inglês** (variáveis, módulos, APIs).
- Todo texto visível ao usuário vem de `src/shared/i18n/pt.ts` (chaves em inglês, valores pt-BR). **Nunca** hardcode strings pt-BR no JSX.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14.2 (App Router) + React 18 + TypeScript 5 |
| Banco/ORM | PostgreSQL (Supabase) + Prisma 5.22 |
| Auth | NextAuth (credenciais e-mail/senha, JWT 30 dias, bcryptjs) |
| Estado no cliente | TanStack React Query 5 |
| Formulários/validação | react-hook-form + Zod 4 |
| UI | Tailwind CSS + shadcn/ui (Radix: Dialog, Slot) + lucide-react |
| Gráficos | Recharts |
| Testes | Vitest 4 + Testing Library |
| Gerenciador | **Yarn** (yarn@1.22) |

HTTP no cliente usa **`fetch` nativo** (não há axios).

---

## Comandos

```bash
yarn dev            # dev server
yarn build          # prisma generate + next build (gate final de qualidade)
yarn start          # produção
yarn test           # vitest run (suíte completa)
yarn test <path>    # ex.: yarn test src/modules/chicken/  (só os testes do caminho)
yarn test:watch     # vitest watch
yarn lint           # next lint (eslint-config-next)
npx tsc --noEmit    # type-check (NÃO existe script "type-check")
```

### Checklist de verificação (rode TODOS antes de commitar)

1. `npx tsc --noEmit`  (sem erros)
2. `yarn lint`  (sem warnings/errors)
3. `yarn test <caminhos da mudança>`  (verde) — rode a suíte relacionada, não só um arquivo
4. `yarn build`  (compila)

> **Não existem scripts `type-check`, `format` ou `format:check`.** Não há Prettier configurado — siga o estilo dos arquivos vizinhos.

---

## Arquitetura (Clean Architecture por módulos)

```
src/
├── app/              # Next.js App Router: páginas (dashboard/auth) e Route Handlers (api/)
├── modules/          # Domínio por feature: chicken, brood, feed, finance, reports
│   └── <feature>/
│       ├── domain/           # regras puras (services/*.ts) + entities + repository (interface)
│       ├── application/      # casos de uso (orquestram domínio + repo)
│       ├── infrastructure/   # implementações Prisma dos repositórios
│       └── presentation/     # componentes React específicos da feature (quando houver)
├── services/         # cliente: requests/ (fetch) + queries/ (React Query hooks)
├── components/       # UI compartilhada (ui/ = shadcn, + componentes de app)
├── lib/              # prisma, auth (NextAuth), query-client, utils
└── shared/           # i18n/pt.ts, constants.ts, format-date.ts, period.ts, feed-types.ts
```

### Regras de ouro

- **Isolamento entre módulos**: um módulo **nunca** importa de outro módulo. Código compartilhado vai em `src/lib`, `src/components`, `src/shared` (ou é duplicado deliberadamente). Ex.: `brood` não importa de `chicken`.
- **Path alias**: sempre `@/*` → `src/*`. Sem imports relativos longos.
- **Proibido `any`**. Tipe tudo; funções de domínio recebem/retornam tipos explícitos.
- **`userId`/sessão SEMPRE do servidor** (`getServerSession`), **nunca** do cliente. Toda query/mutation Prisma filtra por `userId` da sessão.
- **Regras de negócio ficam no domínio/application**, não na UI. Ex.: a string de status `"hatched"` mora em `buildFinalizePayload` (`modules/brood/application/finalize-brood-cycle.ts`), não no componente.
- **Datas**: exiba data-only **sempre** via `formatDateOnly` de `src/shared/format-date.ts` (timezone-safe). Para defaults de formulário use `todayLocalISODate()`. **Nunca** use `new Date(x).toLocaleDateString(...)` para campos data-only (causa shift de fuso e divergência entre telas).

### Padrão de Route Handler (`src/app/api/**/route.ts`)

Ordem fixa: **auth → validação Zod → operação (via application/repo) → resposta JSON**.

- Autentique com `getServerSession(authOptions)`; sem sessão → `401`.
- Valide o body/query com Zod; inválido → `400` com detalhe seguro.
- Nunca exponha erro interno ao cliente; nunca aceite `userId` do cliente.
- Respostas serializam `Date` como ISO (`toISOString()`); o cliente formata com `formatDateOnly`.

### Padrão do cliente (React Query)

- `src/services/requests/<feature>/*` — funções `fetch` puras (montam URL, enviam body, tipam resposta).
- `src/services/queries/<feature>.ts` — hooks `useQuery`/`useMutation`; `queryKey` inclui parâmetros que afetam o resultado (ex.: `["dashboard", period]`); mutations invalidam as queries afetadas.
- Componentes `'use client'` no nível mais específico possível; sempre com estados de **loading** e **erro**.

---

## Modelo de dados (Prisma — `prisma/schema.prisma`)

- **User** — conta; `eggPricePerUnit?` (valor do ovo para estimativas).
- **Chicken** — ave. `status: ChickenStatus`, `source: ChickenSource`, **`sex: ChickenSex @default(female)`**.
  - `ChickenStatus`: `chick | pullet | laying | brooding | recovering | retired | sold | deceased`.
  - `ChickenSource`: `purchased | hatched`.
  - `ChickenSex`: `female | male` (galinha / galo).
- **BroodCycle** — ciclo de choco (FK `chickenId`). `eggCount`, `expectedHatchDate`, `expectedReturnToLayDate`, `actualHatchedCount?`, `status` (string livre: `active` / `hatched` / etc.).
- **FeedInventory** — lote de ração (`FeedType`: `pre_inicial | crescimento | postura`).
- **Expense** — despesa; FK opcional única para `Chicken` ou `FeedInventory` (compra de ave/ração).
- **Revenue** — receita avulsa.

Índices por `userId` (+ `date`/`createdAt`/`batchName`) em todas as entidades multi-tenant.

### Migrações — atenção

O `DATABASE_URL` aponta para **Supabase (banco real)**. `prisma migrate dev` pode falhar por conflito de shadow database; nesse caso o fluxo usado foi `npx prisma db push` (sincroniza schema + `prisma generate`). **Alterar o schema pode afetar o banco de produção** — prefira campos com `@default(...)` para mudanças não-destrutivas e avise o usuário antes de aplicar.

---

## Regras de negócio (domínio)

Constantes em `src/shared/constants.ts`:
`CHICK_MAX_DAYS=21`, `PULLET_MAX_DAYS=150`, `DEFAULT_DAYS_TO_LAY=150`, `BROOD_INCUBATION_DAYS=21`, `DEFAULT_RECOVERY_DAYS_AFTER_HATCH=60`, `DEFAULT_AVERAGE_EGGS_PER_MONTH=20`.

- **Idade → status** (`modules/chicken/domain/services/status.ts`): `<30d` pintinho; `<150d` franga; `≥150d` em postura — salvo choco/recuperação ou status terminal (retired/sold/deceased, preservados).
- **Sexo**: **galos (`male`) nunca põem, chocam ou recuperam**. Machos seguem só `chick → pullet` por idade (adulto permanece `pullet`) e são **excluídos** das contagens de postura e da estimativa de ovos (dashboard) e **não podem entrar em choco** (o seletor em `brood/new` lista só fêmeas; `create-brood-cycle` rejeita machos).
- **Choco**: eclosão prevista = início + 21d; retorno à postura = eclosão + 60d. **Finalizar choco** grava `actualHatchedCount` e trava `status = "hatched"` (via `buildFinalizePayload`); isso já move a galinha para `recovering`.
- **Ração × idade**: até 21d pré-inicial; até 150d crescimento; acima postura. Previsão de reabastecimento = peso ÷ consumo diário do grupo etário.
- **Ovos**: estimativa = galinhas **fêmeas** em postura × 20 ovos/mês. No dashboard com filtro de período, a estimativa é escalada proporcionalmente por dias (`scaledEggProduction` em `src/shared/period.ts`, denominador 30).
- **Lucro** = receitas registradas + receita estimada de ovos − despesas do período.

---

## Funcionalidades recentes (para contexto de manutenção)

- **Sexo galo/galinha**: campo `sex` editável no cadastro/edição; regras de exclusão acima.
- **Edição de choco**: o form de edição edita **`eggCount`**; os campos de eclodidos/status foram removidos da edição comum (agora só via ação de finalizar).
- **Finalizar choco**: ação dedicada (botão + dialog) que registra eclodidos e seta status `hatched`.
- **Filtros de período no painel**: presets `current_month | last_30_days | current_year` (`src/shared/period.ts`); `GET /api/dashboard?period=` respeita o intervalo.
- **Histórico de gastos**: `GET /api/expenses/summary` retorna `totalAllTime` (aggregate) + `byMonth` (últimos 12 meses); exibido no financeiro.
- **Datas padronizadas**: toda exibição data-only via `formatDateOnly`; defaults de form via `todayLocalISODate()`.

---

## Testes

- Testes **co-localizados** (`*.test.ts` ao lado do código). Cobertura foca no **domínio** (funções puras): idade, status, ovos, ração, lucro, cálculos de choco, período, agregação de despesas, formatação de data.
- Ao alterar/adicionar função pura de domínio ou helper compartilhado, **adicione/atualize o teste co-localizado**.
- Rode apenas os testes da área alterada (`yarn test <path>`); rode a suíte completa (`yarn test`) antes de fechar um conjunto de mudanças.

---

## Convenções de commit

Mensagens em pt-BR no formato `feat:` / `fix:` / `refactor:`. Todo commit termina com o trailer:

```
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

Branch base: `main`. Confirme com o usuário a estratégia de entrega (PR vs commit direto) antes de fazer push — push é ação externa e deve ser autorizado.

---

## Variáveis de ambiente

`DATABASE_URL` (Postgres/Supabase), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Copie `.env.example` → `.env`.
