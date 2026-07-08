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

## 🚀 Quick Start

### 1. Setup Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/yalcdyzzcdqehsyutckw/sql)
2. Open **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run**

### 2. Create Storage Buckets

In Supabase Dashboard → **Storage** → **New Bucket**:

| Bucket Name | Public | Purpose |
|-------------|--------|---------|
| `materials` | No | Teacher uploads (PDF, audio files) |
| `student_files` | No | Student assignment submissions |

### 3. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aocwonosari-pixel/english-lms)

Add these **Environment Variables** in Vercel:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yalcdyzzcdqehsyutckw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbGNkeXp6Y2RxZWhzeXV0Y2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MDQyMTgsImV4cCI6MjA5OTA4MDIxOH0.AGbgzeD1DNo6Os5squdQvHqhT_7Z_oO_Gl0b6YUgd2M` |

### 4. Create First Admin User

Since there's no self-signup for MVP:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add user** → fill in email, password, and metadata (full_name)
3. In the **users** table, manually update the user's role to `'admin'`

## 📁 Project Structure

```
src/
├── app/
│   ├── login/              # Login page
│   ├── dashboard/
│   │   ├── admin/          # Admin pages (users, courses)
│   │   ├── teacher/        # Teacher pages
│   │   └── student/        # Student pages
│   └── layout.tsx
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── auth-provider.tsx   # Supabase auth context
│   └── dashboard/
│       └── sidebar.tsx      # Role-based navigation
└── lib/
    ├── supabase.ts          # Supabase client
    └── utils.ts             # Utility functions
```

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#2563eb` | Buttons, links, active states |
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
| submissions | Read/Write own | Read/Write all | Full |

## 📄 License

MIT
