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
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Captions</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Upload an image to generate AI captions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm font-medium bg-foreground/10 hover:bg-foreground/20 text-foreground transition-colors"
          >
            &larr; Back
          </Link>
          <ThemeToggleWrapper />
        </div>
      </header>
      <ImageUploader accessToken={session?.access_token ?? null} />
    </main>
  );
}
