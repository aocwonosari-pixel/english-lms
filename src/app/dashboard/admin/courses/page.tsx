"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Table, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Trash2, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: "", description: "" });
  const [enrollForm, setEnrollForm] = useState({ student_id: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCourses();
    loadStudents();
  }, []);

  async function loadCourses() {
    setLoading(true);
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  }

  async function loadStudents() {
    const { data } = await supabase.from("users").select("*").eq("role", "student").order("full_name");
    setStudents(data || []);
  }

  async function selectCourse(course: any) {
    setSelectedCourse(course);
    const { data } = await supabase
      .from("course_enrollments")
      .select("*, users!course_enrollments_student_id_fkey(full_name, email)")
      .eq("course_id", course.id);
    setEnrollments(data || []);
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from("courses").insert(courseForm);
    setShowCourseModal(false);
    setCourseForm({ title: "", description: "" });
    await loadCourses();
    setSubmitting(false);
  }

  async function deleteCourse(id: string) {
    if (!confirm("Delete this course?")) return;
    await supabase.from("courses").delete().eq("id", id);
    if (selectedCourse?.id === id) setSelectedCourse(null);
    await loadCourses();
  }

  async function enrollStudent(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("course_enrollments").insert({
      course_id: selectedCourse.id,
      student_id: enrollForm.student_id,
    });
    if (error && error.code !== "23505") alert(error.message);
    setShowEnrollModal(false);
    setEnrollForm({ student_id: "" });
    await selectCourse(selectedCourse);
    setSubmitting(false);
  }

  async function removeEnrollment(enrollmentId: string) {
    if (!confirm("Remove this student from the course?")) return;
    await supabase.from("course_enrollments").delete().eq("id", enrollmentId);
    await selectCourse(selectedCourse);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Courses & Enrollments</h1>
        <Button onClick={() => setShowCourseModal(true)}>
          <Plus className="w-4 h-4" /> New Course
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Courses</h3>
          <p className="text-slate-500 mb-4">Create a course to get started.</p>
          <Button onClick={() => setShowCourseModal(true)}><Plus className="w-4 h-4" /> Create Course</Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            {courses.map((course: any) => (
              <div
                key={course.id}
                onClick={() => selectCourse(course)}
                className={`card p-4 cursor-pointer transition-all ${selectedCourse?.id === course.id ? "ring-2 ring-blue-500 border-blue-500" : "hover:border-slate-300"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{course.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{course.description || "No description"}</p>
                    <p className="text-xs text-slate-400 mt-2">{formatDate(course.created_at)}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteCourse(course.id); }} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedCourse ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">
                    Enrolled Students ({enrollments.length})
                  </h2>
                  <Button size="sm" onClick={() => setShowEnrollModal(true)}>
                    <Users className="w-4 h-4" /> Enroll Student
                  </Button>
                </div>
                {enrollments.length === 0 ? (
                  <div className="card p-8 text-center text-slate-500">No students enrolled yet.</div>
                ) : (
                  <Table headers={["Student", "Email", "Enrolled Date", "Actions"]}>
                    {enrollments.map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell><span className="font-medium">{e.users?.full_name}</span></TableCell>
                        <TableCell><span className="text-sm text-slate-600">{e.users?.email}</span></TableCell>
                        <TableCell><span className="text-sm text-slate-500">{formatDate(e.created_at)}</span></TableCell>
                        <TableCell>
                          <button onClick={() => removeEnrollment(e.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Table>
                )}
              </div>
            ) : (
              <div className="card p-12 text-center text-slate-500">Select a course to manage enrollments</div>
            )}
          </div>
        </div>
      )}

      {/* New Course Modal */}
      <Modal open={showCourseModal} onClose={() => setShowCourseModal(false)} title="Create New Course">
        <form onSubmit={createCourse} className="space-y-4">
          <Input label="Course Title" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="e.g., Basic English Batch 1" required />
          <Textarea label="Description" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course description..." rows={3} />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCourseModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create</Button>
          </div>
        </form>
      </Modal>

      {/* Enroll Modal */}
      <Modal open={showEnrollModal} onClose={() => setShowEnrollModal(false)} title={`Enroll Student to ${selectedCourse?.title}`}>
        <form onSubmit={enrollStudent} className="space-y-4">
          <Select
            label="Student"
            value={enrollForm.student_id}
            onChange={(e) => setEnrollForm({ ...enrollForm, student_id: e.target.value })}
            options={students.map((s: any) => ({ value: s.id, label: s.full_name }))}
            placeholder="Select student"
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowEnrollModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Enroll</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
