"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { Users, BookOpen, FileText, Shield } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, students: 0, teachers: 0, courses: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const { count: users } = await supabase.from("users").select("*", { count: "exact", head: true });
    const { count: students } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student");
    const { count: teachers } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "teacher");
    const { count: courses } = await supabase.from("courses").select("*", { count: "exact", head: true });
    setStats({ users: users || 0, students: students || 0, teachers: teachers || 0, courses: courses || 0 });
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: stats.users, icon: <Users className="w-5 h-5 text-blue-600" />, color: "bg-blue-50" },
          { label: "Students", value: stats.students, icon: <Users className="w-5 h-5 text-green-600" />, color: "bg-green-50" },
          { label: "Teachers", value: stats.teachers, icon: <Users className="w-5 h-5 text-purple-600" />, color: "bg-purple-50" },
          { label: "Courses", value: stats.courses, icon: <BookOpen className="w-5 h-5 text-amber-600" />, color: "bg-amber-50" },
        ].map((stat, i) => (
          <div key={i} className="card p-5">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <a href="/dashboard/admin/users" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Manage Users</span>
            </a>
            <a href="/dashboard/admin/courses" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <BookOpen className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-700">Manage Courses & Enrollments</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
