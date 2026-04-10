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
        <div className="absolute top-4 right-4">
          <ThemeToggleWrapper />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-1">Crackd</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-3 text-sm text-center max-w-sm">
          See images with AI-generated captions and vote on how funny they are. You can also upload your own images and generate captions.
        </p>
        <p className="text-neutral-400 dark:text-neutral-500 mb-8 text-xs text-center max-w-xs">
          Sign in with any Google account to start rating.
        </p>
        <LoginButton />
      </main>
    );
  }

  return <HomeContent />;
}
