import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | OpenGames",
  description: "Terms of service for the OpenGames website and API.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        Terms of Service
      </h1>
      <div className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
        <p>
          OpenGames is provided on an “as is” basis without warranties. Use the
          information at your own risk.
        </p>
        <h2>Content sources</h2>
        <p>
          Game metadata is aggregated from public sources (e.g., GitHub) and may
          be incomplete or outdated.
        </p>
        <h2>Acceptable use</h2>
        <p>
          Do not abuse the service, attempt to bypass rate limits, or use it for
          unlawful purposes.
        </p>
      </div>
    </div>
  );
}
