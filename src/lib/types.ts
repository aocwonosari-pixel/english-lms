import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  content_url: string | null;
  sequence_number: number;
  created_at: string;
  // joined fields
  course_title?: string;
}

export interface Assignment {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  due_date: string;
  created_at: string;
  // joined fields
  module_title?: string;
  course_id?: string;
  course_title?: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text: string | null;
  file_url: string | null;
  grade: number | null;
  feedback: string | null;
  status: "submitted" | "graded" | "late";
  submitted_at: string;
  // joined fields
  student_name?: string;
  assignment_title?: string;
  module_title?: string;
  course_title?: string;
}

// Course enrollment type
export interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  created_at: string;
  // joined
  course_title?: string;
  student_name?: string;
}
