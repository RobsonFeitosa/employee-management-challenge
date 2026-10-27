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

## Web — utilitários e validação (`apps/web/src/lib/employees/`)
- `types.ts`: `Employee` (espelho da API), `EmployeeInput`, `CLOSING_PERIODICITIES`.
- `calculations.ts`: `calculateWorkedDays` (dias corridos = diferença de calendário; `null` sem demissão), `calculateDailyWorkMinutes`, `formatDuration` ("8 horas e 30 minutos"), `formatDisplayDate` (`dd/MM/yyyy`). Funções puras com date-fns; datas `YYYY-MM-DD` lidas como data local (sem deslocamento de fuso).
- `schema.ts`: `employeeFormSchema` (Zod, uma mensagem por campo, regras cruzadas no campo da direita), `toEmployeeInput` (`''` → `null`), `toEmployeeFormInput`.
- React 18 fixado via `overrides` na raiz (sem isso o npm iça React 19 e o Next 14 fica fora da raiz, quebrando o eslint-config-next).

## Web — componentes (`apps/web/src/components/employees/`)
- `ui/` = shadcn/ui (new-york, zinc) gerado pela CLI: `npx shadcn@2.3.0 add <nome>` (versão 2.x = Tailwind 3). Não editar à mão, salvo `sonner.tsx` (sem next-themes).
- Fluxo de salvar: `EmployeeFormDialog` (Dialog com `EmployeeForm`) → submit válido guarda o payload → `ConfirmDialog` (AlertDialog) com `EmployeeSummary` → `useSaveEmployee` → toast (sonner).
- `EmployeeForm`: react-hook-form + `zodResolver(employeeFormSchema)`, `mode: 'onTouched'`, erros inline via `FormMessage`; mudar admissão/início revalida demissão/fim. Inputs nativos `type="date"`/`type="time"`; periodicidade com shadcn Select.
- `EmployeeCalculations`: `useWatch` + funções de `calculations.ts` (dias só aparecem com demissão válida).
- `EmployeeSummary`: resumo para os modais; com `previous`, destaca o que mudou (edição).
- `ConfirmDialog`: genérico (`destructive` para exclusão); não fecha durante a requisição.
- Dados: `src/lib/api.ts` (fetch + `ApiError`, `NEXT_PUBLIC_API_URL`) e `src/hooks/use-employees.ts` (TanStack Query, invalida `['employees']`).

- Listagem: `EmployeesPage` controla os estados (carregando → skeleton, erro → retry, vazio → `EmployeesEmptyState`, lista → `EmployeesTable`) e os modais (`FormState`: `null` fechado, `{}` cadastro, `{ employee }` edição).
- `EmployeesTable`: ordena no cliente por admissão (`sortByAdmission`, padrão asc, cabeçalho alterna), badge Ativo/Desligado, dias trabalhados só com demissão.
- `DeleteEmployeeDialog`: `ConfirmDialog` destrutivo com `EmployeeSummary`.
- Teste visual manual: Playwright em scratchpad contra `npm run dev:api` + `npm run dev:web`.
