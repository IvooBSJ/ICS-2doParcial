# Docker Spec — Entorno de Ejecución Containerizado

> Especificación técnica del entorno Docker para el proyecto ICS-2doParcial.
> Permite que cualquier desarrollador levante el servidor Express en un contenedor
> reproducible con un único comando, independientemente de su sistema operativo.

---

## 1. Resumen

| Atributo | Valor |
|---|---|
| Base image | `node:20-alpine` |
| Estrategia | Multi-stage build (builder + runner) |
| Puerto expuesto | `3000` |
| Comando de arranque local | `docker compose up` |
| Archivos nuevos | `Dockerfile`, `.dockerignore`, `docker-compose.yml` |

**Propósito:** Proveer un entorno de ejecución estándar y reproducible. El multi-stage build garantiza que la imagen final sea liviana: solo contiene el código compilado y las dependencias de producción, sin TypeScript ni devDependencies.

---

## 2. Arquitectura del Build

```
Stage 1 — builder
  node:20-alpine
  ├── npm ci                    (todas las deps)
  ├── COPY src/ tsconfig.json   (fuentes TS)
  └── npm run build             (tsc → dist/validador.js + copia index.html)

Stage 2 — runner (imagen final)
  node:20-alpine
  ├── npm ci --only=production  (solo express, sin jest/ts/etc.)
  ├── COPY dist/     ← desde builder
  ├── COPY api/
  ├── COPY server.js
  └── COPY index.html
```

**Por qué multi-stage:** La imagen final no necesita TypeScript, Jest ni el compilador. Esto reduce el tamaño de ~500 MB a ~150 MB y es una buena práctica de seguridad (no exponer herramientas de desarrollo en producción).

---

## 3. Dockerfile

```dockerfile
# ── Stage 1: Compilación TypeScript ──────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ── Stage 2: Runtime de producción ───────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist    ./dist
COPY --from=builder /app/api     ./api
COPY --from=builder /app/server.js  ./server.js
COPY --from=builder /app/index.html ./index.html

EXPOSE 3000

CMD ["node", "server.js"]
```

---

## 4. docker-compose.yml

`docker-compose.yml` define **cómo correr** el contenedor localmente, mientras que el `Dockerfile` define **cómo construir** la imagen. Con Compose solo necesitás un comando para todo:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

---

## 5. .dockerignore

```
node_modules/
dist/
coverage/
.git/
.github/
*.test.js
*.test.ts
specs/
```

**Razón:** Excluye lo que no debe entrar al contexto de build de Docker: dependencias locales (se reinstalan en el container), artefactos previos, y archivos de desarrollo.

---

## 6. Comandos de uso

### Levantar con Docker Compose (recomendado)

```bash
docker compose up
```

Esto hace el build de la imagen automáticamente si no existe, y levanta el servidor.

### Comandos manuales (alternativa)

```bash
# Construir la imagen
docker build -t ics2do .

# Correr el contenedor
docker run -p 3000:3000 ics2do
```

### Abrir en el browser

```
http://localhost:3000
```

---

## 7. Integración con CI/CD

El pipeline de CI/CD no tiene un job separado de Docker — la verificación del `Dockerfile` se hace implícitamente a través del `build` job que ya compila el mismo código que Docker empaqueta.

> Si en el futuro se desea publicar la imagen a un registry (Docker Hub, GHCR),
> se podría agregar un job `docker-push` después del job `build`.

---

## 8. Flujo SDD

```
DOCKER_SPEC.md  ──▶  Dockerfile + docker-compose.yml  ──▶  docker compose up
   (este doc)              (implementación)                  (entorno local)
```

1. **Definir contrato** → Este documento establece la estrategia y los archivos necesarios.
2. **Implementar** → `Dockerfile`, `.dockerignore` y `docker-compose.yml` en la raíz.
3. **Verificar local** → `docker compose up` → servidor en `http://localhost:3000`.
4. **Verificar funcionalidad** → `POST http://localhost:3000/api/validar` responde correctamente.

---

## 9. Criterios de aceptación

- [ ] `docker compose up` construye la imagen y levanta el servidor sin errores.
- [ ] `POST http://localhost:3000/api/validar` responde correctamente desde el container.
- [ ] La imagen final NO contiene `node_modules` de devDependencies (jest, typescript, etc.).
