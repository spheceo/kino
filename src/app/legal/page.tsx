import type { Metadata } from "next";
import { BackButton } from "./back-button";

export const metadata: Metadata = {
  title: "Legal — Kino",
};

export default function LegalPage() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-dvh bg-[#0f0f0f] px-6 py-24 text-white">
      <article className="mx-auto max-w-2xl">
        <BackButton />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-bold">Legal Information</h1>

        <div className="mt-12 space-y-8 text-[15px] leading-relaxed text-white/60">
          <p>
            Kino operates as a content discovery platform. It does not upload,
            store, or host any media files on its infrastructure. All streams
            originate from external third-party platforms, and Kino functions
            solely as an aggregator that indexes publicly available content from
            across the web.
          </p>

          <p>
            Because Kino does not host any files, it has no technical ability to
            remove content from servers it does not operate. All removal requests
            must be submitted directly to the original hosting platforms where
            the content actually resides — those platforms have full control over
            their files.
          </p>

          <p>
            Kino respects intellectual property rights and operates within legal
            boundaries. If you are a copyright holder seeking to report content,
            we are happy to assist by directing you to the source where the
            material was discovered. We will cooperate with legitimate legal
            requests to the extent that is technically possible.
          </p>

          <p>
            Kino only utilises publicly accessible data and APIs. It maintains no
            ownership or control over any media content. Users are solely
            responsible for how they interact with third-party services accessed
            through the platform.
          </p>

          <p>
            For general enquiries, copyright concerns, or to report an issue,
            contact us at{" "}
            <a
              href="mailto:contact@hexian.software"
              className="text-white underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              contact@hexian.software
            </a>
            . We will respond to all legitimate requests as promptly as possible.
          </p>
        </div>

        <p className="mt-20 text-sm text-white/25">
          &copy; {currentYear} Kino. All rights reserved.
        </p>
      </article>
    </main>
  );
}
