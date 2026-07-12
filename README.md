# BlogBuilder - SaaS Blog Builder Platform

A production-quality internal developer blogging platform (similar to Medium, Dev.to, and Vercel Dashboard) built as a Full-Stack development project.

---

## 1. Overview & Key Objectives

BlogBuilder is a role-based internal publication system built to empower employees to draft and publish technical blogs, while giving administrators total authority to audit posts, manage staff accounts, and curate taxonomy tags/categories. The public interface prioritizes high-fidelity readability and beautiful visual aesthetics (Frosted glass filters, clean outfit typography, dark theme support, and custom inline brand vectors).

---

## 2. Tech Stack & Architectural Decisions

*   **Framework**: **Next.js (App Router)** - Chosen for its powerful page routing, dynamic server-side rendering (SSR), and secure Server Actions/Route Handlers. It allows for direct-to-database queries and clean API logic without the overhead of a separate Express backend server.
*   **Language**: **JavaScript** - Selected to meet the core project constraints, keeping development agile and lightweight while avoiding compilation/build-time overhead.
*   **Database**: **PostgreSQL & Prisma ORM** - A robust relational model schema featuring cascade deletions. Configured using Prisma's modern, native JavaScript driver adapter (`@prisma/adapter-pg` & `pg` connection pool) for fast startup times and typed query building.
*   **Styling & Animation**: **Tailwind CSS v4 & Framer Motion** - Implements a premium developer-oriented visual identity, combining layout utility helpers with glassmorphic cards, smooth dark mode integration, and subtle micro-animations for an interactive user experience.
*   **Authentication**: **JWT & Bcrypt** - Secured using cryptographic JSON Web Tokens signed on the server and stored strictly inside **HttpOnly, Secure, SameSite=Lax Cookies** to prevent XSS/CSRF token leakage. Passwords are encrypted using Bcrypt hashing before database persistence.
*   **Rich Text Editor**: **TipTap** - Renders raw documents as clean block JSON objects rather than unsafe raw HTML templates, reducing XSS vulnerabilities and allowing structured text manipulation.
*   **File Storage**: **Cloudinary** - A secure image upload endpoint handles cover images and inline article visual assets direct-to-CDN.
*   **Data Fetching & Cache**: **TanStack React Query v5** - Manages client cache synchronization, invalidating queries instantly to show comment additions, views, and likes in real-time.

---

## 3. Features Implemented vs. Skipped

We have meticulously designed and implemented a full suite of features matching core developer blogging platform needs. Below is the honest breakdown of completed, partially completed, and skipped/out-of-scope features:

| Feature Area | Sub-Feature | Status | Implementation Details / Notes |
| :--- | :--- | :--- | :--- |
| **Authentication & Security** | Role-Based Access Control (Admin, Employee, Reader) | **Implemented** | Secured via secure HTTP-Only JWT cookies, client-side route guards (layouts), and API server checks. |
| | Social Authentication (Google, GitHub) | **Skipped** | Only email/password auth is supported (out-of-scope for core platform requirements). |
| | Password Reset / Email Verification | **Skipped** | Users register and log in immediately using standard forms. |
| **Rich Text Editor Workspace** | Block Formatting, Embeds, Table Generator | **Implemented** | Built with TipTap Editor. Outputs structured JSON instead of raw HTML. |
| | Auto-Save Drafts | **Implemented** | LocalStorage-based autosave every 2 seconds with draft restore prompts. |
| | Image Cover upload | **Implemented** | Direct-to-Cloudinary image upload endpoint. |
| | Tag Management in Editor | **Partial** | Authors can select existing tags, but creating new tags is restricted to Admins. |
| **Employee Dashboard** | Real-time Stats & Comments Feed | **Implemented** | Shows total articles, published count, drafts, total views, and reader comment activity. |
| | Blog CRUD operations | **Implemented** | Create, read, update, delete, and save-as-draft/publish articles. |
| **Admin Panel** | Platform Statistics & Logs | **Implemented** | Overall stats including views, blogs, active authors, and a live comment activity feed. |
| | Employee Management | **Implemented** | Admins can register new employee accounts and delete existing ones (with self-deletion guard). |
| | Blog Moderation | **Implemented** | Audit, delete, or change publish status of any blog. |
| | Taxonomy CRUD | **Implemented** | Create and delete categories and tags with dynamic slugification. |
| **Public Portal** | Feed with Live Search & Filtering | **Implemented** | Real-time title/excerpt search, category tab filter, and tag filter. |
| | Article Reading Interface | **Implemented** | Dynamic Table of Contents (scroll-spy), reading time estimator, secure likes, and comments. |
| | Nested Comment Threads | **Skipped** | Comments are flat/linear lists to keep the discussion thread simple. |
| | Dark Mode Toggle | **Implemented** | Implemented using `next-themes` and Tailwind dark class styling. |
| **SEO & Performance** | Meta Tag Customization & Social Cards | **Implemented** | Dynamic metadata parsing via Next.js `generateMetadata` for page titles, descriptions, and OpenGraph/Twitter previews. |
| | Middleware-level Route Protection | **Skipped** | Security layout guards and API route verification are used instead of global Next.js `middleware.js` redirects. |

---

## 4. Setup & Installation Steps

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- PostgreSQL Database Instance

### 1. Clone the Repository
```bash
git clone https://github.com/shreyas3155/Blog_Builder.git
cd Blog-Builder-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and populate it with your local credentials. You can use the template below (also available in `example.env`):

```env
# Database Connection String
DATABASE_URL="postgresql://username:password@localhost:5432/Blog_builder?schema=public"

# JWT Secret Code (Any secure random string)
JWT_SECRET="generate-a-secure-random-key-here"

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

### 4. Push Database Schema & Seed Data
Generate Prisma schemas and seed databases:
```bash
# Push schema structure to PostgreSQL
npx prisma db push

# Seed database with the exact hiring assignment sample posts
npx prisma db seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Mock Login Credentials

Run `npx prisma db seed` to populate the database with these logins:

*   **Administrator**:
    *   Email: `admin@bb.com`
    *   Password: `password123`
*   **Employee Writer**:
    *   Email: `employee@bb.com`
    *   Password: `password123`
*   **Reader Customer**:
    *   Email: `reader@bb.com`
    *   Password: `password123`

---

## 6. Known Limitations

1.  **Image Upload Size Checks**: Currently relies on Cloudinary's default upload limit rules. Adding front-end compression prior to upload would decrease network upload times.
2.  **Comments Nested Hierarchy**: Comments are stored as single-level feeds. Supporting multi-level reply threads would improve discussions on large posts.
3.  **Real-Time Analytics Sync**: Dashboard statistics are fetched via React Query caching intervals. WebSockets or server-sent events could provide real-time updates for high-traffic environments.
4.  **Absence of Root Next.js Middleware**: The project contains a `src/proxy.js` which outlines standard routing protection checks; however, it is not wired up as a root Next.js `middleware.js` file. Route protection is handled through React layouts (`src/app/(admin)/admin/layout.js`, `src/app/(employee)/layout.js`) and endpoint validation.
