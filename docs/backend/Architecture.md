# BACKEND ARCHITECTURE OVERVIEW

The FitFlow backend is a robust Node.js + Express application built with a high-fidelity, layered architecture. It follows the **Controller-Service-Repository** pattern to ensure a strict separation of concerns, scalability, and ease of maintenance.

The architecture is designed to handle multi-gym branch operations (scoping) while maintaining centralized governance and auditability.

---

## LAYERED ARCHITECTURE PATTERN

Each module (e.g., Clientes, Pagos, Productos) is structured into four distinct layers:

### 1. Routing Layer (`*.routes.js`)
**Responsibilities:**
- Definining API endpoints and HTTP methods.
- Attaching security middlewares (Auth, Gym Context, RBAC).
- Mapping requests to the appropriate Controller methods.

### 2. Controller Layer (`*.controller.js`)
**Responsibilities:**
- Interfacing with the HTTP request/response cycle.
- Extracting and validating input parameters (body, query, params).
- Orchestrating calls to the Service layer.
- Formatting and sending the final API response.
- Handling high-level operational errors.

### 3. Service Layer (`*.service.js`)
**Responsibilities:**
- Encapsulating the core **Business Logic**.
- Orchestrating complex workflows that involve multiple repositories.
- Triggering secondary operations like Audit logging or Financial ledger entries.
- Handling domain-specific validation and business rules.
- Ensuring data integrity before persistence.

### 4. Repository Layer (`*.repository.js`)
**Responsibilities:**
- Direct interaction with the Database (MySQL).
- Executing optimized SQL queries using `mysql2/promise`.
- Providing a clean abstraction over data persistence.
- Ensuring that all queries respect the `gym_id` scope for multi-tenancy.

---

## CROSS-CUTTING CONCERNS

The backend implements several specialized layers that apply to all modules:

### Middlewares
- **AuthMiddleware:** Validates JWT identity tokens and hydrates the request with user data.
- **GymMiddleware:** Enforces branch-level scoping via the `x-gym-id` header.
- **RoleMiddleware:** Implements Role-Based Access Control (RBAC) to restrict actions based on privileges.
- **AuditMiddleware:** Transparently captures operational telemetry for historical auditing.
- **ErrorMiddleware:** A centralized pipeline for catching and formatting all system exceptions.

### Utilities
- **JWT / Password:** Secure identity tokenization and cryptographic hashing.
- **Validators:** Schema enforcement using Zod to ensure payload integrity.
- **Stripe Service:** Managed integration for financial transactions and subscription lifecycle.

---

## CORE ARCHITECTURAL PRINCIPLES

- **Separation of Concerns:** Each layer has a single, well-defined responsibility.
- **Multi-Branch Isolation:** Data is strictly scoped by `gym_id` at the repository level.
- **Audit-Driven Operations:** Every destructive or financial action is recorded in the audit trail.
- **Service-Oriented Logic:** Repositories stay thin (pure SQL), while Services handle all logic.
- **International Standards:** Technical documentation and architecture follow English JSDoc standards for global maintainability.

---

## SUMMARY
This architecture transforms a simple API into a professional management engine. By isolating SQL, logic, and HTTP handling, the system remains resilient to changes, easy to debug, and prepared for enterprise-scale growth.
