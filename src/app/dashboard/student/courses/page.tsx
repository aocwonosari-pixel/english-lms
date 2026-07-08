"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { BookOpen, ExternalLink, FileText, AudioLines } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function StudentCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    loadCourses();
  }, [user?.id]);

  async function loadCourses() {
    setLoading(true);
    const { data } = await supabase
      .from("course_enrollments")
      .select("course_id, courses(*)")
      .eq("student_id", user!.id);

    const enrolled = data?.map((e: any) => e.courses).filter(Boolean) || [];
    setCourses(enrolled);
    setLoading(false);
  }

  async function selectCourse(course: any) {
    setSelectedCourse(course);
    const { data: mods } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", course.id)
      .order("sequence_number");

    setModules(mods || []);

    // Get assignments for these modules
    const moduleIds = mods?.map((m: any) => m.id) || [];
    if (moduleIds.length > 0) {
      const { data: asgns } = await supabase
        .from("assignments")
        .select("*")
        .in("module_id", moduleIds)
        .order("due_date");

      // Get submission status for each
      const { data: subs } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", user!.id)
        .in("assignment_id", asgns?.map((a: any) => a.id) || []);

      const subMap: any = {};
      subs?.forEach((s: any) => { subMap[s.assignment_id] = s; });

      setAssignments((asgns || []).map((a: any) => ({ ...a, mySubmission: subMap[a.id] })));
    } else {
      setAssignments([]);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Courses</h1>

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Courses Enrolled</h3>
          <p className="text-slate-500">Contact your administrator to enroll in a course.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Course list */}
          <div className="lg:col-span-1 space-y-3">
            {courses.map((course: any) => (
              <div
                key={course.id}
                onClick={() => selectCourse(course)}
                className={`card p-4 cursor-pointer transition-all ${selectedCourse?.id === course.id ? "ring-2 ring-blue-500 border-blue-500" : "hover:border-slate-300"}`}
              >
                <h3 className="font-semibold text-slate-900 mb-1">{course.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{course.description || "No description"}</p>
              </div>
            ))}
          </div>

          {/* Course detail */}
          <div className="lg:col-span-2">
            {selectedCourse ? (
              <div className="space-y-6">
                {/* Modules */}
                <div className="card">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-900">Modules</h2>
                  </div>
                  <div className="p-6">
                    {modules.length === 0 ? (
                      <p className="text-slate-500 text-sm">No modules available yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {modules.map((mod: any) => (
                          <div key={mod.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                            <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                              {mod.sequence_number}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 text-sm">{mod.title}</p>
                            </div>
                            {mod.content_url && (
                              <a
                                href={mod.content_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                              >
                                {mod.content_url.toLowerCase().endsWith(".pdf") ? (
                                  <FileText className="w-4 h-4" />
                                ) : (
                                  <AudioLines className="w-4 h-4" />
                                )}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignments */}
                <div className="card">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-900">Assignments</h2>
                  </div>
                  <div className="p-6">
                    {assignments.length === 0 ? (
                      <p className="text-slate-500 text-sm">No assignments available yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {assignments.map((asgn: any) => (
                          <div key={asgn.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900">{asgn.title}</p>
                                <p className="text-sm text-slate-500 mt-1">{asgn.description}</p>
                                <p className="text-xs text-slate-400 mt-2">Due: {formatDate(asgn.due_date)}</p>
                              </div>
                              <div className="text-right shrink-0">
                                {asgn.mySubmission ? (
                                  asgn.mySubmission.status === "graded" ? (
                                    <div>
                                      <span className="text-lg font-bold text-green-600">{asgn.mySubmission.grade}</span>
                                      <p className="text-xs text-green-600">Graded</p>
                                    </div>
                                  ) : (
                                    <span className="badge-blue">Submitted</span>
                                  )
                                ) : new Date(asgn.due_date) < new Date() ? (
                                  <span className="badge-red">Overdue</span>
                                ) : (
                                  <a
                                    href={`/dashboard/student/assignments/${asgn.id}/submit`}
                                    className="btn-primary text-xs px-3 py-1.5"
                                  >
                                    Submit
                                  </a>
                                )}
                              </div>
                            </div>
                            {asgn.mySubmission?.feedback && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                <p className="text-xs font-medium text-blue-700 mb-1">Teacher Feedback:</p>
                                <p className="text-sm text-blue-900">{asgn.mySubmission.feedback}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">Select a course to view modules and assignments</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
