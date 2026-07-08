"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import {
  Home, BookOpen, FileText, Users, Settings, LogOut, GraduationCap
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const role = user?.role || "student";

  const baseStudent: NavItem[] = [
    { label: "Dashboard", href: "/dashboard/student", icon: <Home className="w-5 h-5" /> },
    { label: "Courses", href: "/dashboard/student/courses", icon: <BookOpen className="w-5 h-5" /> },
    { label: "My Assignments", href: "/dashboard/student/assignments", icon: <FileText className="w-5 h-5" /> },
  ];

  const teacherNav: NavItem[] = [
    { label: "Dashboard", href: "/dashboard/teacher", icon: <Home className="w-5 h-5" /> },
    { label: "Courses", href: "/dashboard/teacher/courses", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Assignments", href: "/dashboard/teacher/assignments", icon: <FileText className="w-5 h-5" /> },
    { label: "Submissions", href: "/dashboard/teacher/submissions", icon: <FileText className="w-5 h-5" /> },
  ];

  const adminNav: NavItem[] = [
    { label: "Dashboard", href: "/dashboard/admin", icon: <Home className="w-5 h-5" /> },
    { label: "Users", href: "/dashboard/admin/users", icon: <Users className="w-5 h-5" /> },
    { label: "Courses", href: "/dashboard/admin/courses", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Assignments", href: "/dashboard/teacher/assignments", icon: <FileText className="w-5 h-5" /> },
  ];

  const navItems = role === "admin" ? adminNav : role === "teacher" ? teacherNav : baseStudent;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">English LMS</p>
            <p className="text-xs text-slate-500 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-700">
              {user?.full_name?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
