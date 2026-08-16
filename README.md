# 🎨 Artisa Frontend — E-Commerce & Art Gallery Web Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=flat-square&logo=reactquery)](https://tanstack.com/query)

**Artisa (آرتیسا)** is a modern, high-performance web application designed for an online art gallery and luxury Iranian handcrafts marketplace. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4, Artisa offers a rich user experience, multi-language/i18n support, automated cart and order workflows, user profiles, and an integrated Admin Control Panel.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Directory Structure](#-directory-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Development Server](#development-server)
- [📜 Scripts](#-scripts)
- [🌐 Key Modules & Routes](#-key-modules--routes)
  - [Public Pages](#public-pages)
  - [User Account & Orders](#user-account--orders)
  - [Admin Dashboard](#admin-dashboard)
- [🔌 Backend API Integration](#-backend-api-integration)
- [🎨 Styling & Component System](#-styling--component-system)

---

## ✨ Features

- **🛒 E-Commerce & Product Showcase**:
  - Interactive hero banner sliders & promotional sections.
  - Multi-criteria product catalog (search, categories, price filter, sorting, special offers, best sellers).
  - Rich product detail views with image galleries, technical specs, customer reviews, and star ratings.
  - Interactive shopping cart with persistent client-side state and live total calculations.

- **👤 User Management & Authentication**:
  - Full auth flows: Login, Registration, Password Reset, Email Verification.
  - Google OAuth 2.0 single sign-on (SSO) support via `@react-oauth/google`.
  - Comprehensive user profile dashboard: order history, personal address book management, saved wishlist/favorites.

- **📊 Admin Control Panel (`/app/(admin)`)**:
  - Administrative dashboard for store metrics and system overview.
  - Product catalog CRUD operations (Add, Edit, Delete, Upload media).
  - Order status management & tracking updates.
  - Customer review moderation (Approve / Reject product comments).
  - User permissions and account administration.

- **🌍 Internationalization (i18n) & Accessibility**:
  - Dual language support (Persian / English) powered by `LanguageContext`.
  - RTL & LTR dynamic layout switching.
  - Toast notifications powered by `sonner`.
  - Smooth micro-interactions & responsive layout across Mobile, Tablet, and Desktop.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16.2](https://nextjs.org/) (App Router architecture) |
| **Library** | [React 19.2](https://react.dev/) |
| **Language** | [TypeScript 5.x](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS + `clsx` + `tailwind-merge` |
| **UI Components** | Custom design system + `@base-ui/react` + [Lucide Icons](https://lucide.dev/) |
| **State & Data Fetching** | [TanStack React Query v5](https://tanstack.com/query) + React Context API |
| **HTTP Client** | [Axios](https://axios-http.com/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Auth Integration** | `@react-oauth/google` + In-Memory Access Tokens + HttpOnly/Secure Refresh Cookies |
| **Feedback & Dialogs** | [Sonner](https://sonner.emilkowal.ski/) toast notifications |

---

## 📂 Directory Structure

```
artisa/
├── src/
│   ├── app/                      # Next.js 16 App Router pages & routes
│   │   ├── (admin)/              # Admin Dashboard protected routes
│   │   │   ├── dashboard/        # Main admin overview
│   │   │   ├── products/         # Admin product management
│   │   │   ├── orders/           # Admin order processing
│   │   │   └── users/            # Admin user permissions
│   │   ├── about-us/             # Brand story & company info
│   │   ├── blog/                 # Blog articles listing & detailed view
│   │   ├── cart/                 # Active cart management
│   │   ├── checkout/             # Order placement & address selection
│   │   ├── contact-us/           # Contact form & support
│   │   ├── faq/                  # Interactive Frequently Asked Questions
│   │   ├── forgot-password/      # Account recovery request
│   │   ├── login/                # Customer authentication
│   │   ├── product/              # Product catalog & single product ([id])
│   │   ├── profile/              # Customer profile (Orders, Address, Wishlist)
│   │   ├── register/             # User signup page
│   │   ├── reset-password/       # Password token handler
│   │   ├── track-order/          # Public order status query
│   │   ├── verify-email/         # Email verification confirmation
│   │   ├── globals.css            # Tailwind v4 directives & theme variables
│   │   ├── layout.tsx            # Global layout wrapper & providers
│   │   └── page.tsx              # Homepage / Landing view
│   ├── components/               # UI Components
│   │   ├── admin/                # Admin-specific tables, charts, & forms
│   │   ├── auth/                 # Login/Register modal forms & OAuth buttons
│   │   ├── comments/             # Product reviews, star ratings & submission
│   │   ├── dialogs/              # Modal overlays & confirmation popups
│   │   ├── home/                 # Hero carousels, feature banners, grids
│   │   ├── layout/               # Header, Navbar, Footer, Mobile Drawer
│   │   ├── profile/              # User profile navigation & tab content
│   │   ├── providers/            # React Query & Google Auth providers
│   │   ├── ui/                   # Reusable base components (Button, Input, Card)
│   │   ├── AppContext.tsx        # Global app context (Cart, Auth, UI state)
│   │   └── LanguageContext.tsx   # i18n localization provider
│   ├── hooks/                    # Custom React hooks (useAdmin, useAuth, etc.)
│   ├── lib/                      # Axios instance, API endpoints, helpers
│   └── data/                     # Static dataset fallbacks
├── public/                       # Static assets (Logos, icons, images)
├── .env.example                  # Environment configuration template
├── next.config.ts                # Next.js compiler & domain configuration
├── package.json                  # Dependencies and execution scripts
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.18.0` or higher (Node `v20.x` recommended)
- **Package Manager**: `npm` (v9+), `yarn`, or `pnpm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/seyedali-rafazi/artisa.git
   cd artisa
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env.local` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env.local
```

Configure your local environment variables:

```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Google OAuth 2.0 Client ID (optional for local testing)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Launches the Next.js development server with hot-reloading on port `3000`. |
| `npm run build` | Compiles and builds the production-ready Next.js application. |
| `npm run start` | Boots up the production server (requires running `npm run build` first). |
| `npm run lint` | Evaluates code against ESLint rules and Next.js guidelines. |

---

## 🌐 Key Modules & Routes

### Public Pages
- `/` — Homepage featuring Hero slider, Special offers, Best sellers, & Art categories.
- `/product` — Full catalog view with real-time filtering, search, and pagination.
- `/product/[id]` — Detailed view of an individual art piece, artist info, reviews, and add-to-cart.
- `/blog` — Articles on art appreciation, Iranian craftsmanship, and design news.
- `/faq` — Expandable Accordion for shipping, payment, and return policies.
- `/contact-us` & `/about-us` — Brand history, location map, and contact form.

### User Account & Orders
- `/login` & `/register` — Authentication pages with email/password & Google OAuth.
- `/profile` — Dashboard for customer personal details, address book, and saved wishlist.
- `/cart` — Comprehensive basket preview, quantity modifiers, and promo codes.
- `/checkout` — Shipping selection, address picker, and order confirmation.
- `/track-order` — Instant status lookup using order tracking code.

### Admin Dashboard
- `/(admin)/dashboard` — Metrics overview (sales revenue, pending orders, user counts).
- `/(admin)/products` — Add, update, or remove catalog items and update stock.
- `/(admin)/orders` — Inspect order history, update shipping status, and view receipts.
- `/(admin)/users` — User role management and account administration.

---

## 🔌 Backend API Integration

The frontend communicates with the **FastAPI Backend** via Axios and fetch API clients configured in `src/lib/axios.ts` and `src/lib/api.ts`.
- **Authentication Security Architecture**: Short-lived Access Tokens are stored strictly in application memory (`TokenManager`), while Refresh Tokens are handled via backend-managed `HttpOnly`, `Secure`, and `SameSite` cookies with single-flight token rotation and automatic 401 retry interceptors. No authentication credentials are ever stored in `localStorage` or `sessionStorage`.
- **Data Caching**: TanStack React Query (`@tanstack/react-query`) handles background data refetching, caching, optimistic updates, and loading/error states.

---

## 🎨 Styling & Component System

- **Tailwind CSS v4**: Built with the latest utility-first features and CSS variable theme tokens defined in `src/app/globals.css`.
- **Responsive Layout**: Designed mobile-first, supporting fluid views across all screen sizes.
- **RTL Support**: Built-in support for Persian (RTL) right-to-left layout structure.

---

## 📄 License

This project is proprietary and confidential. All rights reserved by **Artisa**.
