import { createClient } from "@/lib/supabase/server";
import { LoginButton } from "@/components/LoginButton";
import { ThemeToggleWrapper } from "@/components/ThemeToggleWrapper";
import { HomeContent } from "@/components/HomeContent";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
        <div className="flex items-center justify-end absolute top-4 right-4">
          <ThemeToggleWrapper />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Humor Project</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Sign in to view images
        </p>
        <LoginButton />
      </main>
    );
  }

  return <HomeContent />;
}
