import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ImageUploader } from "@/components/ImageUploader";
import { ThemeToggleWrapper } from "@/components/ThemeToggleWrapper";
import Link from "next/link";

export default async function GeneratePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Generate</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-xs font-medium bg-foreground/[0.06] hover:bg-foreground/10 text-foreground transition-colors"
          >
            Back
          </Link>
          <ThemeToggleWrapper />
        </div>
      </header>
      <ImageUploader accessToken={session?.access_token ?? null} />
    </main>
  );
}
