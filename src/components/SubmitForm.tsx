"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { isNonEmptyString, isValidSlug } from "@/lib/api-utils";
import { parseGitHubUrl } from "@/lib/utils";

export function SubmitForm() {
  const [repoUrl, setRepoUrl] = useState("");
  const [notes, setNotes] = useState("");

  const parsed = useMemo(() => parseGitHubUrl(repoUrl.trim()), [repoUrl]);

  const normalized = useMemo(() => {
    if (!parsed) return null;

    const owner = parsed.owner;
    const repo = parsed.repo;

    const slug = `${owner}-${repo}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return {
      owner,
      repo,
      slug: isValidSlug(slug) ? slug : null,
      canonicalRepoUrl: `https://github.com/${owner}/${repo}`,
    };
  }, [parsed]);

  const mailtoHref = useMemo(() => {
    if (!normalized) return "mailto:submit@opengames.dev";

    const subject = `Game submission: ${normalized.owner}/${normalized.repo}`;
    const body = [
      `Repo: ${normalized.canonicalRepoUrl}`,
      "",
      notes ? `Notes: ${notes}` : "",
      "",
      "Thanks!",
    ]
      .filter(Boolean)
      .join("\n");

    return `mailto:submit@opengames.dev?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }, [normalized, notes]);

  const previewText = useMemo(() => {
    if (!normalized) return "Enter a valid GitHub repository URL to preview.";

    if (!normalized.slug) {
      return "Could not generate a valid slug from this repo.";
    }

    return `Repo: ${normalized.canonicalRepoUrl}\nSuggested slug: ${normalized.slug}`;
  }, [normalized]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        Submit a Game
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Help the directory grow. Submit a GitHub repository for an open-source
        game and we will review it for inclusion.
      </p>

      <form
        className="mt-8 space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label
            htmlFor="repoUrl"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            GitHub repository URL
          </label>
          <input
            id="repoUrl"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            inputMode="url"
            autoComplete="url"
            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Only public GitHub repositories are supported right now.
          </p>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything helpful (genre, how to run, why it’s awesome)…"
            rows={4}
            className="mt-2 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        <div className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
          <p className="font-medium">Preview</p>
          <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm">
            {previewText}
          </pre>
          {normalized && isNonEmptyString(normalized.canonicalRepoUrl) && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              We will normalize the repo URL and generate a canonical slug.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={mailtoHref}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Email Submission
          </a>
          <Link
            href="/games"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Back to Games
          </Link>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          By submitting, you confirm you have the right to share this link and
          that the project is open-source.
        </p>
      </form>
    </div>
  );
}
