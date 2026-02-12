'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginButton() {
  const login = async () => {
    const supabase = createClient()

    const redirectUrl = `${window.location.origin}/auth/callback`

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          redirect_to: redirectUrl,
        },
      },
    })
  }

  return <button onClick={login}>Login with Google</button>
}
