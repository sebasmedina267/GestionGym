# ARCHITECTURAL DECISIONS & RATIONALE

This document outlines the strategic technical choices made during the development of FitFlow and the reasoning behind them.

---

## 1. WHY THE LAYERED ARCHITECTURE (CONTROLLER-SERVICE-REPOSITORY)?

**The Problem:** In many Node.js projects, logic is scattered between routes and database queries, making testing difficult and leading to "God Objects."

**The Solution:** A strict 3-layer separation.
- **Why Repository?** Centralizes SQL logic. If we ever switch from MySQL to PostgreSQL or an ORM, we only change this layer. It also ensures the `gym_id` scope is enforced in a single place.
- **Why Service?** Business logic shouldn't care about HTTP status codes. Services handle "what happens" (e.g., "when a payment is made, log an income"), while controllers handle "how it's communicated."
- **Benefit:** Testability. We can unit test business logic in Services without needing to mock an entire Express request.

---

## 2. WHY VANILLA CSS + KINETIC DESIGN SYSTEM?

**The Problem:** Modern CSS frameworks (like Tailwind) are great for speed but can lead to "copy-paste" designs and bloated HTML.

**The Solution:** A custom design system built with CSS Variables and specialized utility classes.
- **Why?** It allowed us to create the "Kinetic" aesthetic—a high-density, dark-mode-first UI that feels like a professional management engine, not a generic website.
- **The Result:** Total control over micro-animations, glassmorphism effects, and responsiveness without the constraints of a third-party framework.

---

## 3. WHY CUSTOM RBAC OVER AN EXTERNAL LIBRARY?

**The Problem:** Libraries like Passport or CASL are powerful but often introduce complexity that doesn't align with the specific "Gym Owner vs. Staff" hierarchy of this project.

**The Solution:** A centralized `rolePermissions.js` registry.
- **Why?** It's human-readable. Any developer can look at the registry and instantly understand what an 'EMPLEADO' can or cannot do.
- **Flexibility:** Adding a new role (like "Regional Manager") takes seconds and doesn't require learning a new DSL.

---

## 4. WHY STRIPE FOR THE ONBOARDING FLOW?

**The Problem:** Managing credit card data directly is a massive security and compliance (PCI) risk.

**The Solution:** Stripe Elements + Webhooks.
- **The Choice:** We chose to redirect Owners to a secure Stripe portal for their first payment.
- **Why?** This ensures that FitFlow never "touches" sensitive card data. Activation only occurs via a secure webhook or verified payment intent, making the onboarding process ironclad.

---

## 5. WHY AUTOMATED AUDIT TELEMETRY?

**The Problem:** In gym management, "Who changed this member's plan?" or "Who deleted this product?" are critical questions for Owners.

**The Solution:** A transparent `auditMiddleware`.
- **Why?** Developers don't have to remember to log actions. The system "listens" to the API traffic and automatically records the actor and the action.
- **Business Value:** It provides a level of accountability that separates "hobbyist" software from "enterprise-grade" management tools.

---

## 6. WHY USEFETCH & CUSTOM HOOKS IN THE FRONTEND?

**The Problem:** Standard `useEffect` data fetching leads to repetitive boilerplate and race conditions.

**The Solution:** A unified `useFetch` hook and Domain Hooks (e.g., `useEconomia`).
- **Why?** Domain hooks act as the "Service Layer" for the frontend. They encapsulate all the data preparation, loading states, and API calls for a specific page.
- **Benefit:** The UI components (`*.jsx`) stay clean and focused only on rendering.

---

## SUMMARY
Every decision in FitFlow was made with one goal: **Scalable Professionalism.** We prioritized long-term maintainability over "quick and dirty" solutions, resulting in a system that is as robust as it is beautiful.
