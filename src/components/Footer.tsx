import Link from "next/link";
import { Gamepad2, Github, Twitter, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const githubUrl =
    process.env.NEXT_PUBLIC_GITHUB_URL ||
    "https://github.com/bobeff/open-source-games";
  const twitterUrl =
    process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com";

  const footerLinks = {
    discover: [
      { href: "/games", label: "All Games" },
      { href: "/genres", label: "Browse by Genre" },
      { href: "/languages", label: "Browse by Language" },
      { href: "/trending", label: "Trending" },
    ],
    resources: [
      { href: "/about", label: "About" },
      { href: "/submit", label: "Submit a Game" },
      { href: "/api", label: "API" },
      { href: "/blog", label: "Blog" },
    ],
    legal: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/affiliate", label: "Affiliate Disclosure" },
      { href: "/dmca", label: "DMCA" },
    ],
  };

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Gamepad2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-bold text-zinc-900 dark:text-white">
                OpenGames
              </span>
            </Link>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              Discover and explore the best open source games from around the
              world. Play, learn, and contribute.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Discover
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Affiliate Disclaimer */}
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Affiliate Disclosure:</strong> Some links on this site may
            be affiliate links. This means we may earn a commission if you click
            on the link and make a purchase, at no additional cost to you. We
            only recommend products and services we believe in.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800 sm:flex-row">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            &copy; {currentYear} OpenGames. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            Made with <Heart className="h-4 w-4 text-red-500" /> for the open
            source community
          </p>
        </div>
      </div>
    </footer>
  );
}
