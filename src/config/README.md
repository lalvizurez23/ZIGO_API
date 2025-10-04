# Configuración de la Aplicación

## Validación de Variables de Entorno

Este módulo asegura que **todas las variables de entorno requeridas estén presentes** antes de iniciar la aplicación.

### Principio de Seguridad

**MAL - Valores por defecto hardcodeados:**
```typescript
const secret = config.get('JWT_SECRET') || 'default-secret-123';  // ¡NUNCA!
```

**BIEN - Fallar rápidamente si falta:**
```typescript
const secret = config.get('JWT_SECRET');
if (!secret) {
  throw new Error('JWT_SECRET es requerido');
}
```

### Variables Requeridas

La aplicación **NO iniciará** si faltan estas variables:

#### Seguridad (JWT)
- `JWT_SECRET` - Clave secreta para firmar tokens (mínimo 32 caracteres recomendado)
- `JWT_EXPIRATION` - Tiempo de expiración del token (ej: "24h", "7d")

#### Base de Datos
- `DB_TYPE` - Tipo de base de datos (mysql, postgres)
- `DB_HOST` - Host de la base de datos
- `DB_PORT` - Puerto de la base de datos
- `DB_USERNAME` - Usuario de la base de datos
- `DB_PASSWORD` - Contraseña de la base de datos
- `DB_DATABASE` - Nombre de la base de datos

### 🛡️ ¿Por qué NO usar valores por defecto?

1. **Seguridad**: Valores hardcodeados son inseguros y predecibles
2. **Transparencia**: Si algo falta, debe fallar inmediatamente, no en producción
3. **Configuración explícita**: Obliga a configurar correctamente el ambiente
4. **Debugging**: Errores claros en lugar de comportamiento inesperado

### ✅ Flujo de Validación

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

### 🔧 Uso en el Código

#### Para variables REQUERIDAS (sensibles):
```typescript
import { getRequiredEnvVar } from './config/env.validation';

const secret = getRequiredEnvVar('JWT_SECRET');
// Lanza error si no existe
```

#### Para variables OPCIONALES (no sensibles):
```typescript
import { getOptionalEnvVar } from './config/env.validation';

const port = getOptionalEnvVar('PORT', '3000');
// Usa '3000' si PORT no está definido
```

### 📝 Configurar Variables de Entorno

1. **Copia el archivo de ejemplo:**
   ```bash
   cp env-example.txt .env
   ```

2. **Edita `.env` con tus valores:**
   ```env
   JWT_SECRET=tu_clave_super_secreta_aqui_minimo_32_caracteres
   JWT_EXPIRATION=24h
   
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=tu_password
   DB_DATABASE=zigo_ecommerce
   ```

3. **Inicia la aplicación:**
   ```bash
   npm run start:dev
   ```

### ❌ Mensajes de Error

Si falta una variable requerida:

```
[Bootstrap] ❌ ERROR: Faltan variables de entorno requeridas:
   - JWT_SECRET
   - DB_PASSWORD

📝 Solución:
   1. Copia el archivo env-example.txt a .env
   2. Configura todas las variables requeridas
   3. Reinicia la aplicación

Error: Faltan variables de entorno requeridas: JWT_SECRET, DB_PASSWORD
```

### 🔒 Buenas Prácticas

✅ **HACER:**
- Validar todas las variables críticas al inicio
- Usar valores fuertes y únicos para JWT_SECRET
- Mantener `.env` en `.gitignore`
- Documentar todas las variables en `env-example.txt`

❌ **NO HACER:**
- Hardcodear valores sensibles como fallback
- Subir archivos `.env` a Git
- Usar la misma `JWT_SECRET` en desarrollo y producción
- Ignorar advertencias de variables faltantes

### 🎯 Generar JWT_SECRET Seguro

```bash
# Opción 1: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Opción 2: OpenSSL
openssl rand -hex 64

# Opción 3: Script incluido
npm run generate:keys
```

---

**Resultado:** Una aplicación que **falla rápido y claro** si la configuración es incorrecta, en lugar de usar valores inseguros por defecto.

