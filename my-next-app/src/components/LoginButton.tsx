'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginButton() {
  const login = async () => {
    const supabase = createClient()

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return <button onClick={login}>Login with Google</button>
}
