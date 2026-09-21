# CarePro (دكتورنا) — System Architecture, Truth Map & Guidelines

CarePro (دكتورنا) is a full-stack healthcare platform engineered for the Egyptian medical market. This document serves as the persistent system truth map, documenting real vs. fallback capabilities, security boundaries, and architectural guidelines for ongoing maintenance.

---

## 1. System Architecture & Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React icons, Motion animations.
- **Backend Service**: Express.js server running on port `3000` (`0.0.0.0`), bundled for production via `esbuild` (`dist/server.cjs`).
- **Database & Persistence**: In-memory backend database service with RESTful API proxy endpoints and fallback client-side storage for offline or degraded network conditions.

---

## 2. Capabilities Truth Map

| Feature / Domain | Implementation Status | Data Source / Pipeline | Fallback Behavior |
| :--- | :--- | :--- | :--- |
| **Doctor Search & Booking** | Verified Real Flow | Express API (`/api/doctors`, `/api/bookings`) | Client memory & localStorage fallback |
| **Live Clinic Queue Tracker** | Verified Real Flow | Express API (`/api/queue`) with polling interval | Inline error toast with retry action |
| **AI Symptom Triage** | Verified Real AI Flow | Gemini API (`@google/genai`) via server endpoint | Rule-based triage guidance |
| **Prescription OCR Scanner** | Verified Real AI Flow | Gemini Vision API via server proxy | Structured sample template fallback |
| **Medical Records & Vitals** | Verified Real Flow | Express API (`/api/vitals`, `/api/records`) | Local browser state preservation |
| **Role Authorization (RBAC)** | Verified Real Security | Express middleware (`x-role-secret` header checks) | Denies unauthorized role escalation |

---

## 3. Security & Trust Boundaries

- **Role Verification**: Requests to `/api/admin/*`, doctor queue mutations, and vital signs mutations (`GET`, `POST`, `DELETE` `/api/vitals`) require the `x-role-secret` header matching server authorization keys (`ADMIN_SECRET`, `DOCTOR_SECRET`).
- **PHI Privacy Boundary**: Patient names in live clinic queue states are automatically scrubbed to `'مريض'` for unprivileged/public viewers across both live server responses (`/api/queues/:doctorId`) and client offline fallback calculations (`apiService.getClinicQueue`).
- **Session Cleanup**: Reverting from elevated roles (`doctor`, `admin`) back to `patient` automatically clears secret keys from client memory (`sessionStorage.removeItem('carepro_role_secret')`).
- **API Key Protection**: Server-side API keys (e.g., `GEMINI_API_KEY`) are kept exclusively on the Express backend and never exposed to the browser.

---

## 4. Maintenance & Operations Guidelines

1. **Verification Requirement**: Always run `npm run lint` (`tsc --noEmit`) and `npm run build` (`vite build && esbuild server.ts`) prior to releasing changes.
2. **Non-Silent Error Handling**: UI elements MUST display user-facing alert banners or toast notifications when network operations fail, avoiding silent failures.
3. **Arabic UI Consistency**: Preserve clear, empathetic Arabic medical terminology across all patient, doctor, and admin interfaces.
