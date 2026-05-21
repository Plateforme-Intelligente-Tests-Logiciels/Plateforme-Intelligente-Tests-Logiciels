"use client";

import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import Image from "next/image";
import { ThemeModeToggle } from "@/components/theme/ThemeModeToggle";

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-b from-primary-50 via-white to-primary-100 dark:from-primary-950 dark:via-[#12131a] dark:to-[#0b0b0f] text-slate-900 dark:text-white transition-colors duration-200">
      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-50 animate-fade-in">
        <ThemeModeToggle />
      </div>

      {/* Ambient Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full bg-primary-600/10 dark:bg-primary-600/20 blur-[140px] transition-all" />
      </div>

      <div className="flex items-center justify-center p-4 relative z-10 w-full">
        <div className="w-full max-w-105 flex flex-col gap-6">
          {/* Brand / Logo Area */}
          <div className="flex justify-center">
            <a href="/" className="flex items-center gap-3 text-slate-900 dark:text-white transition-colors">
              <Image
                src="/favicon-32x32.png"
                alt="FlowPilot logo"
                width={40}
                height={40}
                className="transition-transform duration-300 hover:scale-105"
                priority
              />
              <span className="text-lg font-semibold tracking-tight">
                FlowPilot
              </span>
            </a>
          </div>

          {/* Main Card */}
          <div className="rounded-2xl border border-primary-100/70 dark:border-white/10 bg-white/90 dark:bg-[#171b22]/90 shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-300">
            <div className="p-7 flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col gap-2 text-center">
                <div className="size-12 rounded-full bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-200 flex items-center justify-center mx-auto mb-2 transition-colors">
                  <span className="material-symbols-outlined text-[28px]">
                    lock_reset
                  </span>
                </div>
                <h1 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white transition-colors">
                  Forgot Password?
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
              {/* Form */}
              <ForgotPasswordForm />
            </div>
          </div>

          {/* Helper Links */}
          <div className="flex justify-center gap-6 text-xs text-slate-500 dark:text-slate-500">
            <a className="hover:text-primary-600 dark:hover:text-primary-200 transition-colors" href="/privacy">
              Privacy Policy
            </a>
            <a className="hover:text-primary-600 dark:hover:text-primary-200 transition-colors" href="/terms">
              Terms of Service
            </a>
            <a className="hover:text-primary-600 dark:hover:text-primary-200 transition-colors" href="/support">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}