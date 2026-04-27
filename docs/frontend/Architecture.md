FRONTEND ARCHITECTURE OVERVIEW
The frontend is build with React + Vite, following a modular, scalable, domain-oriented architecture.
Each system page is composed of:
- A main componet (*Page.jsx).
- A set of UI components specific to that view.
- A business-logic hook (use*.js).
- Associated utilities (*.js).
This pattern clearly separates UI, state, logic and services, making the project easier to mantain and evolve.

PAGE-LEVEL ARCHITECTURE PATTERN
Every page follows a clean and professional structure:

1. Main Page Component(*Page.jsx)
Responsabilities:
- Orchestrates the entire view.
- Connects to the business-logic hook.
- Renders sections and UI components. 
- Handle high-level events (open modal, refresh data, update records...).

2. UI Components
Each page contains its own specialized UI components:
- Visual sections (charts, summaries, tables).
- Modal forms.
- Data containers and layout components.
These components are pure UI, with no business logic inside.

3. Business Logic Hook(use*.js)
This is where the real logic of the page lives:
- Data fetching.
- Calculations and transformations.
- State management (loading, error, modal visibility...).
- CRUD actions.
- Data preparation for charts, tables, and summaries.
The hook acts as the domain layer of the page.

4. Page-Specific Utilities
Small helper functions that do not belong to the UI or the hook, such as:
- Formatters
- Mappers
- Validators
- Calculation helpers

CORE PRINCIPLES APPLIED 
- Separation of concerns: UI, logic, state and services are clearly isolated.
- Domain-Driven Frontend: Each folder inside pages/ represents a functional business domain.
- Decoupled components: UI components do not depend on backend logic or complex state.
- Hooks as the business layer: Each page has a dedicated hook that encapsulates all logic.
- Scalability: Adding new pages or features is simple and does not break existing code.

SUMMARY
This architecture  is designed for speed, clarity and maintainbility. You end up with more files but smaller, cleaner and easier to understand with bugs isolated to specific domains instead across the app.
