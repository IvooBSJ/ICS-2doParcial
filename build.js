// build.js - Script de build local
// Copia los archivos estáticos a dist/ para simular un artefacto de build.
// Representa el paso de "empaquetado" del entorno de entrega.

import { copyFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = 'dist';
const FILES_TO_COPY = ['index.html'];

console.log('🔨 Iniciando build...\n');

// Crear directorio dist/ si no existe
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Directorio ${OUTPUT_DIR}/ creado`);
}

// Copiar archivos estáticos
let totalBytes = 0;
for (const file of FILES_TO_COPY) {
  const src = file;
  const dest = join(OUTPUT_DIR, file);
  copyFileSync(src, dest);
  const size = statSync(dest).size;
  totalBytes += size;
  console.log(`  ✅ ${file} → ${dest} (${size} bytes)`);
}

console.log(`\n✨ Build completado: ${FILES_TO_COPY.length} archivo(s), ${totalBytes} bytes totales`);
console.log(`   Artefacto generado en: ./${OUTPUT_DIR}/`);
