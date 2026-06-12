# HuellaClub — Contexto del Proyecto

## Información General
- **Producto:** Programa de lealtad digital para negocios locales en México
- **URL producción:** https://huellaclub.app
- **GitHub:** github.com/victor91sa-sys/loyaltyapp
- **Precio:** $199 MXN/mes con 30 días gratis
- **Fundador:** Víctor Sabino Hernández Sánchez

---

## Stack Técnico
- **Framework:** Next.js 15 + TypeScript
- **Estilos:** Tailwind CSS v4
- **Base de datos:** Supabase (PostgreSQL)
- **Pagos:** Stripe (producción activa)
- **WhatsApp:** Twilio (pendiente activación Meta)
- **Email:** Resend
- **Deploy:** Vercel (auto-deploy desde GitHub)
- **Dev workflow:** Cursor → git push → Vercel auto-deploy

---

## Variables de Entorno (Vercel)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY
- STRIPE_SECRET_KEY (live)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (live)
- STRIPE_PRICE_ID → price_1TejIIA7RvcbkvWoIeMOM0Ur
- STRIPE_WEBHOOK_SECRET (producción)
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_WHATSAPP_FROM → whatsapp:+5215564315801
- RESEND_API_KEY
- CRON_SECRET

---

## Estructura de Archivos
- app/page.tsx → Home completo
- app/layout.tsx → Fuentes y metadata
- app/globals.css → Estilos globales
- app/registro/page.tsx → Registro 2 pasos
- app/login/page.tsx → Login
- app/dashboard/page.tsx → Dashboard dueño
- app/editor-qr/page.tsx → Editor de cartel QR
- app/visita/page.tsx → Página cliente escanea QR
- app/mi-progreso/page.tsx → Portal del cliente
- app/bienvenida/page.tsx → Post-registro
- app/nueva-password/page.tsx → Reset password
- app/recuperar/page.tsx → Recuperar cuenta
- app/pago-exitoso/page.tsx → Post-pago Stripe
- app/cancelar/page.tsx → Cancelar suscripción
- app/terminos/page.tsx → Términos y condiciones
- app/api/checkout/route.ts → Crear sesión Stripe
- app/api/webhook/route.ts → Webhook Stripe → Supabase
- app/api/whatsapp/route.ts → Enviar WhatsApp Twilio
- app/api/cancelar/route.ts → Cancelar suscripción Stripe
- app/api/cron/route.ts → Emails días 25/29/31 del trial
- app/api/feedback/route.ts → Feedback privado al dueño
- lib/supabase.ts → Cliente Supabase con tipos
- public/images/estrella.svg → Personaje estrella de la marca
- public/images/HUELLA_CLUB.svg → Logo completo

---

## Supabase — Estructura de Tablas

### negocios
- id → int8 (primary key)
- nombre → text
- tipo → text
- correo → text
- visitas → int4 (meta de visitas para recompensa principal)
- recompensas → text (descripción recompensa principal)
- user_id → uuid
- suscripcion_activa → bool
- created_at → timestamptz
- google_maps_url → text (opcional, para review gating)

### clientes
- id → int8 (primary key)
- celular → text
- negocio_id → int8
- visitas → int4
- ultima_visita → timestamptz
- created_at → timestamptz
- premio_pendiente → bool (true cuando ganó premio, false después de canjear)

### recompensas (niveles adicionales opcionales)
- id → int8 (primary key)
- created_at → timestamptz
- negocio_id → int8 (IMPORTANTE: int8 no uuid)
- visitas_requeridas → int4 (visitas TOTALES acumuladas)
- descripcion → text
- orden → int4

---

## Stripe
- Price ID producción: price_1TejIIA7RvcbkvWoIeMOM0Ur
- Webhook: https://huellaclub.app/api/webhook
- Monto: $199 MXN/mes
- Trial: 30 días gratis (calculado por created_at del negocio)

---

## Funcionalidades Implementadas

### Para el dueño del negocio
- Registro en 2 pasos
- Dashboard con métricas en tiempo real
- Clientes totales, visitas esta semana, premios pendientes
- Gráfica de visitas por día (últimos 7 días)
- Clientes inactivos (7, 14, 30 días)
- Premios pendientes de canjear con botón Marcar como canjeado
- Configuración de recompensa principal
- Niveles de recompensa opcionales (hasta 3)
- Campo Google Maps URL para review gating
- Editor de cartel QR personalizable
- Descarga QR en PNG
- Emails automáticos días 25, 29 y 31 del trial

### Para el cliente
- Escanea QR → ingresa celular → registra visita
- Protección anti-trampa: 1 visita por día por celular
- Progreso visual con barras y estrellas
- Niveles segmentados: completado / en progreso / bloqueado
- Pantalla de celebración al ganar premio
- Muestra esta pantalla en caja para reclamar
- Premio pendiente: no se reinicia hasta que el dueño canjee
- Review gating: 5 estrellas → Google Maps / 4 o menos → feedback privado
- Mensaje emocional con invitación al siguiente nivel
- Portal /mi-progreso: ve su progreso en todos sus negocios

---

## Posicionamiento de Marca

### Propósito
Existimos para que cada dueño de negocio local sepa que su esfuerzo vale la pena, un cliente que regresa a la vez.

### Cliente ideal
- Joven que acaba de abrir su primer negocio local
- Miedo central: trabajar mucho sin ver resultados
- Lo que necesita: reconocimiento de que lo está haciendo bien

### Mensaje central
Cada cliente que regresa es prueba de que lo estás haciendo bien

### Slogan
Vuelven por ti.

### Valores
1. Reconocimiento
2. Simplicidad
3. Comunidad

### Tono de voz
- Cercano, honesto, motivador, simple, emocional pero no sentimental
- NUNCA: Maximiza tu ROI, Solución integral
- SÍ: Cada cliente que regresa es prueba de que lo estás haciendo bien

---

## Identidad Visual

### Paleta de colores (pendiente implementar en todas las páginas)
- Soft Linen → #F0E9DD (fondo)
- Slate Indigo → #565CE2 (primario)
- Scarlet Fire → #F73E1A (acento/CTA)
- Ocean Twilight → #4044B2 (secundario/hover)

### Tipografía (pendiente implementar)
- Títulos: Plus Jakarta Sans
- Cuerpo: Inter

### Personajes de marca
4 personajes con ojos y expresiones (estrella, flor, y otros 2)
Aparecen en momentos clave de la interfaz con emociones:
- Registro completado → celebrando
- Visita registrada → aplaudiendo
- Premio ganado → eufóricos
- Ya visitaste hoy → tristes
- Nivel bloqueado → animando

---

## Flujos Importantes

### Flujo de visita
1. Cliente escanea QR
2. Ingresa celular
3. Sistema verifica si ya visitó hoy (24h)
4. Si tiene premio_pendiente → muestra pantalla de reclamar
5. Si no → suma visita
6. Verifica si ganó nivel o recompensa principal
7. Si ganó → premio_pendiente = true, muestra celebración
8. Si no → muestra progreso con niveles
9. Al completar → review gating (5 estrellas Google Maps / menos → feedback privado)

### Flujo de canje
1. Cliente muestra pantalla en caja
2. Dueño ve en dashboard Premios pendientes
3. Click Marcar como canjeado
4. visitas = 0, premio_pendiente = false
5. Cliente empieza nuevo ciclo

### Review gating
1. Cliente completa recompensa
2. Pantalla celebración + pregunta de experiencia
3. 5 estrellas + tiene google_maps_url → redirect directo
4. 5 estrellas + no tiene link → pantalla de gracias
5. 4 o menos → pregunta qué podemos mejorar → feedback al correo del negocio

---

## Negocio de prueba
- ID: 29
- URL visita: https://huellaclub.app/visita?negocio=29

---

## Pendientes

### Producto
- Implementar paleta de colores nueva en todas las páginas
- Implementar tipografía Plus Jakarta Sans + Inter
- Personajes con emociones en momentos clave
- Multi-sucursal
- Apple Wallet + Google Wallet (v2.0)
- Campañas de reactivación (requiere WhatsApp activo)
- Estadísticas avanzadas
- Agregar Apple Wallet / Google Wallet próximamente en home

### Marketing
- Activar WhatsApp Business en Meta (bloqueado por método de pago)
- Grabar 5 videos tutoriales (guiones listos)
- Publicar 9 posts en Facebook e Instagram (copies listos)
- Lanzar 3 anuncios Meta ($500 MXN presupuesto, copies listos)

### Completado
- App funcionando en huellaclub.app
- Stripe producción ($199 MXN/mes)
- Webhook Stripe → Supabase
- Trial 30 días con emails emocionales (cron job)
- Rediseño fondo blanco todas las páginas
- Posicionamiento emocional aplicado en todo el producto
- Portal del cliente /mi-progreso
- Métricas de clientes inactivos
- Review gating con Google Maps
- Feedback privado al dueño
- Sistema de premio pendiente con canje manual
- Múltiples niveles de recompensa (hasta 3)
- Niveles segmentados en página de visita
- Mensaje emocional al ganar nivel
- Home actualizado con nuevas features
- Editor QR con personalización completa
- Estrategia de marca completa
- 9 copies para redes sociales listos
- 5 guiones de videos tutoriales listos
- 3 copies de anuncios Meta listos
- Estrella personaje en navbar y footer
- Página de Facebook e Instagram creadas

---

## Guiones de Videos Tutoriales

### Video 1 → Cómo registrar tu negocio (2 min)
Pantallas: huellaclub.app → /registro → dashboard
Mensaje: Si abriste tu negocio con todo el esfuerzo del mundo, mereces saber quién regresa.

### Video 2 → Cómo configurar niveles de recompensa (2 min)
Pantallas: dashboard → sección Niveles de recompensa
Mensaje: Una tarjeta de papel te da un premio. HuellaClub te da tres.

### Video 3 → Cómo imprimir y poner tu QR (1.5 min)
Pantallas: dashboard → editor de cartel → descarga
Mensaje: Este código QR es la puerta entre tus clientes y su premio.

### Video 4 → Cómo leer tu dashboard (2 min)
Pantallas: dashboard completo sección por sección
Mensaje: Cada número en este dashboard es una persona real que tomó la decisión de regresar.

### Video 5 → Cómo canjear un premio (1.5 min)
Pantallas: visita → celebración → dashboard → marcar canjeado
Mensaje: Ese cliente que acaba de canjear su premio no se va a olvidar de ti.

---

## Copies de Anuncios Meta

### Anuncio A → El miedo ($200 MXN)
Titular: ¿Sabes cuántos clientes regresaron esta semana?
Copy: Trabajan todo el día. Abren temprano, cierran tarde. Y al final no saben si sus clientes regresan porque les gusta o porque no tienen de otra. HuellaClub te dice quién vuelve por ti. 30 días gratis. Sin tarjeta.

### Anuncio B → La solución ($200 MXN)
Titular: El programa de lealtad que sí entiende tu negocio
Copy: Tu cliente entra, escanea el QR, y acumula visitas hacia su premio. Tú ves en tiempo real quién regresa, cuándo, y cuánto le falta. Sin apps. Sin aparatos. Solo un QR impreso en tu caja.

### Anuncio C → Social proof ($100 MXN)
Titular: Vuelven por ti. Empieza hoy a saberlo.
Copy: Antes no sabía si mis clientes regresaban por costumbre o porque les gustaba. Ahora lo sé. Y eso me motiva a seguir. Don Ernesto, Tortillería El Molino, Puebla.
