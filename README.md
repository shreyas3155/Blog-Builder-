# InkFlow - SaaS Blog Builder Platform

A production-quality internal developer blogging platform (similar to Medium, Dev.to, and Vercel Dashboard) built as a Full-Stack hiring assignment submission.

## 1. Overview & Key Objectives
InkFlow is a role-based internal publication system built to empower employees to draft and publish technical blogs, while giving administrators total authority to audit posts, manage staff accounts, and curate taxonomy tags/categories. The public interface prioritizes high-fidelity readability and beautiful visual aesthetics (Frosted glass filters, clean outfit typography, dark theme support, and custom inline brand vectors).

---

## 2. Tech Stack & Architectural Decisions

*   **Framework**: **Next.js 15 (App Router)** - Renders pages dynamically, utilizing secure Server Actions/Route Handlers for API logic without a separate Express server.
*   **Language**: **JavaScript** - Built entirely in JS (avoiding TypeScript overhead as specified in constraints).
*   **Database**: **PostgreSQL & Prisma ORM 7** - A robust relational model schema featuring cascade deletions, and configured using Prisma's modern, native JavaScript driver adapter (`@prisma/adapter-pg` & `pg` connection pool) for fast startups.
*   **Styling**: **Tailwind CSS v4 & Framer Motion** - Implements a premium developer-oriented visual identity, combining layout utility utilities with glassmorphic cards and subtle animations.
*   **Authentication**: **JWT & bcrypt** - Secured using cryptographic JSON Web Tokens signed and stored strictly inside **HttpOnly, Secure, SameSite=Lax Cookies** to prevent XSS/CSRF token leakage.
*   **Rich Text Editor**: **TipTap** - Renders raw documents as clean block JSON objects rather than unsafe raw HTML templates.
*   **File Storage**: **Cloudinary** - Direct, secure image upload endpoint for content visual images and cover images.
*   **Data Fetching**: **TanStack React Query v5** - Manages client cache synchronization (invalidating queries instantly to show comment additions, views, and likes real-time).

---

## 3. Features Implemented

### 🔑 Authentication & Role Security
- **Bcrypt Hashing**: Encrypts password payloads during signup.
- **HttpOnly Cookies Session**: JWT verified on the server-side via Route Handlers.
- **Next.js Route Protection**: `src/middleware.js` automatically guards `/admin/*` and `/employee/*` layouts, redirecting unauthorized users.

### 📝 TipTap Rich Text Editor Workspace
- **Formatting Tools**: Bold, italic, underline, blockquotes, code-blocks, inline code, headings (H1/H2/H3), bullet/ordered lists.
- **Rich Embeds**: Table grid generator (+Col/Row, Header indicators) and direct file upload handlers.
- **Cover Image Selector**: Drag-and-drop file upload block connected to Cloudinary CDN storage.
- **SEO Preview Panel**: Live Google search card mock highlighting Title, URL path, and character-limited Excerpt description.
- **Local Storage Auto-Save**: Client-side background sync saving changes every 2 seconds, displaying a draft restoration alert if unsaved modifications exist.

### 📈 Employee/Author Dashboard
- **Analytics Cards**: Real-time stats count (Total Blogs, Published, Drafts, Views).
- **Activity Log**: Displays comments left by readers on the author's blogs.
- **Blogs Control Table**: Reusable grid with inline filters (Published/Drafts status), title searching, and creation date sorting.
- **CRUD Operations**: Complete CRUD for articles, allowing authors to save as drafts or publish instantly.

### 👑 Admin Management Dashboard
- **Global Overview**: Real-time stats grid showing total blogs, total views, published count, active employees, and **Most Active Author** (Bonus metric).
- **Event timeline**: Unified activity log showing comments, likes, and publication dates platform-wide.
- **Staff User Manager**: Grid of employee accounts. Modal form to register new employees directly, with automatic password hashing. Includes a self-deletion blocker.
- **Blog Moderator**: Audits all platform blogs. Allows admins to instantly switch publication status or delete any article.
- **Taxonomy Manager**: CRUD interface to create/delete Categories (with dynamic slugification) and Tag indexes.

### 🌐 Public Blog Website
- **Landing Board**: Grid of published posts showing cover photo, excerpt, category pill, author card, reading duration, date, and interaction stats.
- **Real-Time Search & Category Filters**: Search matching titles dynamically, with category filters.
- **Article Details Reader**:
  - Full cover header.
  - Interactive Table of Contents (ToC) scrolling spy highlighting active headings.
  - Related posts selector and floating share links.
  - Dynamic Comments thread and Secure Likes toggle.
  - Reading Time Calculator (parses block JSON nodes dynamically to estimate minutes read).
- **Theme Support**: Integrated `next-themes` dark mode toggle.

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
Create a `.env` file in the root directory:
```env
# Database Connection String
DATABASE_URL="postgresql://username:password@localhost:5432/Blog_builder?schema=public"

# JWT Secret Code
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
    *   Email: `admin@blogbuilder.com`
    *   Password: `password123`
*   **Employee Writer**:
    *   Email: `employee@blogbuilder.com`
    *   Password: `password123`
*   **Reader Customer**:
    *   Email: `reader@blogbuilder.com`
    *   Password: `password123`

---

## 6. Known Limitations & Potential Improvements
1.  **Image Upload Size Checks**: Currently relies on Cloudinary's default upload limit rules. Adding front-end compression prior to upload would decrease network upload times.
2.  **Comments Nested Hierarchy**: Comments are stored as single-level feeds. Supporting multi-level reply threads would improve discussions on large posts.
3.  **Real-Time Analytics Sync**: Dashboard statistics are fetched via React Query caching intervals. WebSockets or server-sent events could provide real-time updates for high-traffic environments.