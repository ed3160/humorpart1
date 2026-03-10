"use client";

import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
  const supabase = createClient();

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      className="rounded-lg bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
    >
      Sign in with Google
    </button>
  );
}
