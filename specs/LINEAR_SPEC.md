# Linear Spec — Gestión de Tareas y Flujo de Equipo

> Especificación del flujo de trabajo con Linear integrado al repositorio GitHub.
> Simula cómo un equipo real conectaría la gestión de issues con el pipeline de CI/CD.

---

## 1. Resumen

| Atributo | Valor |
|---|---|
| Herramienta | Linear (linear.app) |
| Integración | Linear ↔ GitHub (nativa) |
| Convención de branches | `feature/ICS-<número>-descripcion` |
| Convención de commits | `tipo: descripción [ICS-<número>]` |
| Efecto | Issues de Linear se actualizan automáticamente con commits y PRs |

**Propósito:** Conectar la gestión de tareas del equipo con el código. Cada issue en Linear tiene un ciclo de vida trazable: `Todo → In Progress → In Review → Done`, vinculado automáticamente a branches, commits y PRs de GitHub.

---

## 2. Flujo de trabajo del equipo

```
Linear Issue creado
       │
       ▼
  Branch creado desde Linear
  feature/ICS-42-add-docker
       │
       ▼
  Desarrollo local
  (commits con [ICS-42])
       │
       ▼
  Pull Request a main
  (Linear lo detecta → mueve issue a "In Review")
       │
       ▼
  CI/CD pipeline pasa
       │
       ▼
  PR mergeado
  (Linear mueve issue a "Done" automáticamente)
```

---

## 3. Configuración de la integración

### 3.1 Conectar Linear con GitHub

1. Ir a **Linear → Settings → Integrations → GitHub**.
2. Hacer clic en **Connect** y autorizar acceso al repositorio `IvooBSJ/ICS-2doParcial`.
3. Linear detecta automáticamente branches y commits que contienen IDs de issues.

### 3.2 Crear un issue en Linear y abrir branch desde ahí

En cada issue de Linear hay un botón **"Open in GitHub"** o se puede copiar el nombre del branch sugerido:

```
feature/ICS-42-add-docker-support
```

Esto crea el branch en GitHub y mueve el issue a **"In Progress"** automáticamente.

---

## 4. Convenciones de nombres

### Branches

```
feature/ICS-<número>-<descripcion-corta>
fix/ICS-<número>-<descripcion-corta>
chore/ICS-<número>-<descripcion-corta>
```

Ejemplos reales del proyecto:

| Issue | Branch |
|---|---|
| Migrar validador a TypeScript | `feature/ICS-1-typescript-migration` |
| Añadir Docker | `feature/ICS-2-add-docker` |
| Configurar Discord notifications | `feature/ICS-3-discord-ci-notifications` |
| Fix SonarCloud coverage | `fix/ICS-4-sonar-coverage` |

### Commits

```
feat: descripción [ICS-<número>]
fix:  descripción [ICS-<número>]
```

---

## 5. Estados del issue en Linear y sus triggers

| Estado Linear | Cuándo ocurre |
|---|---|
| **Todo** | Issue creado |
| **In Progress** | Branch con ID del issue es pusheado |
| **In Review** | Pull Request abierto hacia `main` |
| **Done** | PR mergeado a `main` |

---

## 6. Valor para el proyecto y la evaluación

La integración Linear ↔ GitHub demuestra:

- **Trazabilidad completa**: cada línea de código puede rastrearse hasta el issue que la originó.
- **Flujo colaborativo profesional**: simula cómo trabaja un equipo real con distintos roles.
- **CI/CD como gate**: el pipeline de GitHub Actions actúa como validador antes de que un issue pueda cerrarse.

```
Requerimiento (Linear)
      ↓
   Código (GitHub branch)
      ↓
   Validación (GitHub Actions CI/CD)
      ↓
   Entrega (Deploy a Vercel)
      ↓
   Issue cerrado (Linear)
```

---

## 7. Setup requerido (una sola vez)

1. Crear cuenta en [linear.app](https://linear.app) (gratis para equipos pequeños).
2. Crear un proyecto llamado `ICS-2doParcial`.
3. Ir a **Settings → Integrations → GitHub** → conectar el repositorio.
4. Crear issues para las features del proyecto (ver tabla de branches arriba como referencia).
5. A partir de ahí, abrir branches desde Linear para que el vínculo sea automático.

---

## 8. Criterios de aceptación

- [ ] Linear conectado al repositorio `IvooBSJ/ICS-2doParcial`.
- [ ] Al menos 3 issues creados representando features del proyecto.
- [ ] Un branch abierto desde Linear mueve el issue a "In Progress".
- [ ] Un PR abierto mueve el issue a "In Review".
- [ ] El merge a main mueve el issue a "Done".
