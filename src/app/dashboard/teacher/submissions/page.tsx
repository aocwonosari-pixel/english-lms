"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, MessageSquare } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function TeacherSubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    setLoading(true);
    const { data } = await supabase
      .from("submissions")
      .select("*, assignments(*, modules(*, courses(*))), users!submissions_student_id_fkey(full_name, email)")
      .order("submitted_at", { ascending: false });
    setSubmissions(data || []);
    setLoading(false);
  }

  function openGrading(sub: any) {
    setSelectedSub(sub);
    setGradeForm({
      grade: sub.grade?.toString() || "",
      feedback: sub.feedback || "",
    });
  }

  async function submitGrade(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await supabase
      .from("submissions")
      .update({
        grade: parseFloat(gradeForm.grade),
        feedback: gradeForm.feedback,
        status: "graded",
      })
      .eq("id", selectedSub.id);
    setSelectedSub(null);
    await loadSubmissions();
    setSubmitting(false);
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const pendingCount = submissions.filter((s: any) => s.status !== "graded").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Submissions
        {pendingCount > 0 && <span className="ml-2 badge-amber">{pendingCount} pending</span>}
      </h1>

      {submissions.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Submissions Yet</h3>
          <p className="text-slate-500">Student submissions will appear here.</p>
        </div>
      ) : (
        <Table headers={["Student", "Assignment", "Course", "Status", "Grade", "Submitted", "Actions"]}>
          {submissions.map((sub: any) => (
            <TableRow key={sub.id}>
              <TableCell><span className="font-medium">{sub.users?.full_name || "Unknown"}</span></TableCell>
              <TableCell><span className="text-sm">{sub.assignments?.title}</span></TableCell>
              <TableCell><span className="text-sm">{sub.assignments?.modules?.courses?.title}</span></TableCell>
              <TableCell>
                <Badge variant={sub.status === "graded" ? "green" : sub.status === "late" ? "red" : "blue"}>
                  {sub.status}
                </Badge>
              </TableCell>
              <TableCell>
                {sub.grade !== null ? (
                  <span className="font-bold text-green-600">{sub.grade}</span>
                ) : <span className="text-slate-400">-</span>}
              </TableCell>
              <TableCell><span className="text-sm">{formatDateTime(sub.submitted_at)}</span></TableCell>
              <TableCell>
                <button onClick={() => openGrading(sub)} className="btn-primary text-xs px-3 py-1.5">
                  {sub.status === "graded" ? "Edit Grade" : "Grade"}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Grading Modal */}
      <Modal open={!!selectedSub} onClose={() => setSelectedSub(null)} title="Grade Submission" size="lg">
        {selectedSub && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-900">{selectedSub.assignments?.title}</p>
              <p className="text-sm text-slate-500">{selectedSub.assignments?.modules?.courses?.title}</p>
              <p className="text-xs text-slate-400 mt-1">Student: {selectedSub.users?.full_name}</p>
            </div>

            {selectedSub.submission_text && (
              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-2">Submission:</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedSub.submission_text}</p>
              </div>
            )}

            {selectedSub.file_url && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Attached File:</p>
                <a href={selectedSub.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <FileText className="w-4 h-4" /> View file
                </a>
              </div>
            )}

            <form onSubmit={submitGrade} className="space-y-4 pt-2">
              <Input
                label="Grade (0-100)"
                type="number"
                min="0"
                max="100"
                value={gradeForm.grade}
                onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                required
              />
              <Textarea
                label="Feedback"
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                placeholder="Write feedback for the student..."
                rows={4}
              />
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => setSelectedSub(null)}>Cancel</Button>
                <Button type="submit" loading={submitting}>
                  <CheckCircle className="w-4 h-4" /> Save Grade
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
