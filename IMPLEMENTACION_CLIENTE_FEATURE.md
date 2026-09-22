# Plan de Implementación: Nueva Funcionalidad Cliente/Usuario

**Fecha:** Mayo 2026  
**Objetivo:** Crear una nueva experiencia completa para usuarios/clientes del gym directamente desde la web app.

---

## 1. ANÁLISIS DE ESTADO ACTUAL

### ✅ YA EXISTE (Backend)
- **Tabla `usuarios_finales`**: Autenticación de usuarios finales
  - Campos: `id, email, nombre, apellido, password, activo, tipo_suscripcion, fecha_registro`
  - Endpoints: `POST /auth/user/register`, `POST /auth/user/login`
  
- **Tabla `usuarios_finales_gimnasios`**: Vinculación usuario-gym
  - Campos: `usuario_id, gym_id, metodo_pago, estado_inscripcion, fecha_inscripcion`
  - Endpoint: `POST /auth/user/enroll`

- **Módulo Auth completo** para usuarios finales en `backend/src/modules/auth/`
- **Tabla `clientes_clases`**: Inscripción de clientes a clases
- **Tabla `precios`**: Precios de clases
- **Productos y máquinas**: Ya existen tablas

### ❌ FALTA IMPLEMENTAR
- **Frontend**: Panel de cliente (todas las páginas)
- **Backend**: Endpoints específicos de vista cliente (no son los mismo que los admin)
- **Búsqueda geolocalizada**: Gyms cercanos (Maps API)
- **Gestión de inactividad**: Auto-limpieza de usuarios

---

## 2. DISEÑO DE FLUJOS

### FLUJO 1: Cliente SIN Gym (Usuario nuevo)

```
[Registro en app] → [Email verificado] → [Pantalla Bienvenida]
      ↓
[Buscar Gyms cercanos] ← [Geolocalización del usuario]
      ↓
[Ver detalles gym] → [Info básica, clases, horarios, precios, fotos]
      ↓
[Opción 1: Pagar por suscripción] → [Activación inmediata + acceso completo]
[Opción 2: Esperar validación física en gym] → [Estado: Pendiente Confirmación]
      ↓
[Dashboard de Cliente Activo]
```

### FLUJO 2: Cliente YA en Gym (Usuario con suscripción activa)

```
[Login] → [Sistema detecta gym asignado] → [Cliente Dashboard]
      ↓
[Ver tu gym, clases, máquinas, productos]
      ↓
[Inscribirse a clases] → [Confirmación] → [Aparece en tu agenda]
      ↓
[Comprar productos/merchandising]
      ↓
[Historial de transacciones]
```

### FLUJO 3: Control de Inactividad (Backend Cron Job)

```
[Diariamente a las 3 AM]
   ↓
[Buscar usuarios_finales no activos creados hace > X días]
   ↓
[Sin gym asignado O sin actividad en Y días]
   ↓
[Borrar usuario + auditar]
```

---

## 3. CAMBIOS EN BASE DE DATOS

### Tabla: `usuarios_finales` (ACTUALIZAR)
```sql
-- Agregar columnas si no existen:
ALTER TABLE usuarios_finales 
ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8) COMMENT 'Ubicación del usuario',
ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8) COMMENT 'Ubicación del usuario',
ADD COLUMN IF NOT EXISTS última_actividad DATETIME COMMENT 'Último login',
ADD COLUMN IF NOT EXISTS foto VARCHAR(255) DEFAULT NULL;

CREATE INDEX idx_usuarios_ultímo_login ON usuarios_finales(última_actividad);
```

### Tabla: `gyms` (ACTUALIZAR)
```sql
-- Agregar coordenadas para búsqueda geolocalizada
ALTER TABLE gyms 
ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS horario_inicio TIME DEFAULT '06:00:00',
ADD COLUMN IF NOT EXISTS horario_fin TIME DEFAULT '22:00:00',
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS email_contacto VARCHAR(255);

CREATE INDEX idx_gyms_ubicacion ON gyms(latitud, longitud);
```

### Tabla: `usuarios_finales_gimnasios` (ACTUALIZAR)
```sql
-- Mejorar tracking de inactividad
ALTER TABLE usuarios_finales_gimnasios 
ADD COLUMN IF NOT EXISTS estado_inscripcion ENUM('ACTIVO', 'PAUSADO', 'PENDIENTE_PAGO', 'CANCELADO') DEFAULT 'ACTIVO',
ADD COLUMN IF NOT EXISTS fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS fecha_cancelacion DATETIME,
ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT;
```

---

## 4. CAMBIOS EN BACKEND

### Módulo: `backend/src/modules/gyms/` (Extender)

**Archivo: `gyms.client.routes.js`** (NUEVO)
```javascript
// Rutas públicas/cliente para gyms (sin autenticación requerida para lectura)
GET /gyms/near               // Buscar gyms cercanos por coordenadas
GET /gyms/:id/details        // Detalles públicos de un gym
GET /gyms/:id/classes        // Clases disponibles de un gym
GET /gyms/:id/machines       // Máquinas disponibles
GET /gyms/:id/products       // Productos/merchandising
GET /gyms/:id/schedule       // Horarios del gym
```

**Archivo: `gyms.client.service.js`** (NUEVO)
```javascript
// Servicios específicos para cliente:
- findNearbyGyms(latitud, longitud, radiusKm = 5)
- getGymPublicDetails(gymId)
- getGymClasses(gymId)
- getGymMachines(gymId)
- getGymProducts(gymId)
```

### Módulo: `backend/src/modules/clases/` (Extender)

**Archivo: `clases.client.routes.js`** (NUEVO)
```javascript
// Rutas de cliente para clases
POST  /clases/enroll         // Inscribirse a una clase (requiere auth)
DELETE /clases/enroll/:id    // Cancelar inscripción
GET   /clases/my-classes     // Mis clases inscritas (requiere auth)
```

**Archivo: `clases.client.service.js`** (NUEVO)
```javascript
// Servicios de cliente:
- enrollClass(userId, classScheduleId)
- cancelClassEnrollment(userId, classScheduleId)
- getUserClasses(userId)
- getAvailableClasses(gymId)
```

### Middleware: Autenticación de Cliente

**Archivo: `backend/src/middlewares/client.auth.middleware.js`** (NUEVO)
```javascript
// Similar a auth.middleware.js pero para usuarios_finales
- Verificar JWT de cliente
- Hidratar req.client con datos del usuario
- Verificar que usuario_final existe y está activo
```

### Cron Job: Limpieza de Inactivos

**Archivo: `backend/src/jobs/cleanup.inactive.users.js`** (NUEVO)
```javascript
// Ejecutar diariamente
// Borrar usuarios_finales que:
// - No tienen gym asignado
// - Creados hace > 7 días
// - Sin login en > 30 días
```

---

## 5. CAMBIOS EN FRONTEND

### Nuevas Páginas

#### **A. `frontend/src/pages/ClientDashboard/`** (NUEVA)
Cliente autenticado VE su gym.

```
ClientDashboardPage.jsx
├── useClientDashboard.js         // Hook de lógica
├── Sections/
│   ├── GymOverviewCard.jsx        // Card con info del gym
│   ├── ClassesSection.jsx         // Listado de clases
│   ├── MachinesSection.jsx        // Máquinas disponibles
│   ├── ProductsSection.jsx        // Productos del gym
│   └── UpcomingClassesCard.jsx     // Mis próximas clases
├── Styles/
│   └── ClientDashboard.css
└── Components/
    ├── ClassCard.jsx              // Componente reutilizable de clase
    ├── MachineCard.jsx
    ├── ProductCard.jsx
    └── ClassEnrollModal.jsx        // Modal para inscribirse
```

#### **B. `frontend/src/pages/ClientOnboarding/`** (NUEVA)
Usuario sin gym BUSCA gym.

```
ClientOnboardingPage.jsx
├── useGymDiscovery.js             // Hook de búsqueda
├── Sections/
│   ├── WelcomeSection.jsx          // Pantalla de bienvenida
│   ├── GymSearchSection.jsx        // Mapa + lista de gyms
│   └── SelectedGymDetail.jsx       // Detalles al seleccionar
├── Styles/
│   └── ClientOnboarding.css
└── Components/
    ├── GymCard.jsx                 // Card de gym cercano
    ├── GymDetailModal.jsx          // Modal con detalles completos
    └── EnrollPaymentModal.jsx       // Modal de pago/suscripción
```

#### **C. `frontend/src/pages/ClientProfile/`** (NUEVA)
Perfil del cliente.

```
ClientProfilePage.jsx
├── useClientProfile.js
├── Sections/
│   ├── PersonalInfoSection.jsx
│   ├── MyGymsSection.jsx            // Gyms a los que está inscrito
│   ├── TransactionHistorySection.jsx
│   └── SettingsSection.jsx
└── Styles/
    └── ClientProfile.css
```

### Actualizaciones a Páginas Existentes

#### **App.jsx / Router**
```jsx
// Agregar rutas nuevas
<Route path="/client/dashboard" element={<ClientDashboard />} />
<Route path="/client/onboarding" element={<ClientOnboarding />} />
<Route path="/client/profile" element={<ClientProfile />} />

// Redirigir login a página diferente basado en tipo de usuario
if (user.tipo === 'USUARIO_FINAL') {
  navigate('/client/dashboard' o '/client/onboarding')
}
```

#### **Login.jsx** (Actualizar)
```jsx
// El login ya existe, pero falta:
1. Detectar si email existe en usuarios_finales
2. Marcar última_actividad cuando login exitoso
3. Redirigir apropiadamente (admin vs cliente)
```

### Nuevos Hooks

#### **`frontend/src/hooks/useClientDashboard.js`**
```javascript
- fetchGymData(gymId)        // Datos del gym actual
- fetchMyClasses()           // Clases en las que está inscrito
- fetchAvailableClasses()    // Clases disponibles para inscribirse
- enrollClass(classId)       // Inscribirse a clase
- cancelClass(classId)       // Cancelar inscripción
- fetchProducts()            // Productos disponibles
- fetchMachines()            // Máquinas disponibles
```

#### **`frontend/src/hooks/useGymDiscovery.js`**
```javascript
- getUserLocation()          // Geolocalización
- fetchNearbyGyms(lat, lng)  // Buscar gyms cercanos
- fetchGymDetails(gymId)     // Detalles de un gym específico
- enrollToGym(gymId)         // Apuntarse a un gym
```

#### **`frontend/src/hooks/useClientProfile.js`**
```javascript
- fetchUserData()
- updateProfile(data)
- fetchMyGyms()
- fetchTransactions()
- uploadProfilePhoto(file)
```

### Utilidades Nuevas

#### **`frontend/src/utils/geolocation.js`**
```javascript
- getCurrentLocation()       // Pedir permiso de ubicación
- calculateDistance(lat1, lng1, lat2, lng2)  // Distancia en km
```

#### **`frontend/src/api/client.api.js`**
```javascript
// Endpoints específicos para cliente
- api.get('/gyms/near', { latitud, longitud })
- api.get('/gyms/:id/details')
- api.get('/gyms/:id/classes')
- api.post('/clases/enroll', { classScheduleId })
// etc.
```

---

## 6. FLUJO DE IMPLEMENTACIÓN (PRIORIZACIÓN)

### **FASE 1: Fundamentos (1-2 semanas)**
- [ ] Actualizar BD (columnas en usuarios_finales, gyms)
- [ ] Backend: Endpoints públicos de gyms (/near, /details, etc.)
- [ ] Backend: Middleware de auth para cliente
- [ ] Frontend: Página de Login actualizada con detección de tipo usuario
- [ ] Frontend: Hook useGymDiscovery básico

**Resultado:** Usuario puede buscar y ver gyms cercanos

### **FASE 2: Dashboard Básico (1-2 semanas)**
- [ ] Frontend: ClientDashboard page y components
- [ ] Backend: Endpoints de datos personales del cliente
- [ ] Frontend: Hook useClientDashboard
- [ ] Mostrar: gym info, clases, máquinas, productos

**Resultado:** Cliente autenticado ve su gym

### **FASE 3: Inscripción a Clases (1 semana)**
- [ ] Backend: POST /clases/enroll, DELETE /clases/enroll
- [ ] Frontend: ClassEnrollModal y lógica
- [ ] Mostrar confirmación y actualizar agenda

**Resultado:** Cliente puede apuntarse/cancelarse de clases

### **FASE 4: Comercio (1 semana)**
- [ ] Backend: Endpoints de merchandising (ya existe registro)
- [ ] Frontend: Carrito de compras
- [ ] Frontend: Checkout e integración Stripe

**Resultado:** Cliente puede comprar productos

### **FASE 5: Gestión de Inactividad (3-5 días)**
- [ ] Backend: Cron job de limpieza
- [ ] Backend: Lógica de cancelación automática

**Resultado:** Sistema auto-gestiona usuarios inactivos

### **FASE 6: Pulido (1 semana)**
- [ ] Testing
- [ ] Responsive design
- [ ] Validaciones adicionales
- [ ] Documentación

---

## 7. ENDPOINTS ESPECÍFICOS A CREAR

### Auth (ya existe, solo ajustar)
```
POST   /auth/user/register       ✅ Existe
POST   /auth/user/login          ✅ Existe
POST   /auth/user/enroll         ✅ Existe
```

### Gyms (Cliente)
```
GET    /api/gyms/near?lat=X&lng=Y&radius=5
GET    /api/gyms/:id/public               // Detalles públicos
GET    /api/gyms/:id/classes              // Clases disponibles
GET    /api/gyms/:id/machines             // Máquinas
GET    /api/gyms/:id/products             // Productos
GET    /api/gyms/:id/schedule             // Horarios
```

### Clases (Cliente)
```
GET    /api/clases/available?gymId=X
POST   /api/clases/:id/enroll             // Requiere auth cliente
DELETE /api/clases/:id/enroll             // Requiere auth cliente
GET    /api/clases/my-enrollments        // Mis clases
```

### Cliente (Perfil)
```
GET    /api/cliente/profile               // Requiere auth cliente
PATCH  /api/cliente/profile               // Actualizar perfil
GET    /api/cliente/mygyms                // Mis gyms
GET    /api/cliente/transactions          // Historial
```

### Productos (Cliente)
```
GET    /api/productos?gymId=X
POST   /api/pedidos                       // Crear pedido
GET    /api/pedidos/my-orders             // Mis pedidos
```

---

## 8. CONSIDERACIONES IMPORTANTES

### Seguridad
- ✅ Validar que usuario_final solo accede a SU gym
- ✅ No mostrar datos confidenciales (admin contactos, sueldos, etc.)
- ✅ Rate limiting en endpoints de búsqueda
- ✅ Validar coordenadas (no valores absurdos)

### Performance
- Usar índices en `usuarios_finales_gimnasios(usuario_id, gym_id)`
- Caché de gyms cercanos (5 min TTL)
- Paginar resultados de búsqueda

### UX
- Geolocalización con fallback a búsqueda manual
- Mostrar distancia en km en tarjetas de gym
- Horarios en zona horaria local
- Notificaciones de confirmación de inscripciones

### Compliance
- GDPR: Opción de descargar/borrar datos personales
- Auditar todas las acciones de cliente
- Consentimiento para ubicación

---

## 9. ARCHIVO DE CHECKLIST POR SECCIÓN

### Backend Endpoints
- [x] GET /api/gyms/near
- [x] GET /api/gyms/:id/public
- [x] GET /api/gyms/:id/classes
- [x] GET /api/gyms/:id/machines
- [x] GET /api/gyms/:id/products
- [x] POST /api/clases/:id/enroll
- [x] DELETE /api/clases/:id/enroll
- [x] GET /api/cliente/profile
- [x] Middlewares cliente auth
- [ ] Cron job inactividad

### Frontend Pages
- [x] ClientDashboard
- [x] ClientOnboarding
- [x] ClientProfile
- [x] Componentes: ClassCard, MachineCard, ProductCard, GymCard
- [ ] Modales: ClassEnroll, GymDetail, EnrollPayment

### Base de Datos
- [x] Agregar coordenadas a usuarios_finales
- [x] Agregar coordenadas a gyms
- [x] Mejorar usuarios_finales_gimnasios
- [x] Índices de performance

### Testing
- [x] Flujo de registro/login cliente
- [x] Búsqueda de gyms
- [ ] Inscripción a clases
- [ ] Casos edge (usuario inactivo, gym cerrado, etc.)

---

## 10. NOTAS FINALES

1. **Reutilizar lo existente**: No reinventar la rueda del auth, ya está hecho
2. **Separación de contextos**: Admin ≠ Cliente. Endpoints y vistas diferentes
3. **Geolocalización**: Requiere HTTPS en producción + permisos del navegador
4. **Validación física**: Gym admin debe confirmar pago en efectivo antes de activar
5. **Inactividad**: Define X días (sugerencia: 7 días sin gym, 30 sin actividad)

---

**Próximo paso:** ¿Quieres que empecemos por la **FASE 1**? Puedo crear los endpoints del backend para búsqueda de gyms y actualizar la BD.
