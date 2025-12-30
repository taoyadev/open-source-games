import { Terminal, Download, Book, ExternalLink } from "lucide-react";
import type { Game } from "@/db/schema";
import { parseGitHubUrl } from "@/lib/utils";

interface InstallGuideProps {
  game: Game;
}

export function InstallGuide({ game }: InstallGuideProps) {
  const githubInfo = parseGitHubUrl(game.repoUrl);
  const platforms = game.platforms || [];

  return (
    <section aria-labelledby="install-heading">
      <h2
        id="install-heading"
        className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        How to Install {game.title}
      </h2>

      <div className="mt-6 space-y-6">
        {/* Download options */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <Download className="h-5 w-5" aria-hidden="true" />
            Download Options
          </h3>

          <div className="space-y-3">
            {/* GitHub Releases */}
            <a
              href={`${game.repoUrl}/releases/latest`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  GitHub Releases
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {game.latestRelease
                    ? `Latest: v${game.latestRelease}`
                    : "Download pre-built binaries"}
                </p>
              </div>
              <ExternalLink
                className="h-5 w-5 text-zinc-400"
                aria-hidden="true"
              />
            </a>

            {/* Source code */}
            <a
              href={`${game.repoUrl}/archive/refs/heads/main.zip`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  Source Code (ZIP)
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Build from source
                </p>
              </div>
              <ExternalLink
                className="h-5 w-5 text-zinc-400"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        {/* Build from source */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <Terminal className="h-5 w-5" aria-hidden="true" />
            Build from Source
          </h3>

          <div className="space-y-4">
            {/* Clone command */}
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                1. Clone the repository
              </p>
              <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100 dark:bg-zinc-950">
                <code>git clone {game.repoUrl}.git</code>
              </pre>
            </div>

            {/* Navigate */}
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                2. Navigate to the directory
              </p>
              <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100 dark:bg-zinc-950">
                <code>
                  cd{" "}
                  {githubInfo?.repo ||
                    game.title.toLowerCase().replace(/\s+/g, "-")}
                </code>
              </pre>
            </div>

            {/* Language-specific build instructions */}
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                3. Build and run
              </p>
              <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100 dark:bg-zinc-950">
                <code>{getBuildCommand(game.language)}</code>
              </pre>
            </div>
          </div>

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            For detailed instructions, check the{" "}
            <a
              href={`${game.repoUrl}#readme`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              README
            </a>{" "}
            or{" "}
            <a
              href={`${game.repoUrl}/wiki`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Wiki
            </a>
            .
          </p>
        </div>

        {/* Platform-specific notes */}
        {platforms.length > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              <Book className="h-5 w-5" aria-hidden="true" />
              Supported Platforms
            </h3>

            <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {platforms.map((platform) => (
                <li
                  key={platform}
                  className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800"
                >
                  <span className="text-lg" aria-hidden="true">
                    {getPlatformEmoji(platform)}
                  </span>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {platform}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function getBuildCommand(language: string | null): string {
  switch (language?.toLowerCase()) {
    case "rust":
      return "cargo build --release && cargo run --release";
    case "c++":
    case "c":
      return "mkdir build && cd build && cmake .. && make";
    case "python":
      return "pip install -r requirements.txt && python main.py";
    case "javascript":
    case "typescript":
      return "npm install && npm start";
    case "go":
      return "go build && ./game";
    case "java":
      return "mvn package && java -jar target/*.jar";
    case "c#":
      return "dotnet build && dotnet run";
    case "gdscript":
      return "# Open project.godot in Godot Engine";
    case "lua":
      return "# Open with Love2D: love .";
    default:
      return "# Check README for build instructions";
  }
}

function getPlatformEmoji(platform: string): string {
  const lower = platform.toLowerCase();
  if (lower.includes("windows")) return "🪟";
  if (lower.includes("linux")) return "🐧";
  if (lower.includes("mac")) return "🍎";
  if (lower.includes("android")) return "🤖";
  if (lower.includes("ios")) return "📱";
  if (lower.includes("web") || lower.includes("browser")) return "🌐";
  if (lower.includes("bsd")) return "😈";
  return "💻";
}
