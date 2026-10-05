FitFlow Admin Management (MVP)

FitFlow is a comprehensive Management Information System (MIS) designed to streamline gym operations and provide administration teams with actionable data-driven insights. 

PROJECT OVERVIEW
FitFlow focuses on optimizing administrative tasks and strategic decision-making through several core modules:

- Customer Insights & Analytics: Detailed tracking of class attendance and member demographics. It calculates key metrics such as age range distribution and gender ratios per class, enabling staff to tailor marketing and operational strategies.
- Asset & Equipment Management: Real-time inventory of gym machinery, including operational status (maintenance tracking) and facility location.
- Financial Log (Internal): A dedicated module for manual payment tracking and financial records (currently internal logging, not third-party processed).
- Inventory & Stock Control: Manages gym supplements and merchandise (e.g Creatine). It tracks "buy/sell" actions to monitor stock levels, costs of replenishment, and revenue generated from on-site sales.
- Financial Suite & Monthly Balance: A robust economic module that tracks monthly revenue vs expenses. It automatically calculates the net balance, providing administration with a clear view of the gym's financial health and profitability at any given time.
- Class & Staff Coordination: Centralized control of schedules, pricing, instructors, and user enrollment per session.

Note: FitFlow is in active development. The web application includes member registration, gym discovery, class booking, profile management, and payment history. Attendance check-in, digital access cards, and a dedicated mobile app remain planned work.

## Production deployment

Docker Compose requires `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`; `DB_PORT` defaults to `3306`. Set these values in an untracked root `.env` file or in the deployment platform's secret manager. Use a `JWT_SECRET` with at least 32 characters and terminate HTTPS at the production reverse proxy. The backend health endpoint at `/health` also checks database connectivity.

## Tests

Run backend tests with `cd backend && npm test` and frontend component tests with `cd frontend && npm test`.
