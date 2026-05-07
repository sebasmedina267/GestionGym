# DEVELOPMENT WORKFLOW: ADDING A NEW FEATURE

This document serves as a guide for developers to implement new features consistently across the FitFlow ecosystem.

---

## 1. DEFINE THE DOMAIN
Identify which business area the feature belongs to (e.g., "Marketing", "Nutrition", "Support"). 
If it's a new domain, create a new folder in `frontend/src/pages` and `backend/src/modules`.

---

## 2. BACKEND IMPLEMENTATION (Layer by Layer)

1.  **Repository:** Write the raw SQL queries in `*.repository.js`. Ensure you include `gym_id` in the `WHERE` clause.
2.  **Service:** Write the business logic in `*.service.js`. This is where you calculate values, trigger audit logs, or perform validations.
3.  **Controller:** Implement the request handler in `*.controller.js`. Extract params and send the JSON response.
4.  **Routes:** Register the route in `*.routes.js` and attach the necessary security middlewares (`authMiddleware`, `gymMiddleware`, `auditMiddleware`).
5.  **App Integration:** Import and use the new router in `backend/src/app.js`.

---

## 3. FRONTEND IMPLEMENTATION

1.  **Service/Hook:** Create a custom hook `use[Feature].js` to handle data fetching from your new API endpoint.
2.  **UI Components:** Build small, pure components for the feature's visual elements.
3.  **Page:** Orchestrate everything in `[Feature]Page.jsx`.
4.  **Styles:** Create a specific CSS file in a `Styles` subfolder.
5.  **Navigation:** Add the new route to the main App routing structure.

---

## 4. DOCUMENTATION STANDARDS

- **Backend:** Every function must have an English JSDoc header describing its purpose, parameters, and return value.
- **UI:** Components should be commented to explain their role in the "Kinetic" design system.
- **Commit Messages:** Use descriptive, professional commit messages in English.

---

## 5. TESTING & VERIFICATION

- **RBAC Check:** Test the feature with different user roles (Owner, Employee) to ensure permissions are enforced correctly.
- **Audit Check:** Verify that the action appears in the `audit_logs` table (if it's a state change).
- **Responsiveness:** Test the UI on both desktop and high-density mobile displays.

---

## SUMMARY
Following this structured workflow ensures that the codebase remains clean, predictable, and maintainable as the project grows from a single-gym tool to a multi-branch management platform.
