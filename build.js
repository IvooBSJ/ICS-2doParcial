// build.js - Script de build local
// 1. Compila TypeScript (src/ → dist/)
// 2. Copia los archivos estáticos a dist/
// Representa el paso de "empaquetado" del entorno de entrega.

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = 'dist';
const FILES_TO_COPY = ['index.html'];

console.log('🔨 Iniciando build...\n');

// Paso 1: Compilar TypeScript
console.log('🔷 Compilando TypeScript...');
execSync('npx tsc', { stdio: 'inherit' });
console.log('  ✅ TypeScript compilado → dist/\n');

// Paso 2: Crear directorio dist/ si no existe
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Paso 3: Copiar archivos estáticos
let totalBytes = 0;
for (const file of FILES_TO_COPY) {
  const src = file;
  const dest = join(OUTPUT_DIR, file);
  copyFileSync(src, dest);
  const size = statSync(dest).size;
  totalBytes += size;
  console.log(`  ✅ ${file} → ${dest} (${size} bytes)`);
}

console.log(`\n✨ Build completado: TypeScript + ${FILES_TO_COPY.length} archivo(s) estático(s)`);
console.log(`   Artefacto generado en: ./${OUTPUT_DIR}/`);
