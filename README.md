# Harvard CV Studio AI — Gian Franco Martinez Villa

Aplicación web local e inteligente para automatizar la adaptación quirúrgica de CVs en formato Harvard estándar según la descripción de cada vacante (Job Description / JD), con exportación directa a PDF y guardado en el repositorio.

---

## 🚀 Cómo iniciar la aplicación

Puedes ejecutar la app con un solo comando:

```bash
npm run app
```

Esto levantará tanto el **servidor backend** (puerto `3001`) como la **interfaz web con Vite** (puerto `5173`).
Abre en tu navegador:
👉 **http://localhost:5173**

> **Modo servidor único (producción):**  
> Si prefieres correr un solo proceso que sirva todo:
> ```bash
> npm run server
> ```
> Y abrir en **http://localhost:3001**.

---

## 🎯 Características Principales

1. **Adaptación Quirúrgica con IA**:
   - Pega la descripción de la vacante (JD) de LinkedIn, Get on Board, Indeed, etc.
   - La IA analiza los requisitos técnicos prioritarios y adapta el CV manteniendo **100% de veracidad** basada en tu perfil canónico (`cv_fullstack.html` y `cv_fullstack_en.html`).
   - Respeta estrictamente las reglas doradas: Devitech es la única activa, fechas y empresas históricas cerradas, métricas de impacto comprobables (fórmula XYZ), y posicionamiento como *AI-Augmented Developer*.

2. **Soporte para Google Gemini y OpenAI**:
   - Soporta **Google Gemini 2.5 Flash** (rápido, de alta calidad y gratuito con Google AI Studio).
   - Soporta **OpenAI GPT-4o / GPT-4o-mini**.
   - Tu API Key se almacena localmente en tu propio navegador (`localStorage`) o en `.env`.

3. **Editor y Vista Previa Harvard A4 en Tiempo Real**:
   - **Vista Harvard**: Documento A4 exacto con tipografía Georgia, espaciados profesionales y márgenes oficiales.
   - **Edición Directa**: Haz clic en cualquier parte del CV para corregir o ajustar cualquier palabra o bullet al instante.
   - **Código HTML**: Modo editor de código para retoques finos de etiquetas.

4. **Acciones en 1 Clic**:
   - **Descargar PDF**: Ejecuta Puppeteer en el backend y descarga el PDF A4 en alta resolución.
   - **Guardar HTML**: Guarda automáticamente en la raíz con el estándar: `cv_{rol}_{empresa}_{lang}.html`.
   - **Historial del Repositorio**: Explora y recarga cualquiera de los más de 70 CVs ya creados en el proyecto.
