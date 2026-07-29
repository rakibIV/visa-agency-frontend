# ✈️ Visa Agency Frontend & Admin Portal

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.x-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)

A state-of-the-art, dual-interface frontend application built for visa consulting agencies. Features both a **Public Applicant Portal** for tracking status and verifying staff credentials, and an **Admin Control Panel** for managing applications, payments, money receipts, team slot allocations, logo branding variations, and email notification dispatch.

---

## 🌟 Key Features

### 🏛️ Public Applicant Portal
* **Live Status Tracking**: Instant status lookup using Application ID and Email verification.
* **Verified Personnel Credentials**: Public staff profile modal complete with official QR Code validation, monthly/yearly ranks, and performance badges.
* **Visa & Country Catalog**: Comprehensive visa requirement checklists, country details, and processing timelines.
* **Interactive Fee & Refund Estimation**: Transparent breakdowns of application fees and signed agreement refund policies.
* **Consultation Request Modal**: Direct lead capture for prospective applicants.

### 🛡️ Admin Management Dashboard
* **Applicant Lifecycle Management**: Track applicants from initial document submission through visa approval, passport handover, or refund processing.
* **Reversible Currency Exchange Engine**: Dual-input payment model (Base Amount + Euro Amount) with real-time exchange rate calculation ($1\text{ EUR} = X\text{ Base Currency}$).
* **Printable Money Receipts & Refund Statements**: Instant browser print views formatted with company letterhead signatures and legal clauses.
* **Team & Staff Allocations**: Manage representatives, monthly slot allocations, sub-staff distributions, and performance ranks.
* **Generous Email Template Designer**: Custom email notification builder with brand logo variation selectors (Top Left & Top Center logos) and live responsive preview.
* **Brand Assets & Logo Variations**: Manage primary company logos, favicon, signature seals, and custom logo variations ordered by serial numbers.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | Frontend UI Framework |
| **Vite 6** | High-performance build tool & dev server |
| **Tailwind CSS 3.4** | Utility-first styling with modern glassmorphism & gradients |
| **TanStack Query (React Query v5)** | Server state management, caching, and optimistic mutations |
| **Framer Motion** | Micro-interactions and fluid animations |
| **Heroicons v2** | Crisp UI iconography |
| **Axios** | HTTP client with automatic API interceptors |

---

## 📁 Repository Structure

```
Visa Aagency Frontend/
├── admin/                      # Admin Management Control Center
│   ├── src/
│   │   ├── api/                # Axios API client & interceptors
│   │   ├── components/         # Shared UI components, layout, modals, tables
│   │   ├── pages/              # Admin pages (Applicants, Staff, Config, Settings)
│   │   ├── App.jsx             # React Router routing configuration
│   │   └── main.jsx            # React root & QueryClient provider
│   ├── package.json
│   └── vite.config.js
│
└── public/                     # Public Client Facing Portal
    ├── src/
    │   ├── api/                # Public API client
    │   ├── components/         # Public components (Modals, Headers, Cards)
    │   ├── pages/              # Public pages (Status Check, Visa Catalog, Updates)
    │   ├── App.jsx             # Client router & navigation
    │   └── main.jsx            # Entry point
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
* **Node.js**: `v18.x` or higher
* **npm**: `v9.x` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rakibIV/visa-agency-frontend.git
   cd visa-agency-frontend
   ```

2. **Setup Admin Workspace**:
   ```bash
   cd admin
   npm install
   ```

3. **Setup Public Workspace**:
   ```bash
   cd ../public
   npm install
   ```

### Running Local Development Servers

* **Admin Portal** (Runs on `http://localhost:5173`):
  ```bash
  cd admin
  npm run dev
  ```

* **Public Portal** (Runs on `http://localhost:5174`):
  ```bash
  cd public
  npm run dev
  ```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
