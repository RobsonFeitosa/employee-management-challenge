# CRUD de Funcionários — contexto do projeto

Monorepo npm workspaces: `apps/api` (NestJS 10 + Mongoose 8) e `apps/web` (Next.js 14 App Router + Tailwind + shadcn/ui).

## Ambiente
- Node 18 (`source ~/.nvm/nvm.sh && nvm use` — `.nvmrc` = 18.20.8; o shell abre em Node 12). NestJS 11 / Next 15 exigem Node 20: não atualizar.
- Mongo: `npm run db:up` (docker compose, credenciais só no `.env` da raiz, nunca versionadas).
- API: `npm run dev:api` → `http://localhost:3333`. Web: `npm run dev:web` → `http://localhost:3000`.

## Convenções
- Lint: `@rocketseat/eslint-config` (aspas simples, 2 espaços, sem `;`). Rode `npx eslint --fix` em vez de formatar à mão.
- Commits: Conventional Commits, um por etapa do plano.
- API por módulo em `src/modules/<dominio>/` (`schemas/`, `dto/`, `enums/`, service, controller, `*.spec.ts` ao lado).

## Domínio Employee (regras — valem na API e no front)
| Campo | Regra |
|---|---|
| `name` | obrigatório, sem dígitos (`NAME_PATTERN`) |
| `admissionDate` | obrigatório, `YYYY-MM-DD`, salvo à meia-noite UTC |
| `dismissalDate` | opcional (`null` = ativo); `>= admissionDate` |
| `workStartTime` / `workEndTime` | obrigatórios `HH:mm` (`TIME_PATTERN`); fim `>=` início, mesmo dia |
| `closingPeriodicity` | enum `Mensal`, `Bimestral`, `Trimestral`, `Semestral`, `Anual` |

- Listagem ordenada por `admissionDate` ascendente.
- Cálculos (front): dias corridos admissão→demissão (só se houver demissão); horas/dia `fim - início` em texto ("8 horas e 30 minutos").
- Fonte da verdade da API: `apps/api/src/modules/employees/employee.constants.ts` e `schemas/employee.schema.ts`.
- Criar, editar e excluir exigem modal de confirmação (shadcn Dialog) com resumo dos dados.

## API — DTOs e service
- `CreateEmployeeDto` valida tudo; `UpdateEmployeeDto` é idêntico (edição = PUT com o registro completo).
- Regras entre campos via `@IsNotBefore(prop, pattern)` (comparação de string em `YYYY-MM-DD` / `HH:mm`).
- `EmployeesService`: `create`, `findAll` (sort `admissionDate`, `createdAt`), `findOne` (404 se id inválido/inexistente), `update` (load + `set` + `save` para rodar o hook do schema), `remove`.
- Erros de validação do Mongoose viram `400`; mensagens em português.
- JSON de saída: `id` no lugar de `_id`, datas como `YYYY-MM-DD`, `dismissalDate: null` quando ativo.
- Testes do service usam `mongodb-memory-server` (sem depender do docker).

## API — rotas HTTP (`http://localhost:3333`)
| Método | Rota | Corpo | Sucesso | Erros |
|---|---|---|---|---|
| GET | `/employees` | — | 200 lista ordenada por admissão | — |
| GET | `/employees/:id` | — | 200 | 404 |
| POST | `/employees` | `CreateEmployeeDto` | 201 | 400 (`message: string[]`) |
| PUT | `/employees/:id` | `UpdateEmployeeDto` (completo) | 200 | 400, 404 |
| DELETE | `/employees/:id` | — | 204 | 404 |

- Campos desconhecidos no corpo → 400 (`forbidNonWhitelisted`). `setupApp` (`src/app.setup.ts`) é usado por `main.ts` e pelos e2e.
- Testes: `npm test -w apps/api` (unitários + e2e em `test/`, ambos com MongoDB em memória).

<!-- Padrões de componentes entram aqui na etapa 5 -->
