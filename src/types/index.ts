export type UserRole = "admin" | "teacher" | "student" | "parent";

export type AppUser = {
  id: string;
  national_id: string;
  full_name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  class_id?: string;
  avatar_url?: string;
};

export type Class = {
  id: string;
  name: string;
  grade: string;
  section: string;
  track: string;
  academic_year: string;
};

export type Subject = {
  id: string;
  name: string;
  class_id: string;
};

export type Grade = {
  id: string;
  student_national_id: string;
  subject_id: string;
  teacher_id: string;
  marks_obtained: number;
  max_marks: number;
  term: string;
  exam_type: string;
  created_at: string;
  subjects?: { name: string };
};

export type Attendance = {
  id: string;
  student_national_id: string;
  class_id: string;
  date: string;
  status: "حاضر" | "غائب" | "متأخر" | "مستأذن";
  notes?: string;
  recorded_by?: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  type: "exam" | "homework" | "announcement" | "grade" | "attendance" | "general";
  target_role: string;
  target_class_id?: string;
  created_at: string;
};

export type TeacherClassSubject = {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  classes?: Class;
  subjects?: Subject;
};
