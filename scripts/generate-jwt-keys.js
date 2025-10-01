#!/usr/bin/env node

/**
 * Script para generar claves JWT seguras
 * Uso: node scripts/generate-jwt-keys.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generador de Claves JWT Seguras\n');
console.log('=' . repeat(60));

// Generar JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📝 Copia estas claves a tu archivo .env:\n');
console.log('-'.repeat(60));
console.log(`JWT_SECRET=${jwtSecret}`);

// Generar JWT Refresh Secret
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);

// Generar Session Secret
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log(`SESSION_SECRET=${sessionSecret}`);

console.log('-'.repeat(60));
console.log('\n✅ Claves generadas exitosamente!');
console.log('⚠️  Guarda estas claves de forma segura');
console.log('⚠️  Nunca las compartas ni las subas a Git\n');

