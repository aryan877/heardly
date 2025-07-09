"use client";

import { AuthSignIn } from "@/components/auth-signin";

export default function AuthPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <AuthSignIn />
    </div>
  );
}
