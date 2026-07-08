"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { BookOpen, FileText, Clock, TrendingUp } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({ courses: 0, pending: 0, graded: 0, avg: 0 });

  useEffect(() => {
    if (!user?.id) return;
    loadData();
  }, [user?.id]);

  async function loadData() {
    // Get enrolled courses
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("course_id, courses(*)")
      .eq("student_id", user!.id);

    const enrolledCourses = enrollments?.map((e: any) => e.courses).filter(Boolean) || [];
    setCourses(enrolledCourses.slice(0, 3));

    // Get submission stats
    const { data: submissions } = await supabase
      .from("submissions")
      .select("*")
      .eq("student_id", user!.id);

    const allSubs = submissions || [];
    const graded = allSubs.filter((s: any) => s.status === "graded");
    const avgGrade = graded.length > 0
      ? graded.reduce((acc: number, s: any) => acc + (s.grade || 0), 0) / graded.length
      : 0;

    setStats({
      courses: enrolledCourses.length,
      pending: allSubs.filter((s: any) => s.status === "submitted").length,
      graded: graded.length,
      avg: Math.round(avgGrade),
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.full_name?.split(" ")[0]}!</h1>
        <p className="text-slate-500 mt-1">Track your learning progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Courses", value: stats.courses, icon: <BookOpen className="w-5 h-5 text-blue-600" />, color: "bg-blue-50" },
          { label: "Pending", value: stats.pending, icon: <Clock className="w-5 h-5 text-amber-600" />, color: "bg-amber-50" },
          { label: "Graded", value: stats.graded, icon: <FileText className="w-5 h-5 text-green-600" />, color: "bg-green-50" },
          { label: "Avg Score", value: stats.avg || "-", icon: <TrendingUp className="w-5 h-5 text-purple-600" />, color: "bg-purple-50" },
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

      {/* Recent Courses */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">My Courses</h2>
          <a href="/dashboard/student/courses" className="text-sm text-blue-600 hover:text-blue-700">View all</a>
        </div>
        <div className="p-6">
          {courses.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No courses enrolled yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course: any) => (
                <div key={course.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{course.title}</p>
                    <p className="text-sm text-slate-500 truncate">{course.description || "No description"}</p>
                  </div>
                  <span className="badge-blue">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
