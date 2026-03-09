# مدرسة الرفعة النموذجية 🏫

نظام إدارة مدرسي متكامل مبني بـ Next.js 14 + Supabase.

## هيكل المشروع

```
src/
├── app/
│   ├── auth/login/        ← صفحة تسجيل الدخول
│   ├── student/           ← لوحة الطالب
│   │   ├── page.tsx       ← Dashboard
│   │   ├── grades/        ← الدرجات
│   │   ├── attendance/    ← الحضور
│   │   ├── lessons/       ← الدروس
│   │   ├── homework/      ← الواجبات
│   │   ├── schedule/      ← الجدول
│   │   ├── notifications/ ← الإشعارات
│   │   └── exams/take/    ← أداء الاختبار
│   ├── teacher/           ← لوحة المعلم
│   │   ├── page.tsx       ← Dashboard
│   │   ├── classes/       ← فصولي
│   │   ├── grades/        ← إدخال الدرجات
│   │   ├── attendance/    ← الحضور
│   │   ├── homework/      ← تصحيح الواجبات
│   │   ├── lessons/create ← إنشاء درس
│   │   └── exams/create   ← إنشاء اختبار
│   └── admin/             ← لوحة المدير
├── components/
│   ├── shared/DashboardLayout.tsx
│   └── ui/index.tsx       ← Card, Badge, Modal, Spinner
├── hooks/
│   ├── useAuth.tsx        ← Auth context
│   └── useData.ts         ← Supabase re-export
├── lib/supabase.ts        ← Supabase client
└── types/index.ts         ← TypeScript types
```

## الإعداد

### 1. Supabase
1. أنشئ مشروعاً جديداً في [supabase.com](https://supabase.com)
2. افتح **SQL Editor** وانسخ محتوى `supabase-schema.sql` وشغّله
3. من **Settings → API** انسخ:
   - `Project URL`
   - `anon public key`
   - `service_role key`

### 2. Environment Variables
انسخ `.env.local.example` إلى `.env.local` وأضف القيم:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
```

### 3. Netlify
في **Site Settings → Environment Variables** أضف:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Build command: `npm run build`  
Publish directory: `.next`  
Plugin: `@netlify/plugin-nextjs` (موجود في netlify.toml)

## التشغيل المحلي

```bash
npm install
cp .env.local.example .env.local
# أضف القيم في .env.local
npm run dev
```

## البناء

```bash
npm run build
npm start
```
