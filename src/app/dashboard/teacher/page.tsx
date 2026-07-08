"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { BookOpen, FileText, Users, CheckCircle } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ courses: 0, modules: 0, assignments: 0, pendingSubmissions: 0 });

  useEffect(() => {
    if (!user?.id) return;
    loadStats();
  }, [user?.id]);

  async function loadStats() {
    // Teachers see all data (simplified for MVP)
    const { count: courses } = await supabase.from("courses").select("*", { count: "exact", head: true });
    const { count: modules } = await supabase.from("modules").select("*", { count: "exact", head: true });
    const { count: assignments } = await supabase.from("assignments").select("*", { count: "exact", head: true });
    const { data: subs } = await supabase.from("submissions").select("*").eq("status", "submitted");
    setStats({
      courses: courses || 0,
      modules: modules || 0,
      assignments: assignments || 0,
      pendingSubmissions: subs?.length || 0,
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Teacher Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Courses", value: stats.courses, icon: <BookOpen className="w-5 h-5 text-blue-600" />, color: "bg-blue-50" },
          { label: "Modules", value: stats.modules, icon: <FileText className="w-5 h-5 text-green-600" />, color: "bg-green-50" },
          { label: "Assignments", value: stats.assignments, icon: <FileText className="w-5 h-5 text-purple-600" />, color: "bg-purple-50" },
          { label: "Pending Review", value: stats.pendingSubmissions, icon: <CheckCircle className="w-5 h-5 text-amber-600" />, color: "bg-amber-50" },
        ].map((stat, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                {stat.icon}
              </div>
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
            <a href="/dashboard/teacher/courses" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">Manage Courses & Modules</span>
            </a>
            <a href="/dashboard/teacher/assignments" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-slate-700">Create Assignments</span>
            </a>
            <a href="/dashboard/teacher/submissions" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <CheckCircle className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-slate-700">Review Submissions</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
