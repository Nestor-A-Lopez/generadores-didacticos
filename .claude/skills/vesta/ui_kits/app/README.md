# UI kit — Aplicación de aprendizaje

Recorrido navegable: **acceso → panel → lección → avance**.

| Pantalla | Archivo | Qué se puede hacer |
| --- | --- | --- |
| Acceso | `LoginScreen.jsx` | Entrar (cualquier valor sirve) y pasar al panel. |
| Mi panel | `DashboardScreen.jsx` | Retomar la lección en curso, ver racha y métricas, abrir una lección de la ruta. |
| Lección | `WorkspaceScreen.jsx` | Cambiar entre Teoría / Ejercicio / Simulador, responder el ejercicio (la respuesta correcta es **44,1**), desplegar el desarrollo, pedir una pista, salir con confirmación modal. |
| Mi avance | `ProgressScreen.jsx` | Avance por materia y por semana. |

`AppChrome.jsx` aporta la barra lateral azul profundo y la cabecera de pantalla. El motivo de capas se reutiliza desde `../website/SiteChrome.jsx`.

Todos los primitivos vienen del bundle (`window.VestaDesignSystem_a1e3d1`).
