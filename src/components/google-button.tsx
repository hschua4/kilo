"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.74Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3a7.2 7.2 0 0 1-10.74-3.77H1.32v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.33 14.33a7.2 7.2 0 0 1 0-4.59V6.65H1.32a12 12 0 0 0 0 10.77l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.32 6.65l4.01 3.09A7.2 7.2 0 0 1 12 4.75Z"
      />
    </svg>
  );
}

export function GoogleButton({ callbackURL = "/dashboard" }: { callbackURL?: string }) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    await signIn.social(
      { provider: "google", callbackURL },
      {
        onError: (ctx) => {
          setLoading(false);
          toast.error(ctx.error.message || "Could not sign in with Google");
        },
      },
    );
  }

  return (
    <Button type="button" variant="outline" onClick={onClick} disabled={loading}>
      {loading ? <Spinner data-icon="inline-start" /> : <GoogleIcon />}
      Continue with Google
    </Button>
  );
}
