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
import { FileText, Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function TeacherAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ module_id: "", title: "", description: "", due_date: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAssignments();
    loadCourses();
  }, []);

  async function loadAssignments() {
    const { data } = await supabase
      .from("assignments")
      .select("*, modules(*, courses(*))")
      .order("created_at", { ascending: false });
    setAssignments(data || []);
  }

  async function loadCourses() {
    const { data } = await supabase.from("courses").select("*").order("title");
    setCourses(data || []);
    if (data?.length) {
      await loadModules(data[0].id);
    }
    setLoading(false);
  }

  async function loadModules(courseId: string) {
    const { data } = await supabase
      .from("modules")
      .select("*, courses(*)")
      .eq("course_id", courseId)
      .order("sequence_number");
    setModules(data || []);
  }

  async function handleCourseChange(courseId: string) {
    await loadModules(courseId);
    setForm({ ...form, module_id: "" });
  }

  async function createAssignment(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from("assignments").insert({
      module_id: form.module_id,
      title: form.title,
      description: form.description,
      due_date: new Date(form.due_date).toISOString(),
    });
    setShowModal(false);
    setForm({ module_id: "", title: "", description: "", due_date: "" });
    await loadAssignments();
    setSubmitting(false);
  }

  async function deleteAssignment(id: string) {
    if (!confirm("Delete this assignment?")) return;
    await supabase.from("assignments").delete().eq("id", id);
    await loadAssignments();
  }

  // Set default due date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  const defaultDue = tomorrow.toISOString().slice(0, 16);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Create Assignment
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : assignments.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Assignments</h3>
          <p className="text-slate-500 mb-4">Create your first assignment.</p>
          <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Create Assignment</Button>
        </div>
      ) : (
        <Table headers={["Title", "Module", "Course", "Due Date", "Actions"]}>
          {assignments.map((asgn: any) => (
            <TableRow key={asgn.id}>
              <TableCell><span className="font-medium">{asgn.title}</span></TableCell>
              <TableCell>{asgn.modules?.title}</TableCell>
              <TableCell>{asgn.modules?.courses?.title}</TableCell>
              <TableCell>{formatDate(asgn.due_date)}</TableCell>
              <TableCell>
                <button onClick={() => deleteAssignment(asgn.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Assignment" size="lg">
        <form onSubmit={createAssignment} className="space-y-4">
          <Select
            label="Course"
            options={courses.map((c: any) => ({ value: c.id, label: c.title }))}
            placeholder="Select course"
            onChange={(e) => handleCourseChange(e.target.value)}
          />
          <Select
            label="Module"
            options={modules.map((m: any) => ({ value: m.id, label: m.title }))}
            placeholder="Select module"
            value={form.module_id}
            onChange={(e) => setForm({ ...form, module_id: e.target.value })}
          />
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment title" required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Assignment instructions..." rows={4} />
          <Input label="Due Date" type="datetime-local" value={form.due_date || defaultDue} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
