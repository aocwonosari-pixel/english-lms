"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableRow, TableCell } from "@/components/ui/table";
import { BookOpen, Plus, Trash2, FileText, AudioLines } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function TeacherCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: "", description: "" });
  const [moduleForm, setModuleForm] = useState({ title: "", sequence_number: "", content_url: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    setLoading(true);
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  }

  async function selectCourse(course: any) {
    setSelectedCourse(course);
    const { data } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", course.id)
      .order("sequence_number");
    setModules(data || []);
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

  async function createModule(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from("modules").insert({
      ...moduleForm,
      course_id: selectedCourse.id,
      sequence_number: parseInt(moduleForm.sequence_number),
    });
    setShowModuleModal(false);
    setModuleForm({ title: "", sequence_number: "", content_url: "" });
    await selectCourse(selectedCourse);
    setSubmitting(false);
  }

  async function deleteCourse(courseId: string) {
    if (!confirm("Delete this course and all its modules?")) return;
    await supabase.from("courses").delete().eq("id", courseId);
    if (selectedCourse?.id === courseId) setSelectedCourse(null);
    await loadCourses();
  }

  async function deleteModule(moduleId: string) {
    if (!confirm("Delete this module?")) return;
    await supabase.from("modules").delete().eq("id", moduleId);
    await selectCourse(selectedCourse);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Courses & Modules</h1>
        <Button onClick={() => setShowCourseModal(true)}>
          <Plus className="w-4 h-4" /> New Course
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Courses Yet</h3>
          <p className="text-slate-500 mb-4">Create your first course to get started.</p>
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
                  <div className="flex-1 min-w-0">
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
                  <h2 className="font-semibold text-slate-900">Modules in: {selectedCourse.title}</h2>
                  <Button size="sm" onClick={() => setShowModuleModal(true)}>
                    <Plus className="w-4 h-4" /> Add Module
                  </Button>
                </div>
                {modules.length === 0 ? (
                  <div className="card p-8 text-center text-slate-500">No modules yet. Add your first module.</div>
                ) : (
                  modules.map((mod: any) => (
                    <div key={mod.id} className="card p-4 flex items-center gap-4">
                      <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {mod.sequence_number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">{mod.title}</p>
                        {mod.content_url && (
                          <a href={mod.content_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                            {mod.content_url.toLowerCase().endsWith(".pdf") ? <FileText className="w-3 h-3" /> : <AudioLines className="w-3 h-3" />}
                            View material
                          </a>
                        )}
                      </div>
                      <button onClick={() => deleteModule(mod.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="card p-12 text-center text-slate-500">Select a course to manage its modules</div>
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
            <Button type="submit" loading={submitting}>Create Course</Button>
          </div>
        </form>
      </Modal>

      {/* New Module Modal */}
      <Modal open={showModuleModal} onClose={() => setShowModuleModal(false)} title={`Add Module to ${selectedCourse?.title}`}>
        <form onSubmit={createModule} className="space-y-4">
          <Input label="Module Title" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} placeholder="e.g., Lesson 1 - Greetings" required />
          <Input label="Sequence Number" type="number" min="1" value={moduleForm.sequence_number} onChange={(e) => setModuleForm({ ...moduleForm, sequence_number: e.target.value })} required />
          <Input label="Material URL (optional)" value={moduleForm.content_url} onChange={(e) => setModuleForm({ ...moduleForm, content_url: e.target.value })} placeholder="https://...pdf or audio file URL" />
          <p className="text-xs text-slate-500">You can also upload PDF/audio files later in Supabase Storage.</p>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModuleModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Add Module</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
