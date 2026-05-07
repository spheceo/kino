import Image from "next/image";

export default function WatchLoading() {
  return (
    <main className="relative flex h-dvh items-center justify-center bg-black">
      <Image
        src="/Logo.svg"
        alt="Kino"
        width={154}
        height={60}
        priority
        className="h-10 w-auto animate-pulse"
      />
    </main>
  );
}
