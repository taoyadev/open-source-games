import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DMCA | OpenGames",
  description:
    "Information for copyright holders requesting removals from OpenGames.",
  alternates: { canonical: "/dmca" },
};

export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        DMCA / Takedown Requests
      </h1>
      <div className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
        <p>
          OpenGames indexes publicly available metadata about open-source game
          repositories. If you believe content should be removed, contact{" "}
          <code>dmca@opengames.dev</code> with:
        </p>
        <ul>
          <li>The URL(s) you want removed</li>
          <li>Your contact information</li>
          <li>A description of the claim and supporting evidence</li>
        </ul>
        <p>We will review and respond as quickly as possible.</p>
      </div>
    </div>
  );
}
