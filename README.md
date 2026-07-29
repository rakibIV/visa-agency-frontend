# ✈️ Visa Agency Web Portal & Admin Management System

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.x-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)

An enterprise-grade, dual-workspace web application designed for visa agency operations. It features both a public-facing **Applicant Portal** for live status tracking and verified staff credential validation, and an **Admin Control Panel** for handling applicant lifecycles, currency conversion, printable money receipts, team slot allocations, logo brand variations, and custom email notifications.

---

## 💡 System Architecture Overview

```
                      +---------------------------------------+
                      |         Visa Agency Frontend          |
                      +-------------------+-------------------+
                                          |
                 +------------------------+------------------------+
                 |                                                 |
   +-------------v-------------+                     +-------------v-------------+
   |   Public Client Portal    |                     |   Admin Control Panel     |
   | (http://localhost:5174)   |                     | (http://localhost:5173)   |
   +-------------+-------------+                     +-------------+-------------+
                 |                                                 |
                 | - Applicant Status Tracking                     | - Applicant Lifecycle Management
                 | - Verified Personnel Credentials                | - Currency & Payment Calculations
                 | - Official QR Code Validation                   | - Money Receipts & Refund Statements
                 | - Country & Visa Catalog                        | - Staff Allocations & Ranking
                 | - Consultation Requests                         | - Generous Email Templates
                 +------------------------+------------------------+
                                          |
                                 +--------v--------+
                                 |  Backend REST   |
                                 |   Django API    |
                                 +-----------------+
```

---

## 💱 Deep Dive: Automatic & Reversible Currency Exchange Rate Engine

The frontend includes an interactive **Automatic & Reversible Exchange Rate Engine** inside the payment creation modal:

### 1. Dual-Input Calculation Model
* **Base Amount Input**: Admin enters the payment amount in the local transaction currency (e.g. `140,000 BDT`, `1,200 USD`, `950 GBP`).
* **Euro Amount (€) Input**: Admin enters the target Euro equivalent (e.g. `€1,000`).
* **Real-time Automatic Rate Calculation**: The system automatically computes and displays the exact exchange rate ratio in real-time as the admin types:
  $$\text{Calculated Rate} = \frac{\text{Base Currency Amount}}{\text{Euro Amount}}$$
  * *Example*: `140,000 BDT` $\div$ `€1,000` $\rightarrow$ **`1 EUR = 140.0000 BDT`**

### 2. High-Precision & Decimal Control
* To comply with strict backend validation constraints ($\le 8$ decimal places), the engine automatically formats floating-point exchange rates to **4 decimal places** (`.toFixed(4)`), preventing precision errors on arbitrary division results.
* For payments conducted directly in **EUR**, the system automatically sets $1\text{ EUR} = 1\text{ EUR}$ and synchronizes amounts seamlessly.

---

## 📧 Generous Email Templates & Brand Logo Variations

The application features a specialized **Generous Email Templates** module built alongside standard status notification templates:

### Key Highlights:
* **Brand Logo Variations Picker**: Admin can dynamically select up to two optional header images from the agency's stored brand logo variations (e.g. *Primary Header Logo*, *Reverse Dark Logo*, *Monochrome Logo*, *Badge Icon*):
  1. **Top Left Logo** (Aligned to top-left of the email canvas)
  2. **Top Center Logo** (Centered prominently at top)
* **Simple, Minimalist Layout**: Unlike standard status emails that feature heavy gradient header banners ("ITALY", country flags, reference footers), Generous Templates present a clean, elegant card layout focused entirely on the custom message body.
* **Live Designed Preview**: Provides real-time rendering of variable replacements (`{{ applicant_name }}`, `{{ applicant_id }}`, `{{ passport_number }}`, `{{ company_name }}`) and selected logo positions before dispatching.

---

## 🌟 Detailed Feature Breakdown

### 🏛️ Public Applicant Portal
* **Application Status Tracker**: Allows candidates to check their application stage using Application ID and verified Email.
* **Personnel Credential Verification**: Interactive modal displaying official staff credentials, QR code validation string, monthly/yearly team rankings, and lifetime performance stats (Approved, Processing, and Rejected visas).
* **Visa & Country Catalog**: Displays visa requirements, processing lead times, pricing, and required document checklists.
* **Agreement Fee & Refund Calculator**: Clear visibility into payment installment breakdowns and policy terms.

### 🛡️ Admin Control Center
* **Applicant Lifecycle Pipeline**: Manage applicants across stages (Submitted, In Review, Visa Approved, Ticket Stamping, Handover, Rejected, Refund Processed).
* **Printable Receipts & Refund Vouchers**: Generates formatted money receipts with official letterhead, transaction references, legal disclaimers, and signature blocks.
* **Staff Quota & Slot Allocations**: Manage representatives, monthly slot limits, sub-staff distributions, and performance ranks.
* **Company Brand Logos & Assets**: Upload and order logo variations by serial numbers.

---

## 🛠️ Technology Stack & Dependencies

| Component | Library / Tool | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | React | `18.3.x` | UI Component Hierarchy |
| **Build Tool** | Vite | `6.x` | Dev Server & Production Bundler |
| **Styling** | Tailwind CSS | `3.4.x` | Utility Styling & Custom Utility Classes |
| **State Caching** | TanStack Query | `v5.x` | Server State Fetching, Caching & Mutations |
| **Animations** | Framer Motion | `11.x` | Page Transitions & Modal Animations |
| **Icons** | Heroicons | `v2.x` | Visual Iconography |
| **HTTP Client** | Axios | `1.6.x` | Interceptors & REST API Requests |

---

## 📁 Repository Structure

```
Visa Aagency Frontend/
├── admin/                      # Admin Management Application
│   ├── src/
│   │   ├── api/                # Axios client & API interceptors
│   │   ├── components/         # Common UI elements (CrudTable, Layout, Modals, Pagination)
│   │   ├── pages/
│   │   │   ├── applicants/     # Applicant detail, list, print views & payment modals
│   │   │   ├── staff/          # Staff list, detail, form, monthly slots & sub-staffs
│   │   │   ├── settings/       # LogosSettings, EmailTemplatesSettings, CompanySettings
│   │   │   └── dashboard/      # Analytics, agreement templates, refunds page
│   │   ├── App.jsx             # React Router route definitions
│   │   └── main.jsx            # Entry point & QueryClient provider
│   ├── package.json
│   └── vite.config.js
│
└── public/                     # Client Facing Portal Application
    ├── src/
    │   ├── api/                # Public API client
    │   ├── components/         # StaffProfileModal, CountryCard, Navbar, Footer
    │   ├── pages/              # StatusCheckPage, VisaCatalogPage, HomePage
    │   ├── App.jsx             # Router
    │   └── main.jsx            # Entry point
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Setup & Local Execution

### Prerequisites
* **Node.js**: `v18.x` or higher
* **npm**: `v9.x` or higher

### Installation & Execution

1. **Clone Repository**:
   ```bash
   git clone https://github.com/rakibIV/visa-agency-frontend.git
   cd visa-agency-frontend
   ```

2. **Admin Portal**:
   ```bash
   cd admin
   npm install
   npm run dev
   ```
   * Access Admin Portal at `http://localhost:5173`

3. **Public Portal**:
   ```bash
   cd ../public
   npm install
   npm run dev
   ```
   * Access Public Portal at `http://localhost:5174`

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
