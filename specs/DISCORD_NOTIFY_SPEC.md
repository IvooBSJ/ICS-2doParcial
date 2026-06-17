# CI/CD Spec — Notificaciones de Discord

> Especificación técnica del sistema de notificaciones automáticas a Discord
> integrado en el pipeline de GitHub Actions (Spec Driven Development).
> Este documento es la fuente de verdad antes de tocar cualquier archivo de configuración.

---

## 1. Resumen

| Atributo | Valor |
|---|---|
| Feature | Notificaciones de Discord al finalizar el pipeline |
| Trigger | `push` y `pull_request` sobre `main` |
| Canal de entrega | Discord Webhook |
| Implementación | Nuevo job `notify` en `.github/workflows/ci.yml` |
| Action utilizada | `sarisia/actions-status-discord@v1` |
| Secret requerido | `DISCORD_WEBHOOK_URL` |

**Propósito:** Que el equipo reciba feedback inmediato en Discord cada vez que el pipeline de CI/CD termina, sin tener que entrar a GitHub Actions manualmente. El mensaje debe incluir suficiente contexto para saber qué pasó y dónde ir a investigar si algo falló.

---

## 2. Estructura del Pipeline (con el nuevo job)

```
push / pull_request a main
         │
         ▼
      [test]  ──────────────────────────────────────────────┐
         │                                                   │
         ▼                                                   │
      [sonar]  ─────────────────────────────────────────────┤
         │                                                   │
         ▼                                                   │
      [build]  ─────────────────────────────────────────────┤
         │                                                   │
         ▼                                                   │
      [deploy] ─────────────────────────────────────────────┤
                                                             │
                                                             ▼
                                                        [notify]
                                                    (siempre se ejecuta,
                                                     incluso si algo falló)
```

**Regla clave:** El job `notify` declara `if: always()`. Esto garantiza que el mensaje de Discord llegue tanto en pipelines exitosos como en pipelines con fallos.

---

## 3. Contrato del Mensaje de Discord

### 3.1 Estructura del Embed

El mensaje que llega a Discord es un **embed** con los siguientes campos:

| Campo | Contenido | Variable de GitHub Actions |
|---|---|---|
| Título | `CI/CD — ICS-2doParcial` | hardcoded |
| Color | 🟢 Verde `#00ff88` en éxito / 🔴 Rojo en fallo | automático (la action lo resuelve) |
| `Branch` | Nombre del branch que disparó el workflow | `github.ref_name` |
| `Commit` | Mensaje del último commit | `github.event.head_commit.message` |
| `Actor` | Usuario de GitHub que hizo el push | `github.actor` |
| Link | URL directa al run de GitHub Actions | `github.server_url / github.repository / actions/runs / github.run_id` |
| Timestamp | Hora del evento | automático |

### 3.2 Escenarios de notificación

| Estado del pipeline | Color del embed | Texto de estado |
|---|---|---|
| Todos los jobs pasaron ✅ | Verde | `Success` |
| Algún job falló ❌ | Rojo | `Failure` |
| Algún job fue cancelado ⚠️ | Amarillo | `Cancelled` |

### 3.3 Ejemplo visual del embed en Discord

```
╔══════════════════════════════════════════════════════╗
║  ✅  CI/CD — ICS-2doParcial                         ║
║  ─────────────────────────────────────────────────  ║
║  Branch     main                                    ║
║  Commit     "add: discord notifications spec"       ║
║  Actor      IvooBSJ                                 ║
║                                                     ║
║  [ Ver en GitHub Actions → ]                        ║
║                                           Hoy 18:30 ║
╚══════════════════════════════════════════════════════╝
```

---

## 4. Implementación en `ci.yml`

### 4.1 Job `notify` a añadir

```yaml
notify:
  runs-on: ubuntu-latest
  needs: [test, sonar, build, deploy]
  if: always()

  steps:
    - name: Notificar resultado a Discord
      uses: sarisia/actions-status-discord@v1
      with:
        webhook: ${{ secrets.DISCORD_WEBHOOK_URL }}
        status: ${{ job.status }}
        title: "CI/CD — ICS-2doParcial"
        description: |
          **Branch:** `${{ github.ref_name }}`
          **Commit:** ${{ github.event.head_commit.message }}
          **Actor:** ${{ github.actor }}
        url: "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
        color: 0x00ff88
```

### 4.2 Workflow completo resultante

```
jobs:
  test    → sonar → build → deploy → notify
                                      ↑
                              if: always()
                       needs: [test, sonar, build, deploy]
```

---

## 5. Configuración de Secretos

El job `notify` requiere un secreto de repositorio en GitHub.

### 5.1 Crear el Webhook en Discord

1. Ir al canal de Discord destino.
2. **Configuración del canal → Integraciones → Webhooks → Crear Webhook**.
3. Darle un nombre (por ej. `GitHub CI`).
4. Copiar la **Webhook URL**.

### 5.2 Registrar el secreto en GitHub

1. Ir al repositorio en GitHub.
2. **Settings → Secrets and variables → Actions → New repository secret**.
3. Completar:
   - **Name:** `DISCORD_WEBHOOK_URL`
   - **Secret:** pegar la URL del webhook de Discord.
4. Guardar.

> **Importante:** La URL del webhook **nunca** debe estar hardcoded en el `ci.yml`.
> Siempre debe referenciarse como `${{ secrets.DISCORD_WEBHOOK_URL }}`.

---

## 6. Flujo SDD

```
DISCORD_NOTIFY_SPEC.md  ──▶  ci.yml (job notify)  ──▶  Discord Webhook
      (este doc)               (implementación)          (canal destino)
```

1. **Definir contrato** → Este documento establece qué campos lleva el embed y cuándo se dispara.
2. **Registrar el secret** → `DISCORD_WEBHOOK_URL` en GitHub Secrets.
3. **Implementar el job** → Añadir el bloque `notify` al final de `ci.yml`.
4. **Verificar** → Hacer un push y confirmar que el embed llega a Discord con los datos correctos.
5. **Verificar fallo** → Romper un test temporalmente, pushear, confirmar que el embed llega en rojo.

---

## 7. Criterios de aceptación

- [ ] El mensaje de Discord llega dentro de los 30 segundos posteriores al fin del pipeline.
- [ ] El embed muestra el branch, commit y actor correctamente.
- [ ] El embed es verde cuando todos los jobs pasan.
- [ ] El embed es rojo cuando cualquier job falla.
- [ ] El link del embed redirige al run correcto de GitHub Actions.
- [ ] La URL del webhook no está expuesta en ningún archivo del repositorio.
