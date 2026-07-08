"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, Upload, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SubmitAssignment({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [assignment, setAssignment] = useState<any>(null);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    loadData();
  }, [user?.id, resolvedParams.id]);

  async function loadData() {
    setLoading(true);
    const { data: asgn } = await supabase
      .from("assignments")
      .select("*, modules(*, courses(*))")
      .eq("id", resolvedParams.id)
      .single();

    if (asgn) setAssignment(asgn);

    const { data: sub } = await supabase
      .from("submissions")
      .select("*")
      .eq("assignment_id", resolvedParams.id)
      .eq("student_id", user!.id)
      .single();

    if (sub) {
      setExistingSubmission(sub);
      setText(sub.submission_text || "");
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !file) {
      setError("Please provide text or upload a file.");
      return;
    }
    setSubmitting(true);
    setError("");

    let fileUrl = existingSubmission?.file_url || null;

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/${resolvedParams.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("student_files")
        .upload(path, file);

      if (uploadError) {
        setError("Failed to upload file. Please try again.");
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("student_files").getPublicUrl(path);
      fileUrl = urlData.publicUrl;
    }

    const isLate = new Date(assignment.due_date) < new Date();
    const status = isLate ? "late" : "submitted";

    if (existingSubmission) {
      await supabase
        .from("submissions")
        .update({
          submission_text: text,
          file_url: fileUrl,
          status,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", existingSubmission.id);
    } else {
      await supabase.from("submissions").insert({
        assignment_id: resolvedParams.id,
        student_id: user!.id,
        submission_text: text,
        file_url: fileUrl,
        status,
      });
    }

    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => router.push("/dashboard/student/assignments"), 1500);
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!assignment) {
    return <div className="text-center py-20 text-slate-500">Assignment not found.</div>;
  }

  const isOverdue = new Date(assignment.due_date) < new Date() && !existingSubmission;

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/student/assignments" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Assignments
      </Link>

      <div className="card mb-6">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-bold text-slate-900">{assignment.title}</h1>
            {isOverdue && <span className="badge-red">Overdue</span>}
          </div>
          <p className="text-slate-600 mb-3">{assignment.description}</p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>📅 Due: {formatDateTime(assignment.due_date)}</span>
            <span>📚 {assignment.modules?.title}</span>
            <span>📁 {assignment.modules?.courses?.title}</span>
          </div>
        </div>
      </div>

      {success ? (
        <div className="card p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Submission Received!</h2>
          <p className="text-slate-500">Your assignment has been submitted successfully.</p>
        </div>
      ) : existingSubmission ? (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Your Submission</h2>
          {existingSubmission.status === "graded" ? (
            <div className="mb-4 p-4 bg-green-50 rounded-lg text-center">
              <span className="text-4xl font-bold text-green-600">{existingSubmission.grade}</span>
              <p className="text-sm text-slate-500 mt-1">Grade Received</p>
            </div>
          ) : (
            <span className="badge-blue mb-4 inline-block">Already Submitted</span>
          )}
          {existingSubmission.submission_text && (
            <div className="p-4 bg-slate-50 rounded-lg mb-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{existingSubmission.submission_text}</p>
            </div>
          )}
          {existingSubmission.submission_text && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                label="Update your answer"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="Update your submission..."
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload new file (optional)</label>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" loading={submitting}>Update Submission</Button>
            </form>
          )}
        </div>
      ) : (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Submit Your Answer</h2>
          {isOverdue && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              ⚠️ This assignment is overdue. You can still submit but it will be marked as late.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              label="Your Answer"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder="Type your answer here..."
              required={!file}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Or Upload File (PDF/Image)</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={submitting}>
              Submit Assignment
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
