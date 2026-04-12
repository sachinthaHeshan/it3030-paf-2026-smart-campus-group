"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Info, XCircle, X, Loader2 } from "lucide-react";

const VARIANT_STYLES = {
  danger: {
    icon: XCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    confirmBtn:
      "bg-danger text-white hover:bg-red-600 focus:ring-red-300",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-600",
    confirmBtn:
      "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-300",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-50",
    iconColor: "text-primary",
    confirmBtn:
      "bg-primary text-white hover:bg-primary-dark focus:ring-primary/30",
  },
};

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string | null;
  variant?: "danger" | "warning" | "info";
  onConfirm: (inputValue?: string) => void;
  onCancel: () => void;
  loading?: boolean;
  input?: { placeholder: string; required?: boolean };
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "info",
  onConfirm,
  onCancel,
  loading = false,
  input,
}: ConfirmModalProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const style = VARIANT_STYLES[variant];
  const Icon = style.icon;

  useEffect(() => {
    if (open) {
      setInputValue("");
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const canConfirm = !input?.required || inputValue.trim().length > 0;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !loading && onCancel()}
        onKeyDown={() => {}}
        role="button"
        tabIndex={-1}
        aria-label="Close modal"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4 p-6 pb-2">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.iconBg}`}
          >
            <Icon size={20} className={style.iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-[13px] text-muted mt-1 leading-relaxed">
              {message}
            </p>
          </div>
          {!loading && (
            <button
              type="button"
              onClick={onCancel}
              className="shrink-0 rounded-lg p-1 text-muted hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {input && (
          <div className="px-6 pt-2">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={input.placeholder}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 p-6 pt-4">
          {cancelLabel !== null && (
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium text-foreground hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            disabled={loading || !canConfirm}
            onClick={() => onConfirm(inputValue)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors disabled:opacity-50 ${style.confirmBtn}`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
