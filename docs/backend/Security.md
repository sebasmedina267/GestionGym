# SECURITY & ACCESS CONTROL (RBAC)

FitFlow implements a multi-layered security model designed to protect organizational data while providing a seamless administrative experience. The system combines **Identity Management (JWT)** with **Contextual Scoping (Gym ID)** and **Functional Authorization (RBAC)**.

---

## 1. IDENTITY & AUTHENTICATION (JWT)

Authentication is handled via **JSON Web Tokens (JWT)**.
- **Issuance:** Tokens are generated upon successful login (`auth.service.js`) and signed with a unique system secret.
- **Persistence:** Tokens have an 8-hour expiration period.
- **Verification:** The `authMiddleware` intercepts all protected requests, validates the signature, and hydrates `req.admin` with the user's identity and roles.

---

## 2. CONTEXTUAL SCOPING (GYM CONTEXT)

To support multiple gym branches, the system enforces strict data isolation:
- **Identification:** Clients must send the `x-gym-id` header in every administrative request.
- **Validation:** The `gymMiddleware` verifies that the authenticated administrator has access to the requested gym.
- **Enforcement:** The validated `gym_id` is injected into `req.gym` and used as a mandatory filter in all Repository queries.

---

## 3. ROLE-BASED ACCESS CONTROL (RBAC)

Authorization is determined by a hierarchical role system managed in `rolePermissions.js`.

### Administrative Roles
1.  **DUENO (Owner):** Root-level authority. Can manage branch infrastructure, delete historical records, and oversee financial health across the entire organization.
2.  **GERENTE (Manager):** Mid-level authority. Authorized for staff supervision, advanced member management, and financial reporting for their specific branch.
3.  **EMPLEADO (Staff):** Operational authority. Focused on daily tasks: check-ins, retail sales, and class enrollment. Restricted from destructive or strategic organizational changes.

### Enforcement Mechanism
Functional security is enforced at two levels:
- **Middleware Level:** `requireRole` prevents unauthorized access to entire route groups.
- **Service Level:** `validatePermission` performs fine-grained checks before executing specific business logic (e.g., "Can this user delete a client?").

---

## 4. AUDIT & TELEMETRY

Security is supplemented by a transparent audit system:
- **Automated Logging:** The `auditMiddleware` captures the *Actor*, *Action*, *Entity*, and *Timestamp* for every state-changing request.
- **Non-Repudiation:** Audit logs are persisted in a specialized ledger that cannot be modified by standard administrative operations.
- **Operational Transparency:** High-privilege users can review audit trails to monitor system integrity.

---

## 5. DATA PROTECTION

- **Password Hashing:** All credentials are encrypted using **bcrypt** with a cost factor of 10. Plain-text passwords are never persisted.
- **Input Sanitization:** Every request is validated against **Zod Schemas** before reaching the service layer to prevent injection and malformed data.
- **Webhook Security:** Stripe webhooks are validated using raw-body HMAC signatures to ensure payment events originate exclusively from Stripe.

---

## SUMMARY
The security architecture is designed to be "invisible yet ironclad." By combining identity, context, and permissions, FitFlow ensures that every operation is authorized, scoped correctly, and fully auditable.
