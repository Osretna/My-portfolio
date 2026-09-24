import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, X, AlertCircle } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isArabic: boolean;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess, isArabic }: AdminLoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      // Validate credentials securely
      if (username.trim() === "admin" && password === "admin1234") {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("portfolio_admin_auth", "true");
        }
        setIsLoading(false);
        setUsername("");
        setPassword("");
        onSuccess();
      } else {
        setIsLoading(false);
        setError(
          isArabic
            ? "بيانات الدخول غير صحيحة، يرجى التحقق من اسم المستخدم وكلمة المرور."
            : "Invalid credentials. Please check your username and password.",
        );
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md p-6 sm:p-8 glass-solid border border-border/80 rounded-2xl shadow-2xl animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 left-4 sm:top-5 sm:left-5 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-black/5 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 text-primary mb-4 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {isArabic ? "بوابة لوحة التحكم" : "Control Panel Portal"}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
            {isArabic
              ? "الوصول الآمن لإدارة المشاريع وصورة الملف الشخصي"
              : "Secure access to manage projects and profile photo"}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              {isArabic ? "اسم المستخدم" : "Username"}
            </label>
            <input
              type="text"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isArabic ? "أدخل اسم المستخدم" : "Enter username"}
              className="w-full glass-input text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
              {isArabic ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isArabic ? "أدخل كلمة المرور" : "Enter password"}
                className="w-full glass-input text-sm pe-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 end-0 pe-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full button button-primary justify-center font-bold tracking-wide"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                  {isArabic ? "جارِ التحقق..." : "Verifying..."}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {isArabic ? "دخول لوحة التحكم" : "Enter Dashboard"}
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center border-t border-border/50 pt-4">
          <p className="text-[11px] text-muted-foreground">
            {isArabic
              ? "ملاحظة: هذه المنطقة مخصصة حصرياً لصاحب الموقع لإدارة المحتوى."
              : "Note: This area is strictly reserved for the portfolio owner."}
          </p>
        </div>
      </div>
    </div>
  );
}
