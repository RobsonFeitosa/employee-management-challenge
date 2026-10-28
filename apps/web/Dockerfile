# Build a partir da raiz do monorepo (lockfile único do npm workspaces):
#   docker build -f apps/web/Dockerfile .
FROM node:18-bullseye-slim

WORKDIR /usr/src/app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci -w apps/web

COPY apps/web apps/web

WORKDIR /usr/src/app/apps/web

EXPOSE 3000

CMD ["npm", "run", "dev"]
