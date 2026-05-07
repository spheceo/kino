import Image from "next/image";
import { redirect } from "next/navigation";
import { GoogleLoginButton } from "@/app/login/login-button";
import { isAuthenticated } from "@/lib/auth-server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

type TmdbBackdropResult = {
  backdrop_path?: string | null;
};

async function getLoginBackdrop() {
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/movie/day?api_key=${env.NEXT_PUBLIC_TMDB_KEY}&language=en-US`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as { results?: TmdbBackdropResult[] };
  const backdrop = data.results?.find((item) => item.backdrop_path);

  return backdrop?.backdrop_path ?? null;
}

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/");
  }

  const backdropPath = await getLoginBackdrop();

  return (
    <main className="relative flex min-h-dvh items-center overflow-hidden bg-background px-8 py-10 text-white md:px-20">
      {backdropPath ? (
        <Image
          src={`https://image.tmdb.org/t/p/original${backdropPath}`}
          alt=""
          width={1920}
          height={1080}
          priority
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />

      <section className="relative z-10 flex w-full max-w-[460px] flex-col gap-8">
        <Image
          src="/Logo.svg"
          alt="Kino"
          width={154}
          height={60}
          className="h-9 w-auto self-start"
          priority
        />
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-semibold leading-none">
            Sign in to Kino
          </h1>
          <p className="max-w-[380px] text-lg leading-7 text-white/70">
            Continue with Google to browse, watch, and keep your Kino account in
            sync.
          </p>
        </div>
        <GoogleLoginButton />
      </section>
    </main>
  );
}
