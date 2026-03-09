import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

export const metadata: Metadata = {
  title: "مدرسة الرفعة النموذجية",
  description: "نظام إدارة مدرسة الرفعة النموذجية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
