"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollForm, setEnrollForm] = useState({ student_id: "", course_id: "" });
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "student" });
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<"all" | "students" | "teachers">("all");

  useEffect(() => {
    loadUsers();
    loadMeta();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function loadMeta() {
    const { data: stds } = await supabase.from("users").select("*").eq("role", "student").order("full_name");
    const { data: crs } = await supabase.from("courses").select("*").order("title");
    setStudents(stds || []);
    setCourses(crs || []);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.admin.createUser({
      email: form.email,
      password: form.password,
      email_confirm: true,
      user_metadata: { full_name: form.full_name },
    });
    if (error) {
      alert(error.message);
    } else {
      setShowModal(false);
      setForm({ email: "", password: "", full_name: "", role: "student" });
      await loadUsers();
    }
    setSubmitting(false);
  }

  async function deleteUser(userId: string) {
    if (userId === user?.id) { alert("Cannot delete yourself."); return; }
    if (!confirm("Delete this user?")) return;
    await supabase.from("users").delete().eq("id", userId);
    await loadUsers();
  }

  async function enrollStudent(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("course_enrollments").insert(enrollForm);
    if (error && error.code !== "23505") alert(error.message);
    setShowEnrollModal(false);
    setEnrollForm({ student_id: "", course_id: "" });
    setSubmitting(false);
  }

  const filtered = users.filter((u: any) => {
    if (tab === "students") return u.role === "student";
    if (tab === "teachers") return u.role === "teacher";
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowEnrollModal(true)} variant="secondary">
            <Users className="w-4 h-4" /> Enroll Student
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "students", "teachers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "all" && ` (${users.length})`}
            {t === "students" && ` (${users.filter((u: any) => u.role === "student").length})`}
            {t === "teachers" && ` (${users.filter((u: any) => u.role === "teacher").length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <Table headers={["Name", "Email", "Role", "Joined", "Actions"]}>
          {filtered.map((u: any) => (
            <TableRow key={u.id}>
              <TableCell><span className="font-medium">{u.full_name}</span></TableCell>
              <TableCell><span className="text-sm text-slate-600">{u.email}</span></TableCell>
              <TableCell>
                <Badge variant={u.role === "admin" ? "blue" : u.role === "teacher" ? "green" : "slate"}>
                  {u.role}
                </Badge>
              </TableCell>
              <TableCell><span className="text-sm text-slate-500">{formatDate(u.created_at)}</span></TableCell>
              <TableCell>
                <button onClick={() => deleteUser(u.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Add User Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New User">
        <form onSubmit={createUser} className="space-y-4">
          <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" required />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: "student", label: "Student" },
              { value: "teacher", label: "Teacher" },
              { value: "admin", label: "Admin" },
            ]}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create User</Button>
          </div>
        </form>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal open={showEnrollModal} onClose={() => setShowEnrollModal(false)} title="Enroll Student to Course">
        <form onSubmit={enrollStudent} className="space-y-4">
          <Select
            label="Student"
            value={enrollForm.student_id}
            onChange={(e) => setEnrollForm({ ...enrollForm, student_id: e.target.value })}
            options={students.map((s: any) => ({ value: s.id, label: s.full_name }))}
            placeholder="Select student"
          />
          <Select
            label="Course"
            value={enrollForm.course_id}
            onChange={(e) => setEnrollForm({ ...enrollForm, course_id: e.target.value })}
            options={courses.map((c: any) => ({ value: c.id, label: c.title }))}
            placeholder="Select course"
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
