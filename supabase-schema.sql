-- ============================================================
-- مدرسة الرفعة النموذجية — Supabase Schema
-- نفذ هذا الملف في Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users (يشمل طلاب، معلمين، مدير) ──────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  national_id   TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin','teacher','student','parent')),
  password_hash TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  class_id      UUID,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Classes ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  grade         TEXT NOT NULL,
  section       TEXT NOT NULL,
  track         TEXT NOT NULL DEFAULT 'عام',
  academic_year TEXT NOT NULL DEFAULT '2025/2026',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Subjects ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  class_id   UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Teacher assignments ────────────────────────────────────
CREATE TABLE IF NOT EXISTS teacher_class_subjects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id    UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id  UUID REFERENCES subjects(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (teacher_id, class_id, subject_id)
);

-- ─── Student profiles (view-like table) ─────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
  national_id  TEXT PRIMARY KEY REFERENCES users(national_id),
  full_name    TEXT NOT NULL,
  class_id     UUID REFERENCES classes(id),
  phone        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Grades ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grades (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_national_id  TEXT REFERENCES users(national_id) ON DELETE CASCADE,
  subject_id           UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id           UUID REFERENCES users(id),
  marks_obtained       NUMERIC(5,2) NOT NULL,
  max_marks            NUMERIC(5,2) NOT NULL DEFAULT 100,
  term                 TEXT NOT NULL,  -- الفصل الأول / الثاني / الثالث
  exam_type            TEXT NOT NULL,  -- اختبار تحريري / واجب / ...
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Attendance ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_national_id  TEXT REFERENCES users(national_id) ON DELETE CASCADE,
  class_id             UUID REFERENCES classes(id) ON DELETE CASCADE,
  date                 DATE NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('حاضر','غائب','متأخر','مستأذن')),
  notes                TEXT,
  recorded_by          UUID REFERENCES users(id),
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_national_id, class_id, date)
);

-- ─── Lessons ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  content      TEXT,
  subject_id   UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id   UUID REFERENCES users(id),
  class_id     UUID REFERENCES classes(id),
  order_index  INT DEFAULT 1,
  is_published BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Lesson files ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_files (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id  UUID REFERENCES lessons(id) ON DELETE CASCADE,
  file_url   TEXT NOT NULL,
  file_name  TEXT NOT NULL,
  file_type  TEXT NOT NULL,
  file_size  BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Homework ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homework (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  subject_id  UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id  UUID REFERENCES users(id),
  class_id    UUID REFERENCES classes(id),
  due_date    DATE NOT NULL,
  max_grade   NUMERIC(5,2) DEFAULT 100,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Homework submissions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS homework_submissions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  homework_id          UUID REFERENCES homework(id) ON DELETE CASCADE,
  student_national_id  TEXT REFERENCES users(national_id),
  file_url             TEXT,
  text_answer          TEXT,
  grade                NUMERIC(5,2),
  feedback             TEXT,
  submitted_at         TIMESTAMPTZ DEFAULT NOW(),
  graded_at            TIMESTAMPTZ
);

-- ─── Exams ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exams (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  subject_id       UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id       UUID REFERENCES users(id),
  class_id         UUID REFERENCES classes(id),
  duration_minutes INT DEFAULT 60,
  start_time       TIMESTAMPTZ,
  end_time         TIMESTAMPTZ,
  max_grade        NUMERIC(5,2) DEFAULT 100,
  is_published     BOOLEAN DEFAULT FALSE,
  instructions     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Questions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id       UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice','true_false','short_answer','essay')),
  points        NUMERIC(5,2) DEFAULT 5,
  order_index   INT DEFAULT 1,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Options ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS options (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct  BOOLEAN DEFAULT FALSE,
  order_index INT DEFAULT 1
);

-- ─── Exam results ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_results (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id              UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_national_id  TEXT REFERENCES users(national_id),
  total_grade          NUMERIC(5,2) DEFAULT 0,
  percentage           NUMERIC(5,2) DEFAULT 0,
  status               TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','graded')),
  started_at           TIMESTAMPTZ DEFAULT NOW(),
  submitted_at         TIMESTAMPTZ
);

-- ─── Notifications ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'general',
  target_role     TEXT NOT NULL DEFAULT 'all',
  target_class_id UUID REFERENCES classes(id),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notification reads ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_reads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL,
  read_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (notification_id, user_id)
);

-- ─── Schedules ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id    UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id  UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id  UUID REFERENCES users(id),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  room        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS Policies (enable RLS) ──────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow anon to read users for login
CREATE POLICY "allow_login_check" ON users
  FOR SELECT USING (true);

-- Allow all operations with service role (handled via Supabase dashboard)
CREATE POLICY "allow_all_grades" ON grades FOR ALL USING (true);
CREATE POLICY "allow_all_attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "allow_all_notifications" ON notifications FOR ALL USING (true);

-- ─── Sample data ────────────────────────────────────────────
-- Admin user (password: admin123)
INSERT INTO users (national_id, full_name, role, password_hash)
VALUES ('1000000001', 'مدير المدرسة', 'admin', 'admin123')
ON CONFLICT (national_id) DO NOTHING;
