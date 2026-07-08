-- ================================================
-- ENGLISH LMS - SUPABASE DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Users Table (Extension of Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Modules Table
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_url TEXT,
    sequence_number INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url TEXT,
    grade DECIMAL(5,2),
    feedback TEXT,
    status VARCHAR(50) CHECK (status IN ('submitted', 'graded', 'late')) DEFAULT 'submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(assignment_id, student_id)
);

-- 6. Course Enrollments Table
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(course_id, student_id)
);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS VARCHAR(50) AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to check if user is teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- USERS policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all users"
  ON public.users FOR SELECT
  USING (public.is_admin() = TRUE);

CREATE POLICY "Admin can insert users"
  ON public.users FOR INSERT
  WITH CHECK (public.is_admin() = TRUE);

CREATE POLICY "Admin can update users"
  ON public.users FOR UPDATE
  USING (public.is_admin() = TRUE);

CREATE POLICY "Admin can delete users"
  ON public.users FOR DELETE
  USING (public.is_admin() = TRUE);

-- COURSES policies
CREATE POLICY "Everyone can view courses"
  ON public.courses FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin can insert courses"
  ON public.courses FOR INSERT
  WITH CHECK (public.is_admin() = TRUE);

CREATE POLICY "Admin can update courses"
  ON public.courses FOR UPDATE
  USING (public.is_admin() = TRUE);

CREATE POLICY "Admin can delete courses"
  ON public.courses FOR DELETE
  USING (public.is_admin() = TRUE);

-- MODULES policies
CREATE POLICY "Everyone can view modules"
  ON public.modules FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin/Teacher can insert modules"
  ON public.modules FOR INSERT
  WITH CHECK (public.is_admin() = TRUE OR public.is_teacher() = TRUE);

CREATE POLICY "Admin/Teacher can update modules"
  ON public.modules FOR UPDATE
  USING (public.is_admin() = TRUE OR public.is_teacher() = TRUE);

CREATE POLICY "Admin/Teacher can delete modules"
  ON public.modules FOR DELETE
  USING (public.is_admin() = TRUE OR public.is_teacher() = TRUE);

-- ASSIGNMENTS policies
CREATE POLICY "Everyone can view assignments"
  ON public.assignments FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin/Teacher can insert assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (public.is_admin() = TRUE OR public.is_teacher() = TRUE);

CREATE POLICY "Admin/Teacher can update assignments"
  ON public.assignments FOR UPDATE
  USING (public.is_admin() = TRUE OR public.is_teacher() = TRUE);

CREATE POLICY "Admin/Teacher can delete assignments"
  ON public.assignments FOR DELETE
  USING (public.is_admin() = TRUE OR public.is_teacher() = TRUE);

-- SUBMISSIONS policies
CREATE POLICY "Students can view their own submissions"
  ON public.submissions FOR SELECT
  USING (auth.uid() = student_id OR public.is_admin() = TRUE OR public.is_teacher() = TRUE);

CREATE POLICY "Students can insert their own submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own unsubmitted submissions"
  ON public.submissions FOR UPDATE
  USING (auth.uid() = student_id AND status = 'submitted');

CREATE POLICY "Teachers can view and update submissions for their courses"
  ON public.submissions FOR SELECT
  USING (TRUE);
CREATE POLICY "Teachers can update all submissions (for grading)"
  ON public.submissions FOR UPDATE
  USING (public.is_admin() = TRUE OR public.is_teacher() = TRUE);

-- COURSE ENROLLMENTS policies
CREATE POLICY "Everyone can view enrollments"
  ON public.course_enrollments FOR SELECT
  USING (TRUE);

CREATE POLICY "Admin can manage enrollments"
  ON public.course_enrollments FOR ALL
  USING (public.is_admin() = TRUE);

-- ================================================
-- STORAGE BUCKETS
-- ================================================
-- Run these in Supabase Dashboard > Storage or via API:
-- 1. Create bucket "materials" (public: false, for PDF/Audio)
-- 2. Create bucket "student_files" (public: false, for student submissions)

-- Storage policies for materials bucket
CREATE POLICY "Teachers can upload materials"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'materials' AND (public.is_admin() = TRUE OR public.is_teacher() = TRUE));

CREATE POLICY "Everyone can view materials"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'materials');

CREATE POLICY "Teachers can delete materials"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'materials' AND (public.is_admin() = TRUE OR public.is_teacher() = TRUE));

-- Storage policies for student_files bucket
CREATE POLICY "Students can upload their files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'student_files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Students can view their own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'student_files' AND auth.uid() = owner);

CREATE POLICY "Students can delete their own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'student_files' AND auth.uid() = owner);

-- ================================================
-- ADDITIONAL HELPER FUNCTIONS
-- ================================================

-- Function to get courses for a student (enrolled courses)
CREATE OR REPLACE FUNCTION public.get_student_courses(student_uuid UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
  SELECT c.id, c.title, c.description, c.created_at
  FROM public.courses c
  INNER JOIN public.course_enrollments e ON e.course_id = c.id
  WHERE e.student_id = student_uuid
  ORDER BY c.created_at DESC;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to get modules for a course
CREATE OR REPLACE FUNCTION public.get_course_modules(course_uuid UUID)
RETURNS TABLE (
  id UUID,
  course_id UUID,
  title VARCHAR(255),
  content_url TEXT,
  sequence_number INT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
  SELECT id, course_id, title, content_url, sequence_number, created_at
  FROM public.modules
  WHERE course_id = course_uuid
  ORDER BY sequence_number ASC;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- WEBHOOK-READY STRUCTURE
-- The submissions table is designed to be queried
-- by external tools like n8n for WhatsApp reminders.
-- Example: SELECT * FROM submissions WHERE status = 'submitted'
-- ================================================
