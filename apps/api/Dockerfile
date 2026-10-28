# Build a partir da raiz do monorepo (lockfile único do npm workspaces):
#   docker build -f apps/api/Dockerfile .
FROM node:18-bullseye-slim

WORKDIR /usr/src/app

# Os testes usam MongoDB em memória; o container não precisa baixar o binário.
ENV MONGOMS_DISABLE_POSTINSTALL=1

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci -w apps/api

COPY apps/api apps/api

WORKDIR /usr/src/app/apps/api
RUN npm run build

EXPOSE 3333

CMD ["npm", "run", "start:dev"]
