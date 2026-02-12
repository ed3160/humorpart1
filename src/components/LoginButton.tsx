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
      className="rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-3 font-medium shadow-lg hover:opacity-90 transition-opacity"
    >
      Sign in with Google
    </button>
  );
}
