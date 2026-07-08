"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { formatDateTime, getGradeColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function StudentAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    loadAssignments();
  }, [user?.id]);

  async function loadAssignments() {
    setLoading(true);
    // Get all courses student is enrolled in
    const { data: enrollments } = await supabase
      .from("course_enrollments")
      .select("course_id")
      .eq("student_id", user!.id);

    const courseIds = enrollments?.map((e: any) => e.course_id) || [];
    if (courseIds.length === 0) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    // Get modules for these courses
    const { data: modules } = await supabase
      .from("modules")
      .select("*")
      .in("course_id", courseIds);

    const moduleIds = modules?.map((m: any) => m.id) || [];
    if (moduleIds.length === 0) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    // Get assignments
    const { data: asgns } = await supabase
      .from("assignments")
      .select("*")
      .in("module_id", moduleIds)
      .order("due_date", { ascending: false });

    // Get my submissions
    const { data: subs } = await supabase
      .from("submissions")
      .select("*")
      .eq("student_id", user!.id);

    const subMap: any = {};
    subs?.forEach((s: any) => { subMap[s.assignment_id] = s; });

    setAssignments(
      (asgns || []).map((a: any) => ({
        ...a,
        mySubmission: subMap[a.id],
        module: modules?.find((m: any) => m.id === a.module_id),
      }))
    );
    setLoading(false);
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Assignments</h1>

      {assignments.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Assignments</h3>
          <p className="text-slate-500">You don&apos;t have any assignments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((asgn: any) => {
            const sub = asgn.mySubmission;
            const isOverdue = !sub && new Date(asgn.due_date) < new Date();

            return (
              <div key={asgn.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-900">{asgn.title}</h3>
                      {sub ? (
                        <Badge variant={sub.status === "graded" ? "green" : "blue"}>
                          {sub.status === "graded" ? "Graded" : "Submitted"}
                        </Badge>
                      ) : isOverdue ? (
                        <Badge variant="red">Overdue</Badge>
                      ) : (
                        <Badge variant="amber">Pending</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{asgn.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Due: {formatDateTime(asgn.due_date)}</span>
                      <span>•</span>
                      <span>Module: {asgn.module?.title || "Unknown"}</span>
                    </div>
                    {sub?.feedback && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="text-xs font-medium text-blue-700 mb-1">Feedback:</p>
                        <p className="text-sm text-blue-900">{sub.feedback}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {sub?.status === "graded" && (
                      <div>
                        <span className="text-3xl font-bold text-green-600">{sub.grade}</span>
                        <p className="text-xs text-slate-500 mt-1">out of 100</p>
                      </div>
                    )}
                    {!sub && !isOverdue && (
                      <a
                        href={`/dashboard/student/assignments/${asgn.id}/submit`}
                        className="btn-primary text-sm"
                      >
                        Submit
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
