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
| Comando de arranque | `docker run -p 3000:3000 ics2do` |
| Archivos nuevos | `Dockerfile`, `.dockerignore` |

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

## 4. .dockerignore

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

## 5. Comandos de uso

### Build de la imagen

```bash
docker build -t ics2do .
```

### Levantar el servidor

```bash
docker run -p 3000:3000 ics2do
```

### Abrir en el browser

```
http://localhost:3000
```

---

## 6. Integración con CI/CD

Se agrega un job `docker-build` en el workflow de GitHub Actions para verificar que la imagen construye correctamente en cada push a `main`.

```yaml
docker-build:
  runs-on: ubuntu-latest
  needs: build

  steps:
    - name: Checkout del código
      uses: actions/checkout@v3

    - name: Verificar build de Docker
      run: docker build -t ics2do .
```

> Este job no hace push a ningún registry — solo verifica que el `Dockerfile` funciona.
> Es suficiente para demostrar que el entorno es reproducible.

---

## 7. Flujo SDD

```
DOCKER_SPEC.md  ──▶  Dockerfile + .dockerignore  ──▶  docker run
   (este doc)            (implementación)              (entorno local)
                               │
                         ci.yml job docker-build
                         (verificación en CI)
```

1. **Definir contrato** → Este documento establece la estrategia y los archivos necesarios.
2. **Implementar** → `Dockerfile` y `.dockerignore` en la raíz del proyecto.
3. **Verificar local** → `docker build -t ics2do .` → `docker run -p 3000:3000 ics2do`.
4. **Verificar en CI** → Job `docker-build` en `ci.yml` confirma que la imagen construye en el servidor de IC.

---

## 8. Criterios de aceptación

- [ ] `docker build -t ics2do .` termina sin errores.
- [ ] `docker run -p 3000:3000 ics2do` levanta el servidor.
- [ ] `POST http://localhost:3000/api/validar` responde correctamente desde el container.
- [ ] La imagen final NO contiene `node_modules` de devDependencies (jest, typescript, etc.).
- [ ] El job `docker-build` pasa en GitHub Actions.
