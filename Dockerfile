# Etapa 1: Build
FROM node:18-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Etapa 2: Production
FROM node:18-alpine AS production

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado desde la etapa builder
COPY --from=builder /app/dist ./dist

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Cambiar permisos
RUN chown -R nestjs:nodejs /app

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto (se pueden sobrescribir)
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]
