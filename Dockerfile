# Etapa 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Build de la aplicación (incluye SSR)
RUN npm run build

# Etapa 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copiar solo los archivos necesarios para producción
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Exponer el puerto
EXPOSE 4880

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=4880
# Comando para ejecutar la aplicación
CMD ["node", "dist/panel-control-red/server/server.mjs"]
