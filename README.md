# English LMS - Learning Management System

A comprehensive Learning Management System for LPK Atlantis Ocean Club, built with **Next.js 15**, **Supabase**, and **Tailwind CSS**.

## 🎯 Features

### User Roles
- **Admin** — Full access: manage users, courses, enrollments
- **Teacher** — Manage courses, modules, assignments, grade submissions
- **Student** — View enrolled courses, download materials, submit assignments

### Core Features
- 📧 Email & Password Authentication (Supabase Auth)
- 📚 Course & Module Management
- 📝 Assignment Creation & Submission
- ⭐ Grading System with Feedback
- 🔒 Row Level Security (RLS) per role
- ☁️ File Storage for materials & submissions
- 📱 Mobile-first responsive design
- 🔌 Webhook-ready for n8n/WhatsApp automation

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Styling | Custom CSS with design tokens (Blue/White/Gray) |
| Icons | Lucide React |

## 🚀 Getting Started

### 1. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase-schema.sql`
3. Create two storage buckets:
   - `materials` (for teacher PDF/audio uploads)
   - `student_files` (for student assignment submissions)
4. Copy your project URL and anon key

### 2. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/english-lms.git
cd english-lms
npm install
```

### 3. Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── login/              # Login page
│   ├── dashboard/
│   │   ├── admin/          # Admin pages (users, courses)
│   │   ├── teacher/         # Teacher pages (courses, assignments, grading)
│   │   └── student/         # Student pages (courses, assignments, submission)
│   └── layout.tsx           # Root layout with AuthProvider
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── auth-provider.tsx   # Supabase auth context
│   └── dashboard/
│       └── sidebar.tsx      # Role-based navigation
└── lib/
    ├── supabase.ts          # Supabase client
    ├── types.ts             # TypeScript types
    └── utils.ts             # Utility functions
```

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#2563eb` | Buttons, links, active states |
| Primary Hover | `#1d4ed8` | Button hover |
| Background | `#ffffff` | Page background |
| Text | `#0f172a` | Headings |
| Muted | `#f1f5f9` | Cards, secondary areas |
| Border | `#e2e8f0` | Card borders, dividers |

## 🔐 Row Level Security

| Table | Student | Teacher | Admin |
|-------|---------|---------|-------|
| users | Read own | Read all | Full |
| courses | Read | Read | Full |
| modules | Read | Write | Write |
| assignments | Read | Write | Write |
| submissions | Read/Write own | Read/Write all | Read/Write all |
| course_enrollments | Read | Read | Full |

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## 📄 License

MIT
