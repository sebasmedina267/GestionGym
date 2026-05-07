# DATABASE ARCHITECTURE & INTEGRITY

The FitFlow persistence layer is built on **MySQL**, utilizing a normalized schema designed for high-performance retrieval and financial integrity.

---

## 1. CORE ENTITY GROUPS

The schema is divided into functional domains that correspond to the backend modules:

### Organizational Infrastructure
- **`gyms`:** Stores branch identity, branding, and location metadata.
- **`admins`:** Centralized registry for Owners, Managers, and Employees.
- **`admin_gyms`:** Junction table enabling multi-branch access for administrators.

### Member Management (CRM)
- **`clientes`:** Comprehensive member profiles, health data, and status.
- **`clases`:** Definitions for workout types and Curriculum.
- **`horarios` / `inscripciones`:** Scheduling engine and member enrollment tracking.

### Operations & Assets
- **`maquinas`:** Physical capital inventory and maintenance status.
- **`productos`:** Retail catalog and pricing.
- **`inventario_movimientos`:** Double-entry ledger for stock logistics.

### Financial Ledger
- **`pagos`:** Record of member membership fees and collection status.
- **`ingresos`:** Centralized ledger for all incoming cash flow (Retail + Memberships).
- **`gastos`:** Centralized ledger for operational outflows (Supplies, Payroll, Rent).

---

## 2. DATA INTEGRITY & SCOPING

### Multi-Branch Scoping
Every table (except global system settings) contains a mandatory `gym_id` column. This ensures that:
- Queries are naturally partitioned by branch.
- Data leaks between branches are prevented at the database level.
- Multi-tenancy is natively supported.

### Financial Atomic Integrity
The system employs **Database Transactions** for critical financial events. For example, when a product is sold:
1.  A record is created in `inventario_movimientos` (to adjust stock).
2.  A record is created in `ingresos` (to record cash flow).
Both operations must succeed, or both are rolled back, ensuring the ledger always balances.

---

## 3. AUDIT TRAIL

The `audit_logs` table stores a serialized history of system state changes:
- `admin_id`: The actor.
- `gym_id`: The context.
- `entidad` / `entidad_id`: The target resource.
- `accion`: The operation performed (CREATE, UPDATE, DELETE).
- `detalles`: A JSON payload containing the request metadata.

---

## 4. CONNECTION MANAGEMENT

Persistence is managed via the `db.js` utility using a **Connection Pool**:
- **Efficiency:** Reuses established connections to minimize latency.
- **Reliability:** Automated reconnection and heartbeat monitoring.
- **Concurrency:** Supports multiple simultaneous operations across different branches.

---

## SUMMARY
The database is more than a storage layer; it is the source of truth for the organization's physical and financial assets. The normalized structure and mandatory scoping ensure that data is secure, consistent, and audit-ready at all times.
