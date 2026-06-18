# Linear Spec — Gestión de Tareas y Flujo de Equipo

> Especificación del flujo de trabajo con Linear integrado al repositorio GitHub.
> Simula cómo un equipo real conectaría la gestión de issues con el pipeline de CI/CD.

---

## 1. Resumen

| Atributo | Valor |
|---|---|
| Herramienta | Linear (linear.app) |
| Proyecto | ICS-2doParcial |
| Integración | Linear ↔ GitHub (nativa) |
| Identificador de issues | `IVO-<número>` |
| Convención de branches | `feature/ivo-<número>-descripcion` |
| Convención de commits | `tipo: descripción [IVO-<número>]` |
| Efecto | Issues de Linear se actualizan automáticamente con commits y PRs |

**Propósito:** Conectar la gestión de tareas del equipo con el código. Cada issue en Linear tiene un ciclo de vida trazable: `Backlog → In Progress → In Review → Done`, vinculado automáticamente a branches, commits y PRs de GitHub.

---

## 2. Estado actual del proyecto

### Backlog

| ID | Issue | Estado |
|---|---|---|
| IVO-5 | add-docker | ⏳ Backlog |

### Done

| ID | Issue | Estado |
|---|---|---|
| IVO-9 | Deploy en Vercel con CD automático | ✅ Done |
| IVO-8 | Configurar notificaciones Discord en pipeline | ✅ Done |
| IVO-7 | Integrar SonarCloud para inspección de código | ✅ Done |
| IVO-6 | Configurar pipeline CI con GitHub Actions | ✅ Done |

---

## 3. Flujo de trabajo del equipo

```
Linear Issue creado (ej: IVO-5 add-docker)
       │
       ▼
  Branch creado desde Linear
  feature/ivo-5-add-docker
       │
       ▼
  Desarrollo local
  (commits con [IVO-5])
       │
       ▼
  Pull Request a main
  (Linear lo detecta → mueve issue a "In Review")
       │
       ▼
  CI/CD pipeline pasa (GitHub Actions)
       │
       ▼
  PR mergeado
  (Linear mueve issue a "Done" automáticamente)
```

---

## 4. Configuración de la integración

### 4.1 Conectar Linear con GitHub

1. Ir a **Linear → Settings → Integrations → GitHub**.
2. Hacer clic en **Connect** y autorizar acceso al repositorio `IvooBSJ/ICS-2doParcial`.
3. Linear detecta automáticamente branches y commits que contienen IDs de issues.

### 4.2 Crear un branch para un issue de Linear

Linear sugiere automáticamente el nombre del branch en cada issue. El flujo real es:

1. Abrir el issue en Linear → copiar el nombre de branch sugerido:
   ```
   feature/ivo-5-add-docker
   ```
2. Al copiar el nombre, Linear detecta la intención y mueve el issue a **"In Progress"** automáticamente — sin necesidad de crearlo desde Linear.
3. Crear el branch en GitHub o localmente:
   ```bash
   git checkout -b feature/ivo-5-add-docker
   ```
4. Pushear a GitHub — Linear confirma el vínculo al detectar el nombre en el repositorio.

---

## 5. Convenciones de nombres

### Branches

```
feature/ivo-<número>-<descripcion-corta>
fix/ivo-<número>-<descripcion-corta>
chore/ivo-<número>-<descripcion-corta>
```

### Issues reales del proyecto

| ID Linear | Issue | Branch |
|---|---|---|
| IVO-6 | Configurar pipeline CI con GitHub Actions | `feature/ivo-6-ci-github-actions` |
| IVO-7 | Integrar SonarCloud para inspección de código | `feature/ivo-7-sonarcloud` |
| IVO-8 | Configurar notificaciones Discord en pipeline | `feature/ivo-8-discord-notifications` |
| IVO-9 | Deploy en Vercel con CD automático | `feature/ivo-9-vercel-deploy` |
| IVO-5 | add-docker | `feature/ivo-5-add-docker` |

### Commits

```
feat: descripción [IVO-<número>]
fix:  descripción [IVO-<número>]
```

---

## 6. Estados del issue en Linear y sus triggers

| Estado Linear | Cuándo ocurre |
|---|---|
| **Backlog** | Issue creado, sin trabajo iniciado |
| **In Progress** | Branch con ID del issue es pusheado |
| **In Review** | Pull Request abierto hacia `main` |
| **Done** | PR mergeado a `main` |

---

## 7. Valor para el proyecto y la evaluación

La integración Linear ↔ GitHub demuestra:

- **Trazabilidad completa**: cada línea de código puede rastrearse hasta el issue que la originó.
- **Flujo colaborativo profesional**: simula cómo trabaja un equipo real con distintos roles.
- **CI/CD como gate**: el pipeline de GitHub Actions actúa como validador antes de que un issue pueda cerrarse.

```
Requerimiento (Linear IVO-X)
      ↓
   Código (GitHub branch feature/ivo-X-...)
      ↓
   Validación (GitHub Actions CI/CD)
      ↓
   Entrega (Deploy a Vercel)
      ↓
   Issue cerrado automáticamente (Linear → Done)
```

---

## 8. Criterios de aceptación

- [x] Linear conectado al repositorio `IvooBSJ/ICS-2doParcial`.
- [x] Al menos 3 issues creados representando features del proyecto (IVO-6 a IVO-9 + IVO-5).
- [x] Copiar el nombre del branch desde Linear mueve IVO-5 a "In Progress" automáticamente.
- [x] Branch `feature/ivo-5-add-docker` creado en GitHub y localmente.
- [ ] PR con IVO-5 abierto mueve el issue a "In Review".
- [ ] Merge a `main` mueve IVO-5 a "Done".
