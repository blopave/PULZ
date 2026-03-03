# PULZ — Análisis Profesional y Comparativa Regional

**Fecha:** Marzo 2026  
**Versión analizada:** PULZ v3.0

---

## 1. Resumen Ejecutivo

PULZ es un directorio de carreras de running y trail para Sudamérica que cubre 6 países con 110+ eventos. Está construido como una single-page application en vanilla JS con un diseño dark premium, sistema de autenticación con Supabase, y soporte trilingüe (ES/EN/PT).

**Veredicto general:** El sitio tiene un nivel de diseño visual y de código notablemente superior al promedio de los competidores locales. Sin embargo, presenta brechas importantes en contenido, datos y funcionalidades que lo separan de los líderes establecidos del mercado.

---

## 2. Panorama Competitivo

### Competidores directos identificados

| Sitio | Alcance | Carreras | Modelo |
|-------|---------|----------|--------|
| **Corro.com.ar** | Argentina | 50+ por temporada | Blog + calendario, contenido editorial |
| **Sportsfacilities.com.ar** | Argentina (NB Series) | ~15 principales | Organizador oficial, inscripciones integradas |
| **Traileros.ar** | Argentina + región | 100+ trail + road | Calendario editorial, contenido comunitario |
| **CorredorPromedio.com** | Argentina + Chile | 200+ | Calendario + reviews + Google Cal export |
| **Ahotu.com** | Global (184 países) | Miles | Agregador global, filtros avanzados, multiidioma |
| **Finishers.com** | Global | Miles | Agregador premium, temáticas, circuitos, fichas completas |
| **Locos Por Correr** | Argentina | Maratones confirmadas | Media running (radio, web, redes) |
| **UltraRunners.com.co** | Colombia | 100+ | Calendario + comunidad WhatsApp/IG |
| **CronometrajeInstantaneo** | Argentina | 100+ | Cronometraje + calendario + resultados |

### Segmentación del mercado

Los competidores se dividen en tres categorías claras:

**Agregadores globales** (Ahotu, Finishers): Miles de carreras, datos estructurados, fichas con elevación/clima/temática, filtros avanzados por distancia/deporte/país. Son el benchmark en funcionalidad.

**Plataformas locales editoriales** (Corro, Locos Por Correr, Traileros, Corredor Promedio): Contenido más editorial, datos de primera mano, notas de cada carrera, resultados, fotos. Menor calidad visual pero mayor profundidad informativa y actualización constante.

**Organizadores/Cronometristas** (Sportsfacilities, Cronometraje Instantáneo): Integración directa con inscripciones y resultados. Datos oficiales.

---

## 3. Análisis de PULZ — Fortalezas

### 3.1 Diseño visual (★★★★★)

PULZ está en un nivel de diseño significativamente superior a todos los competidores locales. Ningún sitio de carreras en Argentina o la región se acerca a este nivel de refinamiento visual.

- Paleta dark premium con accent `#DEFF00` (neon lime) bien ejecutada
- Sistema de color semántico completo (trail verde, ultra violeta, 42K rojo, 21K ámbar, ≤10K celeste)
- Tipografía editorial con buena jerarquía (Bebas Neue para display, Inter para cuerpo, JetBrains Mono para datos)
- Textura de grano SVG para profundidad visual
- Partículas flotantes y glow reactivo al mouse en las cards
- Splash con parallax scroll-to-header fluido
- Drawer lateral con countdown en tiempo real
- Badges de estado (confirmada/estimada) bien diferenciados

**Comparación:** Corro.com.ar tiene diseño funcional pero genérico. Sportsfacilities es WordPress con plantilla. Traileros es limpio pero básico. Finishers es el más cercano en calidad pero con estética light/corporativa. PULZ gana claramente en identidad visual.

### 3.2 Performance técnica (★★★★☆)

- Vanilla JS sin frameworks = carga instantánea, sin dependencias pesadas
- CSS custom properties para theming consistente
- `requestAnimationFrame` para animaciones optimizadas
- Scroll listener con `{passive: true}`
- Código bien organizado en módulos separados (app, auth, data, i18n)

### 3.3 Internacionalización (★★★★☆)

- Soporte ES/EN/PT con sistema i18n completo
- Cambio de idioma en tiempo real sin recarga
- Meses localizados correctamente
- Formato de fechas con `toLocaleDateString` por locale

Esto es una ventaja real: la mayoría de los competidores locales son monolingües. Solo Ahotu y Finishers ofrecen multiidioma.

### 3.4 Arquitectura de datos (★★★☆☆)

- Estructura compacta y eficiente (n, d, l, c, t, w, i, s)
- Distinción confirmada/estimada (campo `s`)
- Campo `iconic` para destacar eventos principales
- Descripciones opcionales y precios en carreras clave

### 3.5 Autenticación y features de usuario (★★★☆☆)

- Supabase Auth con email/password + Google OAuth
- Sistema de favoritos con localStorage
- Exportación a Google Calendar
- Modal de auth bien diseñado con flujos de signup/login/reset/confirm
- Sección de beneficios con features "próximamente" (alertas, recomendaciones)

---

## 4. Análisis de PULZ — Debilidades y Brechas

### 4.1 Volumen de datos (★★☆☆☆) — BRECHA CRÍTICA

Esta es la debilidad más importante. Con 110 carreras en 6 países, PULZ está significativamente por debajo de los competidores:

- **Corro.com.ar** lista más de 50 carreras solo en Argentina para los próximos meses, incluyendo muchas que PULZ no tiene (Festival Farmacity, Desafío Arrayanes, A Pampa Traviesa, Bs As Run UE, 15K Puerto Norte, etc.)
- **Corredor Promedio** cubre Argentina y Chile con más de 200 eventos
- **Traileros.ar** tiene cobertura extensiva de trail + road
- **Carreras Centro** lista 195 carreras próximas solo en Argentina
- **Ahotu** tiene cobertura de miles de carreras a nivel sudamericano

**Dato revelador:** Solo para Argentina, PULZ tiene 31 carreras. Corro.com.ar muestra más del doble. Y PULZ no incluye carreras populares como el Festival Farmacity, la Corrida San Silvestre, 15K Puerto Norte Rosario, A Pampa Traviesa, ni muchas carreras provinciales.

### 4.2 Profundidad de información (★★☆☆☆) — BRECHA IMPORTANTE

Cada ficha de carrera en PULZ tiene: nombre, fecha, ubicación, categorías, tipo y link. Pero le faltan datos que los competidores sí ofrecen:

- **Horario de largada** (Corro y Sportsfacilities lo incluyen siempre)
- **Punto de largada/llegada exacto** (Corro incluye dirección específica)
- **Circuito/recorrido** (mapa o descripción del circuito)
- **Kit del corredor** (qué incluye)
- **Costo de inscripción actualizado** (solo algunas carreras icónicas lo tienen)
- **Link directo de inscripción** (diferente al sitio oficial)
- **Resultados de ediciones anteriores**
- **Fotos y galería del evento**
- **Elevación/desnivel** (para trail, Finishers lo incluye siempre)
- **Clima esperado / altitud** (Finishers incluye temáticas como montaña, bosque, ciudad)

### 4.3 Actualización y mantenimiento (★★☆☆☆) — RIESGO

Los datos están hardcodeados en `data.js`. Esto implica:

- Cada actualización requiere editar código fuente
- No hay un panel de administración ni CMS
- No hay mecanismo para reportar errores o sugerir carreras
- Las carreras con fecha estimada (`s:"e"`) no tienen mecanismo de verificación
- No hay integración con fuentes de datos externas

Los competidores editoriales (Corro, Traileros, Locos Por Correr) actualizan constantemente con información de primera mano y verificación directa con organizadores.

### 4.4 SEO y descubrimiento (★☆☆☆☆) — BRECHA CRÍTICA

Al ser una SPA sin rutas, PULZ tiene serias limitaciones de SEO:

- No hay URLs individuales por país ni por carrera
- Todo el contenido se renderiza con JS (invisible para crawlers básicos)
- No hay `sitemap.xml` ni `robots.txt`
- No hay datos estructurados (JSON-LD para eventos)
- No hay meta tags dinámicas por contenido
- Un solo `<title>` para todo el sitio

**Comparación:** Finishers tiene una URL por cada carrera (`finishers.com/es/e/maraton-de-santiago`), con meta tags, datos estructurados y contenido indexable. Corro.com.ar tiene posts individuales por carrera. Ahotu tiene URLs por país/deporte/distancia.

### 4.5 Monetización y modelo de negocio (sin implementar)

PULZ no tiene modelo de monetización visible. Los competidores monetizan así:

- **Sportsfacilities:** Organización de eventos + partnerships con marcas (New Balance)
- **Finishers:** Inscripciones integradas (comisión por registro)
- **Ahotu:** Modelo freemium + destacados pagos para organizadores
- **Corro / Locos Por Correr:** Publicidad + contenido patrocinado
- **Dissent Running (Colombia):** Contenido que dirige a venta de ropa técnica

### 4.6 Comunidad y engagement (★★☆☆☆)

- No hay sección de comentarios ni reviews de carreras
- No hay integración con redes sociales
- No hay newsletter ni canal de comunicación directo
- No hay perfil de corredor (historial, carreras completadas, PRs)
- No hay sistema de reseñas o ratings de carreras

Los competidores locales tienen comunidades activas: Corredor Promedio en redes, UltraRunners en WhatsApp, Locos Por Correr en radio + redes, Traileros en Instagram.

### 4.7 Funcionalidades faltantes respecto a líderes

| Feature | PULZ | Finishers | Ahotu | Corro |
|---------|------|-----------|-------|-------|
| URL por carrera | ✗ | ✓ | ✓ | ✓ |
| Mapa de carreras | ✗ | ✓ | ✓ | ✗ |
| Inscripción integrada | ✗ | ✓ | ✗ | ✗ (link) |
| Resultados pasados | ✗ | ✓ | ✗ | ✗ |
| Búsqueda global | Parcial | ✓ | ✓ | ✗ |
| Datos estructurados | ✗ | ✓ | ✓ | ✗ |
| Perfil de corredor | ✗ | ✓ | ✗ | ✗ |
| Reviews/ratings | ✗ | ✓ | ✗ | ✗ |
| App móvil | ✗ | ✓ | ✗ | ✗ |
| Filtro por ubicación/mapa | ✗ | ✓ | ✓ | ✗ |
| Alertas de inscripción | Próx. | ✗ | ✗ | ✗ |
| Export calendario | ✓ | ✓ | ✓ | ✗ |
| Multiidioma | ✓ | ✓ | ✓ | ✗ |
| Favoritos | ✓ | ✓ | ✗ | ✗ |

---

## 5. Posicionamiento Actual

### ¿Dónde está PULZ hoy?

PULZ ocupa un espacio interesante pero no consolidado: **tiene el mejor diseño del mercado regional, pero el menor volumen de datos**. Es como un restaurante con la mejor decoración del barrio pero con la carta más chica.

### Mapa de posicionamiento

```
              ALTO volumen de datos
                      │
         Ahotu ●      │    ● Finishers
    Corredor Prom. ●  │
                      │
   ── BAJO diseño ────┼──── ALTO diseño ──
                      │
         Corro ●      │
     Traileros ●      │     ● PULZ (acá estás)
  Locos x Correr ●   │
                      │
              BAJO volumen de datos
```

### Ventaja competitiva real

La ventaja de PULZ no es solo estética — es de experiencia de usuario. Un corredor que entra a PULZ vs Corro.com.ar tiene una experiencia radicalmente distinta: más fluida, más moderna, más intuitiva. Pero esa ventaja se pierde si no encuentra su carrera.

---

## 6. Roadmap Sugerido de Prioridades

### Prioridad 1 — Cerrar la brecha de datos (impacto: crítico)

1. Ampliar el catálogo de Argentina a 80+ carreras (actualmente 31)
2. Cubrir carreras populares faltantes por país
3. Agregar campos: horario de largada, punto de largada, precio actualizado
4. Implementar sistema de contribución (formulario para sugerir carreras)
5. Migrar datos a Supabase (ya tenés la cuenta) para gestión dinámica

### Prioridad 2 — SEO y descubrimiento (impacto: crítico)

1. Implementar routing con hash o History API (URLs por país y por carrera)
2. Server-side rendering o pre-rendering para crawlers
3. Meta tags dinámicas por contenido
4. Datos estructurados JSON-LD (Event schema)
5. Sitemap.xml generado desde los datos
6. Landing pages por país indexables

### Prioridad 3 — Profundidad de fichas (impacto: alto)

1. Expandir datos de cada carrera (horario, largada, kit, precio, circuito)
2. Agregar mapas de ubicación (embed de Google Maps en drawer)
3. Descripciones para todas las carreras (no solo icónicas)
4. Links de inscripción directa separados del sitio oficial

### Prioridad 4 — Engagement y retención (impacto: medio)

1. Activar alertas de inscripción (ya anunciado como "próximamente")
2. Newsletter mensual con carreras destacadas del mes
3. Perfil de corredor básico (carreras guardadas, completadas)
4. Integración con Strava u otras plataformas

### Prioridad 5 — Modelo de negocio (impacto: medio-largo plazo)

1. Listados destacados para organizadores (modelo freemium)
2. Partnerships con marcas de running (NB, adidas, ASICS ya patrocinan carreras en la base)
3. Affiliate links a inscripciones

---

## 7. Conclusión

PULZ tiene una base técnica y visual excelente — probablemente la mejor del mercado regional para este nicho. El stack vanilla, el diseño premium, el multiidioma y la autenticación lo ponen en una posición sólida para escalar.

La brecha principal es de contenido, no de tecnología. Con el doble de carreras por país, fichas más completas, y URLs indexables, PULZ podría posicionarse como la referencia de carreras para Sudamérica — un espacio que hoy ningún competidor local ocupa de forma integral.

El diferencial real de PULZ debería ser: **la experiencia más bella y completa para encontrar tu carrera en Sudamérica**. El diseño ya está. Falta llenar el mapa.
