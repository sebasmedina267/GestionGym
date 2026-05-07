# FINANCIAL INTEGRITY & INTEGRATION

FitFlow manages the fiscal health of multiple organizations. To ensure absolute accuracy, we implement a **Double-Entry Reconciliation** system across the backend.

---

## 1. THE ECONOMY LEDGER (`ingresos` & `gastos`)

Instead of just storing the "current balance," FitFlow records every single movement of money.

### The Source of Truth
There are two primary tables that act as the financial ledger:
- **`ingresos`:** Captures membership fees, retail sales, and manual investments.
- **`gastos`:** Captures payroll, stock purchases, rent, and miscellaneous costs.

### Why this approach?
- **Auditing:** We can reconstruct the financial history of any month in the past.
- **Reporting:** It allows the frontend to generate complex charts (Income Sources vs. Expense Categories).
- **Error Detection:** If the sum of movements doesn't match the reported totals, we know exactly where the discrepancy occurred.

---

## 2. ATOMIC TRANSACTIONAL SYNC

Financial records are rarely created in isolation. The system uses **Database Transactions** to ensure consistency.

**Example: Selling a Protein Shake**
1.  **Repository 1 (`productos`):** Decrements the stock count by 1.
2.  **Repository 2 (`inventario_movimientos`):** Records a "VENTA" event.
3.  **Repository 3 (`ingresos`):** Records a new income entry with the total price.

**Outcome:** If any of these steps fail (e.g., the database disconnects halfway through), the entire operation is rolled back. The stock isn't decremented, and the income isn't recorded improperly.

---

## 3. STRIPE INTEGRATION WORKFLOW

Stripe is used for high-security transactions (Subscriptions and Branch Expansion).

### Secure Activation Flow
1.  **Intent Creation:** The backend creates a `PaymentIntent` and returns a client secret.
2.  **PCI-Compliance:** The frontend uses Stripe Elements to collect payment safely.
3.  **Webhook Validation:** When the payment succeeds, Stripe sends an asynchronous event to our `/api/stripe/webhook` endpoint.
4.  **Signature Verification:** Our backend verifies the raw body HMAC signature to ensure the message is authentic.
5.  **Final Action:** Only after verification does the backend activate the account or create the new branch.

---

## 4. REPORTING & PDF EXPORT

Financial reports use the `pdfUtils.js` utility to transform ledger data into audited PDF documents.
- **High Fidelity:** The reports include gym branding and high-resolution formatting.
- **Audited Data:** Every report includes a breakdown of all movements recorded in the ledger for that specific period.

---

## SUMMARY
By combining atomic transactions with an immutable ledger and secure payment gateways, FitFlow provides a professional-grade financial engine that Owners can trust with their business operations.
