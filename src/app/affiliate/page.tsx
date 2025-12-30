import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | OpenGames",
  description:
    "Disclosure about affiliate links and monetization on the OpenGames website.",
  alternates: { canonical: "/affiliate" },
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        Affiliate Disclosure
      </h1>
      <div className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
        <p>
          Some links on OpenGames may be affiliate links. If you click and make
          a purchase, we may earn a commission at no additional cost to you.
        </p>
        <p>
          We only recommend products and services that we believe are useful for
          playing, hosting, or developing open-source games.
        </p>
      </div>
    </div>
  );
}
