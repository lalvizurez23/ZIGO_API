# Configuración de la Aplicación

Este módulo maneja la configuración y validación de variables de entorno del sistema.

## Validación de Variables de Entorno

El sistema asegura que **todas las variables de entorno requeridas estén presentes** antes de iniciar la aplicación.

### Principio de Seguridad

**MAL - Valores por defecto hardcodeados:**
```typescript
const secret = config.get('JWT_SECRET') || 'default-secret-123';  // NUNCA
```

**BIEN - Fallar rápidamente si falta:**
```typescript
const secret = config.get('JWT_SECRET');
if (!secret) {
  throw new Error('JWT_SECRET es requerido');
}
```

---

## Variables Requeridas

La aplicación **NO iniciará** si faltan estas variables:

### Seguridad (JWT)
- `JWT_SECRET` - Clave secreta para firmar tokens (mínimo 32 caracteres)
- `JWT_EXPIRATION` - Tiempo de expiración del token (ej: "10m", "24h")
- `JWT_RENEWAL_EXTENSION` - Tiempo de extensión al renovar (ej: "10m")

### Redis (Blacklist de Tokens)
- `REDIS_HOST` - Host de Redis (ej: "localhost")
- `REDIS_PORT` - Puerto de Redis (ej: 6379)
- `REDIS_DB` - Base de datos de Redis (ej: 0)
- `REDIS_TTL` - TTL para tokens en blacklist (ej: 86400)

### Base de Datos
- `DB_TYPE` - Tipo de base de datos (mysql, postgres)
- `DB_HOST` - Host de la base de datos
- `DB_PORT` - Puerto de la base de datos
- `DB_USERNAME` - Usuario de la base de datos
- `DB_PASSWORD` - Contraseña de la base de datos
- `DB_DATABASE` - Nombre de la base de datos

---

## Por qué NO usar valores por defecto

1. **Seguridad**: Valores hardcodeados son inseguros y predecibles
2. **Transparencia**: Si algo falta, debe fallar inmediatamente, no en producción
3. **Configuración explícita**: Obliga a configurar correctamente el ambiente
4. **Debugging**: Errores claros en lugar de comportamiento inesperado

---

## Flujo de Validación

```
Inicio de la aplicación
         ↓
validateEnvironment()
         ↓
   ¿Todas presentes?
    ↙          ↘
  SÍ           NO
   ↓            ↓
Continuar   ERROR + EXIT
```

---

## Configurar Variables de Entorno

### 1. Copia el archivo de ejemplo
```bash
cp env-example.txt .env
```

### 2. Genera JWT Secret seguro
```bash
npm run generate:keys
```

### 3. Edita .env con tus valores
```env
# JWT (REQUERIDO)
JWT_SECRET=tu_clave_generada_con_npm_run_generate_keys
JWT_EXPIRATION=10m
JWT_RENEWAL_EXTENSION=10m

# Redis (REQUERIDO)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_TTL=86400

# Base de datos (REQUERIDO)
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_password
DB_DATABASE=zigo_ecommerce

# Aplicación (OPCIONAL)
PORT=3000
NODE_ENV=development
```

### 4. Inicia la aplicación
```bash
npm run start:dev
```

---

## Mensajes de Error

Si falta una variable requerida:

```
[Bootstrap] ERROR: Faltan variables de entorno requeridas:
   - JWT_SECRET
   - REDIS_HOST

Solución:
   1. Copia el archivo env-example.txt a .env
   2. Configura todas las variables requeridas
   3. Reinicia la aplicación

Error: Faltan variables de entorno requeridas: JWT_SECRET, REDIS_HOST
```

---

## Generar JWT_SECRET Seguro

### Opción 1: Script incluido (Recomendado)
```bash
npm run generate:keys
```

### Opción 2: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Opción 3: OpenSSL
```bash
openssl rand -hex 64
```

**Resultado:** Una clave de 128 caracteres hexadecimales (64 bytes).

---

## Configuración de Redis

Redis es **obligatorio** para el sistema de blacklist de tokens.

### Instalación con Docker
```bash
docker run -d -p 6379:6379 redis:alpine
```

### Verificar funcionamiento
```bash
docker ps | findstr redis
```

### Variables de Redis
```env
REDIS_HOST=localhost      # Host de Redis
REDIS_PORT=6379           # Puerto de Redis
REDIS_DB=0                # Base de datos (0-15)
REDIS_TTL=86400           # TTL en segundos (24 horas)
```

---

## Uso en el Código

### Para variables REQUERIDAS (sensibles)
```typescript
import { getRequiredEnvVar } from './config/env.validation';

const secret = getRequiredEnvVar('JWT_SECRET');
// Lanza error si no existe
```

### Para variables OPCIONALES (no sensibles)
```typescript
import { getOptionalEnvVar } from './config/env.validation';

const port = getOptionalEnvVar('PORT', '3000');
// Usa '3000' si PORT no está definido
```

---

## Buenas Prácticas

### HACER:
- Validar todas las variables críticas al inicio
- Usar valores fuertes y únicos para JWT_SECRET
- Mantener `.env` en `.gitignore`
- Documentar todas las variables en `env-example.txt`
- Generar JWT_SECRET con herramientas criptográficas
- Usar Redis para blacklist de tokens

### NO HACER:
- Hardcodear valores sensibles como fallback
- Subir archivos `.env` a Git
- Usar la misma `JWT_SECRET` en desarrollo y producción
- Ignorar advertencias de variables faltantes
- Usar valores predecibles para JWT_SECRET
- Omitir Redis (es obligatorio)

---

## Arquitectura de Configuración

```
env.validation.ts
    ↓
Valida variables al inicio
    ↓
Si falta alguna → ERROR + EXIT
    ↓
Si todas presentes → Continúa
    ↓
data-source.ts usa las variables
    ↓
Aplicación inicia correctamente
```

---

## Resumen

- Validación estricta de variables de entorno
- JWT_SECRET, REDIS_* y DB_* son obligatorias
- Falla rápido y claro si falta configuración
- No usa valores por defecto inseguros
- Genera JWT_SECRET con herramientas criptográficas
- Redis obligatorio para blacklist de tokens
- Configuración explícita antes de iniciar