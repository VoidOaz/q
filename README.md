# Flux Hosting - Full-Stack VDS / VPS Management Panel

A high-performance, full-stack web hosting management panel built with **React**, **TypeScript**, **Node.js (Express)**, and a **Monochrome Black & White Dark-First Design System**.

---

## ⚡ Key Highlights & Core Capabilities

- **🔐 Robust Authentication & Role-Based Access Control (RBAC):**
  - Secure registration, login, and password recovery.
  - Custom procedural **SVG Security CAPTCHA verification** with mathematical & challenge puzzles on both login and registration forms.
  - Two distinct roles: **Server Owner** (unrestricted root management, member invitation, billing) and **Team Member** (granular permissions).
  - One-click **Quick Demo Login** buttons for instant testing.

- **📊 Live Hardware Telemetry & Dashboard:**
  - Real-time stream for CPU utilization, RAM usage, NVMe disk metrics, network I/O, load averages, and uptime.
  - 3-second live hardware sparkline charts.
  - Active daemon/process list with one-click process termination (`kill -9`).

- **⚡ Power Operations:**
  - Start, ACPI Graceful Reboot, Force Reboot, ACPI Graceful Shutdown, and Force Kill (Instant Power-Off) with safety confirmation modals.

- **💻 Interactive Web Shell / Terminal Console:**
  - Real-time pseudo-terminal session connected to node agents.
  - Interactive command prompt (`root@hostname:~#`), command history navigation (Up/Down arrow keys), log copying, screen clearing, and fullscreen mode.
  - Quick action toolbar for common Linux commands (`top`, `df -h`, `free -m`, `systemctl`, `ufw status`, `docker ps`).

- **📁 Real-Time File Manager & Code Editor:**
  - Full path breadcrumb filesystem navigation.
  - File details: permissions (`0755`, `0644`), ownership (`root:root`), size, and modification timestamp.
  - Built-in live syntax-styled text file editor with `Ctrl+S` quick saving.
  - File upload (drag & drop and file browser), file download, creation of new files and folders, permission modifications (`chmod`), and deletion.

- **🌐 Network, Firewall & DNS Management:**
  - Public IPv4, Private IPv4, and IPv6 address management with 1-click clipboard copy.
  - **Port Forwarding / NAT:** Forward external traffic to internal container services.
  - **UFW / iptables Firewall:** Configure `ALLOW` and `DENY` rules for TCP, UDP, ICMP with CIDR source restrictions.
  - **DNS Zone Manager:** Manage `A`, `AAAA`, `CNAME`, `TXT`, and `MX` records with TTL and priority.

- **👥 Granular Member Delegation (RBAC):**
  - Only server owners can invite team members by username or email.
  - Fine-grained per-member permission switches: *Power Management*, *Terminal Console*, *File Manager*, *Network & Firewall*, and *View-Only Mode*.

- **📧 SMTP Email Service & Diagnostics:**
  - Configurable SMTP relay (Host, Port, SSL/TLS, Credentials, Sender Identity).
  - Built-in **SMTP Handshake Diagnostic Tool** that logs real handshake transcript traces.
  - Searchable outbox history table.

- **🌍 Internationalization (i18n) & Monochrome Theme:**
  - Full bidirectional support for **English (EN)** and **Turkish (TR)** with instant switching.
  - Clean, high-contrast **Monochrome (Black & White)** aesthetic with dark mode as default.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Motion (Framer Motion).
- **Backend:** Node.js, Express, TypeScript, `tsx`, `esbuild`.
- **Security:** `bcryptjs` (salted password hashing), `jsonwebtoken` (JWT tokens), Custom SVG CAPTCHA Engine.
- **Database:** Local JSON-persisted state engine (`/data/flux_db.json`) + PostgreSQL schema (`/server/schema.sql`).

---

## 🚀 Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default variables:
```env
PORT=3000
JWT_SECRET=flux_secret_jwt_key_super_secure_2025
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@fluxhosting.io
SMTP_PASS=
SMTP_FROM_NAME="Flux Hosting"
SMTP_FROM_EMAIL=noreply@fluxhosting.io
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```
The server will boot on `http://localhost:3000` with the Vite dev middleware and full backend API proxy.

### 4. Production Build & Start

```bash
npm run build
npm start
```

---

## 🔑 Pre-Seeded Demo Accounts

You can log in directly using the following credentials (or use the one-click demo buttons on the login screen):

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Server Owner** | `flux_admin` | `flux123456` | Full unconstrained root permissions on all nodes |
| **Team Member** | `dev_member` | `flux123456` | Member permissions on European node |

---

## 📁 Project Structure

```
flux-hosting/
├── data/
│   └── flux_db.json               # Local JSON Database
├── server/
│   ├── auth.ts                    # JWT Middleware & Authentication Handlers
│   ├── captcha.ts                 # Procedural SVG CAPTCHA generator
│   ├── db.ts                      # JSON persistence engine & seed data
│   ├── mailer.ts                  # SMTP service & handshake diagnostics
│   ├── schema.sql                 # Production SQL Database Schema
│   ├── serverService.ts           # Telemetry metrics & Linux shell simulator
│   └── types.ts                   # Backend TypeScript interfaces
├── src/
│   ├── components/
│   │   ├── server/
│   │   │   ├── ActivityLogTab.tsx # Audit log view
│   │   │   ├── ConsoleTab.tsx     # SSH terminal console
│   │   │   ├── ControlPanelTab.tsx# Metrics & power management
│   │   │   ├── FileManagerTab.tsx # File browser & live code editor
│   │   │   ├── MembersTab.tsx     # RBAC member delegation
│   │   │   ├── NetworkTab.tsx     # IPs, firewall, ports, DNS
│   │   │   └── SettingsTab.tsx    # Server metadata & deletion
│   │   ├── AuthModal.tsx          # Login & Register with CAPTCHA
│   │   ├── CaptchaBox.tsx         # Interactive SVG CAPTCHA challenge
│   │   ├── ConnectServerModal.tsx # Add VDS/VPS server form
│   │   ├── ForgotPasswordModal.tsx# Password reset with token
│   │   ├── Navbar.tsx             # Brand header, theme, i18n, user menu
│   │   ├── ServerDetail.tsx       # Server management workspace
│   │   ├── ServerList.tsx         # Fleet overview & search
│   │   └── SmtpSettingsModal.tsx  # SMTP config & diagnostic tester
│   ├── context/
│   │   ├── AuthContext.tsx        # Authentication state
│   │   └── ThemeContext.tsx       # Monochrome dark/light state
│   ├── i18n/
│   │   ├── translations.ts        # Complete EN & TR dictionaries
│   │   └── useTranslation.tsx     # i18n context and hook
│   ├── App.tsx                    # Main React application entry
│   ├── index.css                  # Tailwind styles & theme variables
│   ├── main.tsx                   # React DOM bootstrap
│   └── types.ts                   # Frontend TypeScript interfaces
├── server.ts                      # Express API entry point & Vite middleware
└── package.json                   # Dependencies and scripts
```
