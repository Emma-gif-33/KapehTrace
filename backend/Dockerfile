# ==============================================================================
# Dockerfile para Backend KapehTrace (Node.js 20 LTS + TypeScript)
# ==============================================================================

# Etapa 1: Compilación
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json tsconfig.json ./

# Instalar dependencias completas
RUN npm install

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript a JavaScript (dist/)
RUN npm run build

# Etapa 2: Imagen de Producción Ligera
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000
ENV HOST=0.0.0.0

# Copiar manifiestos e instalar solo dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev

# Copiar build compilado desde la etapa 1
COPY --from=builder /app/dist ./dist

# Exponer puerto del servidor API
EXPOSE 8000

# Arranque del servidor
CMD ["node", "dist/server.js"]
