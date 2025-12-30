/**
 * Languages Index Page - Lists all programming language categories
 * Hub page for SEO with links to individual language category pages
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/utils";
import { Code, Cpu, Terminal, Braces, FileCode } from "lucide-react";

// Programming language data with their category slugs
const LANGUAGES = [
  {
    slug: "rust",
    name: "Rust",
    description: "Memory-safe, blazingly fast systems programming",
    categorySlug: "games-written-in-rust",
    icon: Cpu,
    color: "from-orange-500 to-red-600",
  },
  {
    slug: "cpp",
    name: "C++",
    fullName: "C++",
    description: "High-performance game development standard",
    categorySlug: "games-written-in-cpp",
    icon: Cpu,
    color: "from-blue-500 to-blue-700",
  },
  {
    slug: "python",
    name: "Python",
    description: "Beginner-friendly scripting and rapid prototyping",
    categorySlug: "games-written-in-python",
    icon: FileCode,
    color: "from-yellow-400 to-blue-500",
  },
  {
    slug: "javascript",
    name: "JavaScript",
    description: "Web-based games and Node.js applications",
    categorySlug: "games-written-in-javascript",
    icon: Braces,
    color: "from-yellow-400 to-yellow-600",
  },
  {
    slug: "go",
    name: "Go",
    description: "Simple, efficient, and concurrent programming",
    categorySlug: "games-written-in-go",
    icon: Cpu,
    color: "from-cyan-400 to-cyan-600",
  },
  {
    slug: "java",
    name: "Java",
    description: "Cross-platform development with JVM",
    categorySlug: "games-written-in-java",
    icon: FileCode,
    color: "from-red-500 to-orange-600",
  },
  {
    slug: "csharp",
    name: "C#",
    fullName: "C#",
    description: "Unity and .NET game development",
    categorySlug: "games-written-in-csharp",
    icon: Code,
    color: "from-purple-500 to-purple-700",
  },
  {
    slug: "lua",
    name: "Lua",
    description: "Lightweight scripting often embedded in game engines",
    categorySlug: "games-written-in-lua",
    icon: Terminal,
    color: "from-blue-400 to-indigo-600",
  },
  {
    slug: "typescript",
    name: "TypeScript",
    description: "Type-safe JavaScript for larger projects",
    categorySlug: "games-written-in-typescript",
    icon: Braces,
    color: "from-blue-500 to-blue-700",
  },
  {
    slug: "haskell",
    name: "Haskell",
    description: "Functional programming for unique game mechanics",
    categorySlug: "games-written-in-haskell",
    icon: Code,
    color: "from-purple-400 to-pink-600",
  },
  {
    slug: "kotlin",
    name: "Kotlin",
    description: "Modern JVM language for Android and desktop",
    categorySlug: "games-written-in-kotlin",
    icon: FileCode,
    color: "from-orange-400 to-purple-600",
  },
  {
    slug: "swift",
    name: "Swift",
    description: "Apple platforms native development",
    categorySlug: "games-written-in-swift",
    icon: Code,
    color: "from-orange-500 to-red-500",
  },
  {
    slug: "gdscript",
    name: "GDScript",
    description: "Godot Engine's native scripting language",
    categorySlug: "games-written-in-gdscript",
    icon: Terminal,
    color: "from-blue-500 to-cyan-500",
  },
];

export const metadata: Metadata = {
  title: "Browse Open Source Games by Programming Language | Open Source Games",
  description:
    "Explore open-source games by programming language. Find games written in Rust, C++, Python, JavaScript, Go, Java, C#, and more. Learn from real game codebases.",
  keywords: [
    "open source games",
    "games by programming language",
    "Rust games",
    "C++ games",
    "Python games",
    "JavaScript games",
    "game development",
    "learn game programming",
  ],
  openGraph: {
    title: "Browse Open Source Games by Programming Language",
    description:
      "Explore open-source games by programming language. Find games written in Rust, C++, Python, JavaScript, and more.",
    type: "website",
    url: "/languages",
  },
  alternates: {
    canonical: "/languages",
  },
};

export default function LanguagesPage() {
  const siteUrl = getSiteUrl();

  // Schema.org CollectionPage
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Open Source Games by Programming Language",
    description:
      "Browse open-source games organized by programming language including Rust, C++, Python, JavaScript, and more.",
    url: `${siteUrl}/languages`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: LANGUAGES.length,
      itemListElement: LANGUAGES.map((lang, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `Games written in ${lang.fullName || lang.name}`,
        url: `${siteUrl}/category/${lang.categorySlug}`,
      })),
    },
  };

  return (
    <div className="bg-zinc-50 dark:bg-black min-h-screen">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Home
          </Link>
          <span className="text-zinc-400">/</span>
          <span className="text-zinc-900 dark:text-zinc-100">Languages</span>
        </nav>

        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <Code className="h-8 w-8" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Browse Games by Programming Language
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Explore {LANGUAGES.length} programming languages used in open-source
            game development. Perfect for learning game programming or finding
            projects to contribute to.
          </p>
        </div>

        {/* Language Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {LANGUAGES.map((lang) => {
            const IconComponent = lang.icon;
            return (
              <Link
                key={lang.slug}
                href={`/category/${lang.categorySlug}`}
                className="group flex flex-col rounded-lg border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${lang.color} text-white`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                    {lang.fullName || lang.name}
                  </h2>
                </div>

                <p className="mb-3 line-clamp-2 flex-grow text-sm text-zinc-600 dark:text-zinc-400">
                  {lang.description}
                </p>

                <div className="mt-3 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                  Browse {lang.name} Games
                  <svg
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Why Learn Section */}
        <section className="mt-16 rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Why Browse Games by Programming Language?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
                Learn from Real Projects
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Study production-quality code in your preferred language.
                Open-source games provide excellent learning resources for game
                development patterns and techniques.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
                Contribute to Projects
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Find projects in languages you know and start contributing. Most
                open-source games welcome bug fixes, features, and documentation
                improvements.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
                Compare Implementations
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                See how different languages approach game development. Compare
                performance, code structure, and ecosystem tools across
                languages.
              </p>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="mt-8 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center text-white">
          <h2 className="mb-4 text-2xl font-bold">Explore More Categories</h2>
          <p className="mb-6 text-green-100">
            Browse games by genre, game engine, or find alternatives to popular
            commercial games.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/genres"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-green-600 transition-colors hover:bg-green-50"
            >
              Browse by Genre
            </Link>
            <Link
              href="/category"
              className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/20"
            >
              All Categories
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
