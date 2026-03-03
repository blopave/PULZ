# PULZ — Plan Maestro: Sistema de Datos Dinámico

**Fecha:** Marzo 2026  
**Objetivo:** Transformar PULZ de un sitio estático a una plataforma dinámica donde organizadores, runners y admins interactúan.

---

## Visión General

```
┌─────────────────────────────────────────────────────────┐
│                      PULZ PLATFORM                       │
├──────────┬──────────────┬──────────────┬────────────────┤
│  RUNNER  │ ORGANIZADOR  │    ADMIN     │   VISITANTE    │
│          │              │              │  (sin cuenta)  │
├──────────┼──────────────┼──────────────┼────────────────┤
│ ♥ Favs   │ + Publicar   │ ✎ Editar     │ 👁 Ver carreras│
│ 📅 Cal   │ ✎ Editar     │ 🗑 Eliminar  │ 🔍 Filtrar     │
│ 💡Sugerir│   propias    │ ✓ Aprobar    │ 🌐 Multiidioma │
│          │ 📊 Dashboard │ 👤 Gestionar │                │
│          │ 📈 Stats     │   usuarios   │                │
└──────────┴──────────────┴──────────────┴────────────────┘
                           │
                    ┌──────┴──────┐
                    │  SUPABASE   │
                    ├─────────────┤
                    │ Auth        │
                    │ Database    │
                    │ Storage     │
                    │ RLS (segur.)│
                    └─────────────┘
```

---

## FASE 0 — Prerequisitos (antes de codear)

### 0.1 Dominio
Opciones recomendadas (verificar disponibilidad):
- `pulz.run` (ideal, específico del nicho)
- `pulz.lat` (regional Latam)
- `getpulz.com` (alternativa)
- `pulzraces.com` (descriptivo)

**Registrar en:** Namecheap, Cloudflare, o Google Domains.

### 0.2 Email profesional
Opciones gratuitas o baratas:
- **Zoho Mail** (gratis para 1 dominio, 5 usuarios) → info@pulz.run
- **Cloudflare Email Routing** (gratis, redirige a tu Gmail)
- **Google Workspace** (USD 6/mes, la más profesional)

Emails a crear:
- `info@pulz.run` — contacto general
- `hola@pulz.run` — comunicación con organizadores
- `no-reply@pulz.run` — emails transaccionales (Supabase auth)

### 0.3 Hosting
Recomendación: **Vercel** (gratis para proyectos personales)
- Deploy automático desde GitHub
- HTTPS incluido
- Preview deploys por cada PR
- Edge functions si las necesitás

---

## FASE 1 — Base de Datos en Supabase

### 1.1 Schema de tablas

#### Tabla: `profiles` (extiende auth.users)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'runner' CHECK (role IN ('runner', 'organizer', 'admin')),
  display_name TEXT,
  -- Campos para organizador
  org_name TEXT,              -- "Sportsfacilities", "ARDA Rosario"
  org_website TEXT,           -- sitio web de la organización
  org_description TEXT,       -- breve descripción
  org_logo_url TEXT,          -- logo subido a Supabase Storage
  org_social_ig TEXT,         -- Instagram
  org_social_fb TEXT,         -- Facebook
  org_country TEXT,           -- país principal
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla: `countries` (catálogo)
```sql
CREATE TABLE countries (
  id TEXT PRIMARY KEY,        -- 'argentina', 'chile', etc.
  code TEXT NOT NULL,         -- 'AR', 'CL', etc.
  name TEXT NOT NULL,         -- 'Argentina', 'Chile'
  name_en TEXT,
  name_pt TEXT,
  sort_order INT DEFAULT 0
);
```

#### Tabla: `races` (la tabla principal)
```sql
CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Datos básicos (obligatorios)
  name TEXT NOT NULL,
  date DATE NOT NULL,
  country_id TEXT NOT NULL REFERENCES countries(id),
  location TEXT NOT NULL,           -- "Bariloche, Río Negro"
  categories TEXT[] NOT NULL,       -- {'42K','21K','10K'}
  type TEXT NOT NULL CHECK (type IN ('road', 'trail')),
  
  -- Datos extendidos (opcionales)
  website TEXT,
  description TEXT,
  description_en TEXT,
  description_pt TEXT,
  start_time TIME,                  -- horario de largada
  start_point TEXT,                 -- "Estadio Mary Terán, Av. Roca 4301"
  price TEXT,                       -- "ARS 15.000 / USD 120"
  registration_url TEXT,            -- link directo de inscripción
  
  -- Datos completos (opcionales)
  logo_url TEXT,                    -- logo del evento
  banner_url TEXT,                  -- imagen banner
  elevation_gain INT,               -- desnivel positivo (metros)
  surface TEXT,                     -- "asfalto", "tierra", "mixto"
  kit_description TEXT,             -- "Remera técnica + medalla + bolsa"
  contact_email TEXT,
  social_ig TEXT,
  social_fb TEXT,
  max_participants INT,
  
  -- Coordenadas (para futuro mapa)
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  
  -- Clasificación y estado
  is_iconic BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'estimated' CHECK (status IN ('confirmed', 'estimated')),
  source TEXT DEFAULT 'pulz' CHECK (source IN ('pulz', 'organizer', 'community')),
  
  -- Relaciones
  created_by UUID REFERENCES profiles(id),
  organizer_id UUID REFERENCES profiles(id),  -- organizador que la publicó
  
  -- Moderación (para sugerencias de runners)
  moderation_status TEXT DEFAULT 'approved' 
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderation_note TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla: `favorites` (reemplaza localStorage)
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, race_id)
);
```

#### Tabla: `race_suggestions` (sugerencias de runners)
```sql
CREATE TABLE race_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggested_by UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  date DATE,
  country_id TEXT REFERENCES countries(id),
  location TEXT,
  website TEXT,
  notes TEXT,                       -- "Vi esta carrera en Instagram"
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 Row Level Security (RLS)
```sql
-- Cualquiera lee carreras aprobadas
CREATE POLICY "Carreras públicas" ON races
  FOR SELECT USING (moderation_status = 'approved');

-- Organizador crea carreras (se publican directo)
CREATE POLICY "Organizador publica" ON races
  FOR INSERT WITH CHECK (
    auth.uid() = created_by 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'organizer')
  );

-- Organizador edita solo sus carreras
CREATE POLICY "Organizador edita propias" ON races
  FOR UPDATE USING (organizer_id = auth.uid());

-- Admin puede todo
CREATE POLICY "Admin full access" ON races
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Favoritos: cada usuario ve y gestiona los suyos
CREATE POLICY "Favs propios" ON favorites
  FOR ALL USING (user_id = auth.uid());
```

### 1.3 Migración de data.js
Script que convierte los 110+ registros actuales de `data.js` a INSERTs de SQL, mapeando los campos compactos (n, d, l, c, t, w, i, s) al schema nuevo.

---

## FASE 2 — Sistema de Roles y Registro

### 2.1 Flujo de registro actualizado

```
   ┌──────────────┐
   │  Crear cuenta │
   │  (email+pass) │
   └──────┬───────┘
          │
   ┌──────▼───────┐
   │ ¿Qué tipo de │
   │  cuenta?      │
   ├──────────────┤
   │ 🏃 Runner    │──→ Rol: runner  → Home
   │ 🏢Organizador│──→ Rol: organizer → Formulario org datos → Home
   └──────────────┘
```

### 2.2 Registro de organizador
Al elegir "Organizador", se muestra un paso extra:
- Nombre de la organización (obligatorio)
- Sitio web (opcional)
- País principal (obligatorio)
- Logo (opcional)
- Instagram / Facebook (opcional)

Esto se guarda en `profiles` y queda listo para publicar.

### 2.3 UI en el header
```
Visitante:     [Crear cuenta]  [Iniciar sesión]
Runner:        [Avatar + nombre] → menú: Mis favoritos, Mi calendario, Sugerir carrera, Cerrar sesión
Organizador:   [Avatar + nombre] → menú: Mis carreras, Publicar carrera, Mi perfil, Cerrar sesión
Admin:         [Avatar + nombre] → menú: Panel admin, + todo lo anterior
```

---

## FASE 3 — Formulario "Publicar Carrera" (Organizador)

### 3.1 Diseño del formulario
Formulario multi-step con el diseño PULZ (dark, neon accents):

**Paso 1 — Datos básicos** (obligatorios)
- Nombre de la carrera
- Fecha
- País + Ciudad/Ubicación
- Tipo: Asfalto / Trail
- Distancias disponibles (chips seleccionables + custom)

**Paso 2 — Detalles** (opcionales pero recomendados)
- Horario de largada
- Punto de largada (dirección)
- Sitio web oficial
- Link de inscripción
- Precio / rango de precios
- Descripción del evento (ES, con opción EN/PT)

**Paso 3 — Extras** (opcionales)
- Logo del evento (upload)
- Banner/imagen (upload)
- Kit del corredor (qué incluye)
- Cupo máximo
- Desnivel (si es trail)
- Contacto y redes

**Preview** → Así se va a ver tu carrera en PULZ → [Publicar]

### 3.2 Después de publicar
- La carrera aparece inmediatamente en el sitio
- Badge "Oficial" en la tarjeta
- El organizador ve un mini dashboard con sus carreras y estadísticas básicas (vistas, favoritos)

---

## FASE 4 — Badges en las Tarjetas

### 4.1 Tipos de badge por fuente
```
┌─────────────────────────────────────┐
│  ● Oficial                          │  ← Cargada por organizador
│  BRUT Bariloche                     │     (source: 'organizer')
│  Bariloche, Río Negro               │     Color: verde
│  50K  33K  21K  10K                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ⚡ PULZ                            │  ← Cargada por admin/vos
│  Maratón de Buenos Aires            │     (source: 'pulz')
│  Buenos Aires, CABA                 │     Color: pulse (amarillo neon)
│  42K                                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ◆ Comunidad                        │  ← Sugerida por runner
│  Trail del Cerro                    │     (source: 'community')
│  Tandil, Buenos Aires               │     Color: azul
│  25K  12K                           │
└─────────────────────────────────────┘
```

### 4.2 Badges existentes que se mantienen
- ★ Icónica (carreras destacadas)
- Confirmada / Fecha estimada (status de verificación)

---

## FASE 5 — Panel Admin (para vos)

Dashboard simple en `/admin` (protegido por rol):
- Lista de carreras con filtros y búsqueda
- Crear / editar / eliminar cualquier carrera
- Lista de sugerencias pendientes (aprobar/rechazar)
- Lista de usuarios (ver roles, puede cambiar rol)
- Stats básicos (total carreras, usuarios, favoritos)

---

## FASE 6 — Email de Lanzamiento a Organizadores

### 6.1 Prerequisitos
- Dominio registrado
- Email configurado (info@pulz.run o hola@pulz.run)
- Sitio deployado y funcionando
- Al menos 80+ carreras cargadas (base mínima creíble)

### 6.2 Lista de contactos
Fuentes para armar la lista:
- Sitios web de cada carrera (campo `w` en data.js)
- Instagram de organizadores (@sportsfacilities, @patagoniarun, etc.)
- Federaciones de atletismo por país
- Grupos de running en Facebook/WhatsApp

### 6.3 Estructura del email
- Asunto: "Tu carrera en PULZ — Visibilidad gratuita en toda Sudamérica"
- Header con logo PULZ
- Propuesta de valor en 3 líneas
- Screenshot del sitio (la UI vende sola)
- CTA: "Publicá tu carrera gratis"
- Datos: 6 países, 3 idiomas, exportación a Google Calendar
- Firma profesional con links

---

## FASE 7 — Sugerencias de Runners

Formulario simple (modal o página):
- Nombre de la carrera
- Fecha aproximada
- Ciudad / País
- Link si lo tiene
- Nota libre ("Vi esto en Instagram de @xxx")

Se guarda en `race_suggestions`, el admin lo revisa y si aprueba, crea la carrera real.

---

## Orden de Ejecución

```
SEMANA 1:
├── Dominio + email (vos, en paralelo)
├── Schema Supabase (tablas + RLS + migración datos)
├── Refactor app.js para consumir de Supabase en vez de data.js
└── Sistema de roles en auth (runner/organizador)

SEMANA 2:
├── Formulario de registro con selector de rol
├── Formulario "Publicar carrera" para organizadores
├── Badges en tarjetas (oficial/pulz/comunidad)
└── Dashboard organizador (mis carreras)

SEMANA 3:
├── Panel admin
├── Formulario de sugerencias (runners)
├── Favoritos migrados a Supabase (reemplazar localStorage)
└── Testing completo

SEMANA 4:
├── Deploy en Vercel
├── Email de lanzamiento (diseño + envío)
├── Publicación en redes
└── Monitoreo y ajustes
```

---

## Stack Tecnológico Final

| Componente | Tecnología | Costo |
|-----------|-----------|-------|
| Frontend | Vanilla HTML/CSS/JS (actual) | Gratis |
| Backend/DB | Supabase (Free tier) | Gratis |
| Auth | Supabase Auth | Gratis |
| Storage | Supabase Storage (logos) | Gratis (1GB) |
| Hosting | Vercel | Gratis |
| Dominio | Namecheap/Cloudflare | ~USD 10/año |
| Email | Zoho Mail o Cloudflare | Gratis |
| **TOTAL** | | **~USD 10/año** |
