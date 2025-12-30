/**
 * FAQ Section with Schema.org FAQ markup for SEO
 */

import type { FAQ } from "@/lib/categories";

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
}

export function FAQSection({
  faqs,
  title = "Frequently Asked Questions",
}: FAQSectionProps) {
  if (!faqs || faqs.length === 0) return null;

  // Generate Schema.org FAQPage structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          >
            <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-zinc-900 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800/50">
              <span>{faq.question}</span>
              <svg
                className="h-5 w-5 shrink-0 text-zinc-500 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="border-t border-zinc-200 px-4 py-3 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              <p>{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

export default FAQSection;
