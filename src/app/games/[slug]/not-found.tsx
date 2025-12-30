import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function GameNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="text-center">
        <div className="mb-6 text-6xl" role="img" aria-label="Game controller">
          🎮
        </div>

        <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Game Not Found
        </h1>

        <p className="mb-8 max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          The game you are looking for does not exist or may have been removed.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            Go Home
          </Link>

          <Link
            href="/games"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 py-3 font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
            Browse Games
          </Link>
        </div>
      </div>
    </div>
  );
}
