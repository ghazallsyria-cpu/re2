"use client";
import { X } from "lucide-react";

// ─── Card ───────────────────────────────────────────────────
type CardProps = {
  children: React.ReactNode;
  title?: string;
  className?: string;
};
export function Card({ children, title, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 ${className}`}
    >
      {title && (
        <h3 className="font-black text-gray-800 dark:text-white mb-4 text-sm">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

// ─── Badge ──────────────────────────────────────────────────
type BadgeVariant = "success" | "warning" | "danger" | "info" | "default";
type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};
const variantMap: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  info: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  default: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};
export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// ─── Modal ──────────────────────────────────────────────────
type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
};
const sizeMap = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };
export function Modal({ open, onClose, title, size = "md", children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${sizeMap[size]} overflow-hidden`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────
export function Spinner({ size = 10 }: { size?: number }) {
  return (
    <div
      className={`w-${size} h-${size} border-4 rounded-full animate-spin`}
      style={{ borderColor: "#c9970c", borderTopColor: "transparent" }}
    />
  );
}
