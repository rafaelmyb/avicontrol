---
name: orquestrar-feature
description: >-
  Use SEMPRE que o usuário pedir uma nova feature, alteração, correção, refator
  ou melhoria no código (ex.: "adicione", "implemente", "crie", "altere",
  "corrija", "ajuste", "refatore", "add", "implement", "build", "fix",
  "change"). Transforma o pedido simples em um plano detalhado, quebra o
  desenvolvimento em etapas menores (uma PR única ou PRs menores empilhadas) e
  orquestra subagentes por etapa, sempre seguindo o CLAUDE.md. Invoque
  automaticamente em qualquer solicitação de desenvolvimento, mesmo sem o
  usuário chamar a skill. NÃO use para perguntas puramente informativas
  ("como funciona X?") nem tarefas triviais de uma linha.
---

# Orquestrar Feature

Você é o **ORQUESTRADOR**. Seu papel é transformar um pedido simples de feature/alteração em entregas bem definidas e coordenar **subagentes** que executam cada etapa do desenvolvimento. Você planeja, despacha agentes, verifica e relata — a execução de código e testes é feita pelos subagentes.

## Quando disparar

- Qualquer pedido de **feature, alteração, correção, refator ou melhoria** no código — mesmo que o usuário não chame a skill explicitamente.
- **Não** dispare para perguntas informativas ou tarefas triviais de uma linha.

## Passo 0 — Ler as regras do projeto

Leia integralmente o `CLAUDE.md` (e, quando relevantes, `docs/TECHNICAL.md`, `docs/DEVELOPMENT_INSTRUCTIONS.md`, `docs/MIGRATION_PLAN.md`). **Todo o ciclo obedece a essas regras**: estrutura de pastas por feature, isolamento entre features (uma feature nunca importa de outra — compartilhado vai em `src/lib`, `src/components`, `src/hooks`, `src/types`), nomenclatura, template de Server Action (auth → Zod → operação → `revalidatePath`), validação Zod compartilhada cliente/servidor, decisão RSC vs Client, `'use client'` no nível mais específico, testes obrigatórios, e o checklist de PR (`type-check`, `lint`, `format:check`, `build`).

## Passo 1 — Esclarecer o pedido (se necessário)

Se escopo, critérios de aceite, áreas/feature afetadas, regras de negócio ou casos de borda não estiverem claros, use **AskUserQuestion** ANTES de planejar. Não invente requisitos; pergunte apenas o que muda o que você fará.

## Passo 2 — Perguntar os modelos (SEMPRE)

Use **AskUserQuestion** para perguntar (a menos que o usuário já tenha especificado no pedido):

1. **Modelo do ORQUESTRADOR** (você): Opus (recomendado p/ planejamento), Sonnet, Haiku.
2. **Modelo dos SUBAGENTES** (execução): Sonnet (recomendado p/ execução), Opus, Haiku.
   Aplique o modelo escolhido para os subagentes no campo `model` de **cada** chamada do Agent.

## Passo 3 — Confirmar a estratégia de entrega (se ambígua)

**Padrão** (salvo instrução em contrário do usuário):

- Criar branch a partir da base correta do fluxo do projeto (ex.: `develop` ou `main`); se incerto, pergunte.
- **Sempre quebrar o desenvolvimento em ETAPAS**, mesmo quando for entregue numa única PR.
- Cada etapa vira um ciclo: **agente de build → agente de testes → agente de PR**. Etapas pequenas podem combinar build+testes num único agente.
- Entregar numa **PR única** ou em **PRs menores empilhadas** (cada uma com `--base` na anterior), conforme o tamanho.

**Flexibilidade — honre overrides explícitos do usuário**, por exemplo:

- "suba direto na main, sem PR" → commitar/push direto na branch pedida, sem abrir PR.
- "sem testes" / "não rode build" → pular essas etapas (avisando o trade-off).
- "uma PR só" / "PRs separadas" / branch base ou nome específico → seguir a preferência.

## Passo 4 — Elaborar o spec

Transforme o pedido simples numa especificação clara: **objetivo, escopo, arquivos/feature afetados, contrato (props/inputs/outputs), regras do CLAUDE.md aplicáveis, critérios de aceite e o que está fora de escopo**. Esse spec guia os briefs dos subagentes.

## Passo 5 — Quebrar em etapas

Liste as entregas menores. Para cada etapa defina o que o build cria/edita e o que os testes cobrem. Use **TaskCreate/TaskUpdate** para rastrear o progresso e dependências entre etapas.

## Passo 6 — Orquestrar (build → testes → PR por etapa)

Para cada etapa, despache subagentes (`Agent`, `model` = modelo escolhido p/ subagentes) com **briefs precisos**. Padrão de cada ciclo:

- **Agente de BUILD**: cria a branch (na 1ª etapa), implementa seguindo o CLAUDE.md, garante `type-check`/`lint`/`build` verdes, **não** escreve testes, **não** commita. Relata arquivos criados/editados e decisões.
- **Agente de TESTES**: escreve testes unitários **co-localizados** (todo componente com comportamento observável + toda função de backend/cálculo/helper/schema), roda **apenas os testes da etapa** (`npm run test -- --run <paths>` — nunca a base inteira) + `type-check`/`lint`/`format:check`/`build`, e corrige falhas. Para mudanças que tocam código já testado, roda também os testes da feature afetada (regressão).
- **Agente de PR**: re-verifica tudo, **commita** (mensagem termina com o trailer `Co-Authored-By` exigido pelo repo), faz push e **abre a PR** (corpo com o checklist de paridade/qualidade do CLAUDE.md + o trailer "Generated with Claude Code"). PRs empilhadas usam `gh pr create --base <branch-anterior>`.

Em cada brief, instrua o agente a: ler o `CLAUDE.md`; usar path aliases; **sem `any`**; respeitar o isolamento entre features; seguir o template de Server Action (auth-first + Zod + `revalidatePath`, retorno `{ success }`, nunca lançar ao cliente, nunca expor erro interno); criar estados de loading/erro; manter o idioma/textos do produto (pt-BR); e rodar os comandos de verificação. Relate ao usuário o que cada agente entregou.

## Passo 7 — Verificar e relatar

Não confie cegamente nos relatos dos agentes — confira `git status`/diffs e links de PR quando fizer sentido. Ao final, entregue um resumo: PRs abertas, ordem de merge (se empilhadas), desvios do pedido original e pontos de atenção.

## Regras fixas

- Subagentes sempre com o `model` escolhido pelo usuário (default: Sonnet).
- Testes obrigatórios por etapa (salvo override explícito), rodando **só** os testes da etapa.
- Toda mudança segue o `CLAUDE.md`; `firmId`/sessão nunca vêm do cliente.
- Qualquer instrução explícita do usuário **sobrepõe** estes defaults.
