"use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "@/lib/auth-client";

export function GoogleLoginButton() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function signInWithGoogle() {
    setError("");
    setIsLoading(true);

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (result.error) {
        setError(result.error.message ?? "Could not continue with Google.");
        setIsLoading(false);
      }
    } catch {
      setError("Could not continue with Google.");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-white px-7 font-semibold text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <FcGoogle size={24} />
        {isLoading ? "Opening Google..." : "Continue with Google"}
      </button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
