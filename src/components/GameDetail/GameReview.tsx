import type { Game } from "@/db/schema";

interface GameReviewProps {
  game: Game;
}

export function GameReview({ game }: GameReviewProps) {
  if (!game.aiReview) {
    return null;
  }

  // Parse the markdown-style sections from AI review
  const sections = parseReviewSections(game.aiReview);

  return (
    <article className="prose prose-zinc max-w-none dark:prose-invert">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        About {game.title}
      </h2>

      <div className="mt-6 space-y-6">
        {sections.map((section, index) => (
          <section key={index}>
            {section.title && (
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                {section.title}
              </h3>
            )}
            <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">
              {section.content}
            </p>
          </section>
        ))}
      </div>

      {/* Attribution */}
      <p className="mt-8 border-t border-zinc-200 pt-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-500">
        This review was generated using AI to provide an objective overview of
        the game based on its GitHub repository information.
      </p>
    </article>
  );
}

interface ReviewSection {
  title: string | null;
  content: string;
}

function parseReviewSections(review: string): ReviewSection[] {
  const lines = review.split("\n");
  const sections: ReviewSection[] = [];
  let currentSection: ReviewSection | null = null;
  let contentLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for markdown headers (## Title)
    if (trimmedLine.startsWith("## ")) {
      // Save previous section
      if (currentSection || contentLines.length > 0) {
        sections.push({
          title: currentSection?.title || null,
          content: contentLines.join(" ").trim(),
        });
        contentLines = [];
      }

      // Extract title, removing the number prefix if present (e.g., "1. Game Type")
      let title = trimmedLine.slice(3).trim();
      title = title.replace(/^\d+\.\s*/, "");

      currentSection = { title, content: "" };
    } else if (trimmedLine) {
      contentLines.push(trimmedLine);
    }
  }

  // Save last section
  if (currentSection || contentLines.length > 0) {
    sections.push({
      title: currentSection?.title || null,
      content: contentLines.join(" ").trim(),
    });
  }

  return sections.filter((s) => s.content);
}
