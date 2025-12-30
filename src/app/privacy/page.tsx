import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | OpenGames",
  description: "Privacy policy for the OpenGames website and API.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        Privacy Policy
      </h1>
      <div className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
        <p>
          We collect minimal data necessary to operate the site and improve the
          browsing experience. We do not sell personal information.
        </p>
        <h2>Data we process</h2>
        <ul>
          <li>Basic request logs for security and performance</li>
          <li>Anonymous usage metrics (if analytics is enabled)</li>
        </ul>
        <h2>Third-party services</h2>
        <p>
          Some outbound links (for example, GitHub or affiliate links) will take
          you to third-party sites. Their privacy policies apply.
        </p>
        <h2>Contact</h2>
        <p>
          Questions? Contact us at <code>privacy@opengames.dev</code>.
        </p>
      </div>
    </div>
  );
}
