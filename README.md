# AviControl – Poultry Management System

Sistema de gestão avícola (controle de galinhas, chocos, ração e financeiro).

## Stack

- Next.js 14 (App Router), TypeScript, TailwindCSS
- Prisma + PostgreSQL
- NextAuth (credentials + bcryptjs)
- TanStack React Query, Zod

## Setup

1. Clone e instale dependências:

```bash
yarn
```

2. Configure o ambiente (copie `.env.example` para `.env`):

```bash
cp .env.example .env
```

Preencha `DATABASE_URL` (PostgreSQL) e `NEXTAUTH_SECRET` (ex: `openssl rand -base64 32`).

3. Gere o Prisma Client e rode as migrações:

```bash
yarn prisma generate
yarn prisma migrate dev --name init
```

4. Inicie o servidor:

```bash
yarn dev
```

Acesse `http://localhost:3000`. Cadastre um usuário em **Cadastrar** e faça login.

## Scripts

- `yarn dev` – desenvolvimento
- `yarn build` – build de produção
- `yarn start` – servidor de produção
- `yarn test` – testes (Vitest)
- `yarn lint` – ESLint

## Estrutura (Clean Architecture)

- `src/modules/chicken` – galinhas (idade, postura, status)
- `src/modules/brood` – ciclos de choco
- `src/modules/feed` – estoque de ração e previsão de reabastecimento
- `src/modules/finance` – despesas, receita e lucro mensal
- `src/shared` – constantes e i18n (PT-BR)
- `src/lib` – Prisma, NextAuth, React Query

Código em inglês; interface em português (Brasil).
