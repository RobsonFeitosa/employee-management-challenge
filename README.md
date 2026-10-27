# CRUD de Funcionários

Cadastro, edição, listagem e exclusão de funcionários, com cálculo automático de dias trabalhados e horas diárias de expediente.

- **API:** NestJS 10 (sobre Express) + MongoDB/Mongoose — `apps/api`
- **Web:** Next.js 14 (App Router) + React + Tailwind CSS + shadcn/ui — `apps/web`

## Pré-requisitos

- Node.js 18.17+ (`.nvmrc` aponta para 18.20.8)
- Docker + Docker Compose (para o MongoDB)

## Instalação e execução

```bash
nvm use
npm install

cp .env.example .env                    # credenciais do MongoDB do docker compose
cp apps/api/.env.example apps/api/.env  # MONGODB_URI usando as mesmas credenciais

npm run db:up     # sobe o MongoDB
npm run dev:api   # http://localhost:3333
npm run dev:web   # http://localhost:3000
```

Testes: `npm test`.

## Variáveis de ambiente

Nenhuma credencial é versionada: os arquivos `.env` estão no `.gitignore` e os `.env.example` trazem só os nomes das variáveis.

| Arquivo | Variável | Descrição |
|---|---|---|
| `.env` | `MONGO_INITDB_ROOT_USERNAME` / `MONGO_INITDB_ROOT_PASSWORD` | Usuário e senha root criados pelo container do MongoDB |
| `.env` | `MONGO_PORT` | Porta exposta no host (padrão `27017`) |
| `apps/api/.env` | `MONGODB_URI` | Ex.: `mongodb://<usuario>:<senha>@localhost:27017/employees?authSource=admin` |
| `apps/api/.env` | `PORT` | Porta da API (padrão `3333`) |
| `apps/api/.env` | `WEB_ORIGIN` | Origem do front liberada no CORS (padrão `http://localhost:3000`) |

## 🛠️ Decisões Técnicas e Modernização da Stack

A especificação sugere Node.js + Express + MongoDB no backend e jQuery/Angular + Bootstrap + Moment.js no frontend. Mantive a base pedida (Node.js, Express como servidor HTTP e MongoDB) e troquei as camadas de frontend e utilitários por equivalentes atuais. Escolhi cada troca para facilitar a manutenção e os testes da solução. Nenhuma delas muda as regras de negócio.

### Resumo comparativo

| Camada | Tecnologia solicitada | Tecnologia adotada | Ganho técnico |
|---|---|---|---|
| Runtime / HTTP | Node.js + Express | Node.js + **NestJS** (Express por baixo) | Módulos com injeção de dependência, separação Controller/Service/DTO e testes isolados por camada |
| Banco de dados | MongoDB | MongoDB + **Mongoose** | Schema tipado com validações próprias, além das validações dos DTOs |
| Validação | — | **class-validator** (API) + **Zod** (web) | As mesmas regras são validadas no cliente e no servidor |
| Interface | jQuery ou Angular | **Next.js (App Router) + React** | UI declarativa em componentes reutilizáveis, sem manipulação imperativa do DOM |
| Estilo / componentes | Bootstrap | **Tailwind CSS + shadcn/ui (Radix UI)** | CSS gerado sob demanda e componentes acessíveis (WAI-ARIA, foco preso nos modais) |
| Datas | Moment.js | **date-fns** / funções nativas | Funções puras e imutáveis, importadas individualmente (tree-shaking) |

### 1. Aderência aos requisitos de negócio

As trocas de tecnologia não mudam o domínio. Cada regra da especificação tem um ponto de implementação rastreável:

| Requisito | Onde é garantido |
|---|---|
| Nome obrigatório e sem números | Schema Mongoose (`NAME_PATTERN`), DTO e schema Zod |
| Data de demissão opcional e não anterior à admissão | Hook `pre('validate')` do schema, DTO e schema Zod |
| Expediente `HH:mm`; fim não anterior ao início | `TIME_PATTERN` + hook do schema, DTO e schema Zod |
| Periodicidade restrita a Mensal/Bimestral/Trimestral/Semestral/Anual | Enum `ClosingPeriodicity` (schema, DTO e select do formulário) |
| Dias corridos entre admissão e demissão (só com demissão) | Utilitário isolado e testado no front |
| Horas por dia em texto legível ("8 horas e 30 minutos") | Utilitário isolado e testado no front |
| Modal de confirmação ao criar, editar e excluir | Dialog do shadcn/ui com resumo dos dados |
| Listagem por admissão (mais antiga primeiro) e estado vazio | Service da API (`sort` por `admissionDate`) e tela de listagem |

As regras ficam em três camadas (formulário, DTO e schema). Assim, uma chamada direta à API, sem passar pelo front, também não grava dados inválidos.

### 2. Backend: NestJS sobre Node.js, Express e MongoDB

O NestJS **usa o Express** (`@nestjs/platform-express`) como servidor HTTP, então a base pedida continua a mesma. Ele acrescenta:

- **TypeScript estrito** do schema ao controller;
- **Injeção de dependência e módulos**, que deixam o `EmployeeService` testável com o model substituído por mock ou por um MongoDB em memória;
- **Camadas separadas**: o controller cuida do HTTP, o service das regras e consultas, os DTOs com `class-validator` validam a entrada (o `ValidationPipe` global rejeita campos desconhecidos) e o schema Mongoose garante a integridade no banco.

### 3. Frontend: Next.js (React) em vez de jQuery / Angular legado

Com jQuery, a interface precisa sincronizar o estado com o DOM manualmente. Em React, a UI é declarada como função do estado. Isso vale especialmente para os **cálculos em tempo real** (dias trabalhados e horas/dia), que são atualizados enquanto o formulário é preenchido sem nenhum código de sincronização. O Next.js com App Router organiza rotas e layouts, permite renderização no servidor quando ela for útil e oferece um build de produção otimizado sem configuração extra. Os formulários usam `react-hook-form` + Zod, com mensagens de erro em cada campo.

### 4. Estilo e componentes: Tailwind CSS + shadcn/ui em vez de Bootstrap

O Tailwind gera **somente as classes usadas**, enquanto o Bootstrap traz uma folha de estilos completa. O shadcn/ui copia para o projeto componentes construídos sobre o **Radix UI**, que já cuidam da acessibilidade (atributos ARIA, navegação por teclado, foco preso e restaurado nos modais). Isso importa porque os modais de confirmação são centrais neste desafio. Como o código dos componentes fica no repositório, é possível ajustá-los sem sobrescrever o CSS de uma biblioteca externa.

### 5. Datas: date-fns / APIs nativas em vez de Moment.js

Desde 2020, o próprio time do Moment.js [recomenda não usá-lo em projetos novos](https://momentjs.com/docs/#/-project-status/) por causa do bundle grande, que não permite tree-shaking, e dos objetos mutáveis. O `date-fns` oferece funções puras sobre `Date`: cada operação devolve um valor novo, o que evita efeitos colaterais, e só as funções importadas entram no bundle. Para horários `HH:mm`, a conversão para minutos é aritmética simples e não precisa de biblioteca.

### Outras particularidades

- **Datas sem fuso:** admissão e demissão são datas de calendário. Por isso a API recebe `YYYY-MM-DD` e guarda à meia-noite UTC, evitando que o fuso do navegador desloque o dia.
- **Limites inclusivos:** a especificação diz "não pode ser anterior". Então demissão no mesmo dia da admissão e fim de expediente igual ao início são aceitos.
- **Node 18:** as versões (NestJS 10, Next.js 14) foram escolhidas para rodar em Node 18 LTS. NestJS 11 e Next.js 15 exigem Node 20.
