/**
 * Category definitions for pSEO pages
 * 100+ categories targeting long-tail keywords
 */

export interface Category {
  slug: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  filter: CategoryFilter;
  icon: string;
  faqs: FAQ[];
  intro?: string;
}

export interface CategoryFilter {
  topics?: string[];
  language?: string;
  engine?: string;
  isMultiplayer?: boolean;
  platforms?: string[];
  minStars?: number;
  alternativeTo?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

// Genre categories
const GENRES = [
  {
    slug: "rpg",
    name: "RPG",
    fullName: "Role-Playing Games",
    description:
      "Character development, story-driven gameplay, and immersive worlds",
  },
  {
    slug: "fps",
    name: "FPS",
    fullName: "First-Person Shooter",
    description: "Fast-paced action from a first-person perspective",
  },
  {
    slug: "rts",
    name: "RTS",
    fullName: "Real-Time Strategy",
    description: "Base building, resource management, and tactical warfare",
  },
  {
    slug: "puzzle",
    name: "Puzzle",
    fullName: "Puzzle Games",
    description: "Brain-teasing challenges and logical problem solving",
  },
  {
    slug: "platformer",
    name: "Platformer",
    fullName: "Platformer Games",
    description: "Jumping, running, and navigating through challenging levels",
  },
  {
    slug: "roguelike",
    name: "Roguelike",
    fullName: "Roguelike Games",
    description: "Procedural generation, permadeath, and high replayability",
  },
  {
    slug: "simulation",
    name: "Simulation",
    fullName: "Simulation Games",
    description: "Realistic simulations of real-world activities",
  },
  {
    slug: "strategy",
    name: "Strategy",
    fullName: "Strategy Games",
    description: "Turn-based or real-time tactical decision making",
  },
  {
    slug: "racing",
    name: "Racing",
    fullName: "Racing Games",
    description: "High-speed vehicle racing and competition",
  },
  {
    slug: "sandbox",
    name: "Sandbox",
    fullName: "Sandbox Games",
    description: "Open-world exploration and creative freedom",
  },
  {
    slug: "card",
    name: "Card",
    fullName: "Card Games",
    description: "Digital card games and deck building",
  },
  {
    slug: "tower-defense",
    name: "Tower Defense",
    fullName: "Tower Defense Games",
    description: "Strategic placement of defenses to stop waves of enemies",
  },
  {
    slug: "adventure",
    name: "Adventure",
    fullName: "Adventure Games",
    description: "Story-driven exploration and puzzle solving",
  },
  {
    slug: "survival",
    name: "Survival",
    fullName: "Survival Games",
    description: "Resource gathering, crafting, and staying alive",
  },
  {
    slug: "horror",
    name: "Horror",
    fullName: "Horror Games",
    description: "Scary, atmospheric experiences that test your nerves",
  },
  {
    slug: "arcade",
    name: "Arcade",
    fullName: "Arcade Games",
    description: "Classic arcade-style gameplay and high scores",
  },
  {
    slug: "fighting",
    name: "Fighting",
    fullName: "Fighting Games",
    description: "One-on-one or team combat with complex move sets",
  },
  {
    slug: "sports",
    name: "Sports",
    fullName: "Sports Games",
    description: "Digital versions of real-world sports",
  },
  {
    slug: "music",
    name: "Music",
    fullName: "Music/Rhythm Games",
    description: "Rhythm-based gameplay synchronized with music",
  },
  {
    slug: "educational",
    name: "Educational",
    fullName: "Educational Games",
    description: "Learning through interactive gameplay",
  },
];

// Programming languages
const LANGUAGES = [
  {
    slug: "rust",
    name: "Rust",
    description: "Memory-safe, blazingly fast systems programming",
  },
  {
    slug: "cpp",
    name: "C++",
    fullName: "C++",
    description: "High-performance game development standard",
  },
  {
    slug: "python",
    name: "Python",
    description: "Beginner-friendly scripting and rapid prototyping",
  },
  {
    slug: "javascript",
    name: "JavaScript",
    description: "Web-based games and Node.js applications",
  },
  {
    slug: "go",
    name: "Go",
    description: "Simple, efficient, and concurrent programming",
  },
  {
    slug: "java",
    name: "Java",
    description: "Cross-platform development with JVM",
  },
  {
    slug: "csharp",
    name: "C#",
    fullName: "C#",
    description: "Unity and .NET game development",
  },
  {
    slug: "lua",
    name: "Lua",
    description: "Lightweight scripting often embedded in game engines",
  },
  {
    slug: "typescript",
    name: "TypeScript",
    description: "Type-safe JavaScript for larger projects",
  },
  {
    slug: "haskell",
    name: "Haskell",
    description: "Functional programming for unique game mechanics",
  },
  {
    slug: "kotlin",
    name: "Kotlin",
    description: "Modern JVM language for Android and desktop",
  },
  {
    slug: "swift",
    name: "Swift",
    description: "Apple platforms native development",
  },
  {
    slug: "gdscript",
    name: "GDScript",
    description: "Godot Engine's native scripting language",
  },
];

// Game engines
const ENGINES = [
  {
    slug: "godot",
    name: "Godot",
    description: "Open-source game engine with GDScript and C# support",
  },
  {
    slug: "unity",
    name: "Unity",
    description: "Popular cross-platform game engine",
  },
  {
    slug: "unreal",
    name: "Unreal",
    description: "AAA-quality graphics and Blueprint visual scripting",
  },
  {
    slug: "pygame",
    name: "Pygame",
    description: "Python-based 2D game development library",
  },
  {
    slug: "love2d",
    name: "LOVE2D",
    description: "Lua-based framework for 2D games",
  },
  {
    slug: "bevy",
    name: "Bevy",
    description: "Data-driven game engine written in Rust",
  },
  {
    slug: "phaser",
    name: "Phaser",
    description: "HTML5 game framework for browser games",
  },
  {
    slug: "raylib",
    name: "raylib",
    description: "Simple and easy-to-use C library for games",
  },
  {
    slug: "sdl",
    name: "SDL",
    description: "Low-level cross-platform multimedia library",
  },
  {
    slug: "libgdx",
    name: "libGDX",
    description: "Java-based cross-platform game development",
  },
  {
    slug: "monogame",
    name: "MonoGame",
    description: "XNA successor for C# game development",
  },
  {
    slug: "pico8",
    name: "PICO-8",
    description: "Fantasy console with built-in tools",
  },
];

// Commercial game alternatives
const COMMERCIAL_ALTERNATIVES = [
  {
    slug: "minecraft",
    name: "Minecraft",
    description: "Block-building sandbox adventure",
  },
  {
    slug: "civilization",
    name: "Civilization",
    description: "Turn-based historical strategy",
  },
  {
    slug: "terraria",
    name: "Terraria",
    description: "2D sandbox with exploration and combat",
  },
  {
    slug: "factorio",
    name: "Factorio",
    description: "Factory building and automation",
  },
  {
    slug: "dwarf-fortress",
    name: "Dwarf Fortress",
    description: "Complex colony simulation",
  },
  {
    slug: "age-of-empires",
    name: "Age of Empires",
    description: "Historical real-time strategy",
  },
  {
    slug: "starcraft",
    name: "StarCraft",
    description: "Sci-fi real-time strategy",
  },
  {
    slug: "diablo",
    name: "Diablo",
    description: "Action RPG with loot grinding",
  },
  { slug: "doom", name: "DOOM", description: "Classic fast-paced FPS action" },
  {
    slug: "quake",
    name: "Quake",
    description: "Arena shooter with 3D graphics",
  },
  {
    slug: "transport-tycoon",
    name: "Transport Tycoon",
    description: "Transportation network building",
  },
  {
    slug: "simcity",
    name: "SimCity",
    description: "City building and management",
  },
  {
    slug: "roller-coaster-tycoon",
    name: "RollerCoaster Tycoon",
    description: "Theme park management",
  },
  {
    slug: "stardew-valley",
    name: "Stardew Valley",
    description: "Farming and life simulation",
  },
  {
    slug: "zelda",
    name: "Zelda",
    description: "Action-adventure with puzzles",
  },
  {
    slug: "pokemon",
    name: "Pokemon",
    description: "Monster collection and battling",
  },
  {
    slug: "command-and-conquer",
    name: "Command & Conquer",
    description: "Classic RTS warfare",
  },
  {
    slug: "warcraft",
    name: "Warcraft",
    description: "Fantasy real-time strategy",
  },
  { slug: "worms", name: "Worms", description: "Turn-based artillery combat" },
  {
    slug: "tetris",
    name: "Tetris",
    description: "Classic puzzle block stacking",
  },
];

// Platforms for lightweight games
const PLATFORMS = [
  {
    slug: "raspberry-pi",
    name: "Raspberry Pi",
    description: "ARM-based single-board computers",
  },
  {
    slug: "old-pcs",
    name: "Old PCs",
    description: "Legacy hardware with limited resources",
  },
  {
    slug: "low-end",
    name: "Low-End Hardware",
    description: "Budget computers and laptops",
  },
  {
    slug: "linux",
    name: "Linux",
    description: "Open-source operating systems",
  },
  {
    slug: "macos",
    name: "macOS",
    description: "Apple desktop operating system",
  },
  {
    slug: "windows",
    name: "Windows",
    description: "Microsoft Windows platform",
  },
  {
    slug: "android",
    name: "Android",
    description: "Mobile devices running Android",
  },
  { slug: "ios", name: "iOS", description: "Apple mobile devices" },
  { slug: "web", name: "Web Browser", description: "Browser-based gaming" },
  { slug: "steam-deck", name: "Steam Deck", description: "Portable gaming PC" },
];

// Generate genre categories
function generateGenreCategories(): Category[] {
  return GENRES.map((genre) => ({
    slug: `best-open-source-${genre.slug}-games`,
    title: `Best Open Source ${genre.fullName || genre.name} in 2025`,
    description: genre.description,
    metaTitle: `Best Open Source ${genre.name} Games 2025 - Free ${genre.fullName || genre.name} | Open Source Games`,
    metaDescription: `Discover the top free and open-source ${genre.fullName || genre.name.toLowerCase()}. ${genre.description}. Community-driven alternatives with source code available.`,
    filter: { topics: [genre.slug] },
    icon: getGenreIcon(genre.slug),
    faqs: [
      {
        question: `What are the best open-source ${genre.name.toLowerCase()} games?`,
        answer: `The best open-source ${genre.name.toLowerCase()} games include community favorites with active development, high GitHub stars, and regular updates. These games offer ${genre.description.toLowerCase()} while being completely free to play and modify.`,
      },
      {
        question: `Are open-source ${genre.name.toLowerCase()} games free to play?`,
        answer: `Yes! All open-source ${genre.name.toLowerCase()} games listed here are completely free to download, play, and even modify. The source code is publicly available, allowing you to learn from or contribute to the development.`,
      },
      {
        question: `Can I contribute to open-source ${genre.name.toLowerCase()} games?`,
        answer: `Absolutely! Most open-source ${genre.name.toLowerCase()} games welcome contributions. You can help by reporting bugs, suggesting features, creating art assets, writing documentation, or contributing code. Check each game's GitHub repository for contribution guidelines.`,
      },
    ],
  }));
}

// Generate language categories
function generateLanguageCategories(): Category[] {
  return LANGUAGES.map((lang) => ({
    slug: `games-written-in-${lang.slug}`,
    title: `Open Source Games Written in ${lang.fullName || lang.name}`,
    description: `${lang.description}. Explore games built with ${lang.fullName || lang.name}.`,
    metaTitle: `Open Source Games in ${lang.fullName || lang.name} - ${lang.name} Game Projects | Open Source Games`,
    metaDescription: `Explore open-source games written in ${lang.fullName || lang.name}. ${lang.description}. Learn game development by studying real ${lang.name} codebases.`,
    filter: { language: lang.fullName || lang.name },
    icon: getLanguageIcon(lang.slug),
    faqs: [
      {
        question: `Why use ${lang.fullName || lang.name} for game development?`,
        answer: `${lang.fullName || lang.name} offers ${lang.description.toLowerCase()}. Many developers choose ${lang.name} for its unique strengths in building games, from indie projects to larger productions.`,
      },
      {
        question: `What are the best ${lang.name} open-source games to learn from?`,
        answer: `The games listed here are excellent learning resources for ${lang.name} game development. They showcase best practices, design patterns, and real-world solutions used in game programming with ${lang.name}.`,
      },
      {
        question: `Can I use these ${lang.name} games as a starting point for my own project?`,
        answer: `Yes! Open-source games can serve as excellent learning resources or starting points. Check each project's license to understand how you can use, modify, and distribute the code.`,
      },
    ],
  }));
}

// Generate engine categories
function generateEngineCategories(): Category[] {
  return ENGINES.map((engine) => ({
    slug: `${engine.slug}-open-source-games`,
    title: `Open Source Games Made with ${engine.name}`,
    description: engine.description,
    metaTitle: `${engine.name} Open Source Games - Free ${engine.name} Projects | Open Source Games`,
    metaDescription: `Discover open-source games built with ${engine.name}. ${engine.description}. Learn ${engine.name} game development from real projects.`,
    filter: { engine: engine.name, topics: [engine.slug] },
    icon: getEngineIcon(engine.slug),
    faqs: [
      {
        question: `What is ${engine.name} and why use it for games?`,
        answer: `${engine.name} is a game engine that offers ${engine.description.toLowerCase()}. It's popular among indie developers for creating high-quality games efficiently.`,
      },
      {
        question: `Are ${engine.name} games free to develop?`,
        answer: `${engine.name} games listed here are open-source, meaning you can study the code, learn from it, or even fork the project. The engine itself may have different licensing terms.`,
      },
      {
        question: `How can I learn ${engine.name} from these games?`,
        answer: `These open-source ${engine.name} games provide real-world examples of game architecture, asset management, and gameplay programming. Clone the repository and explore the code to learn best practices.`,
      },
    ],
  }));
}

// Generate commercial alternative categories
function generateAlternativeCategories(): Category[] {
  return COMMERCIAL_ALTERNATIVES.map((game) => ({
    slug: `open-source-${game.slug}-alternatives`,
    title: `Open Source ${game.name} Alternatives in 2025`,
    description: `Free alternatives to ${game.name}. ${game.description}.`,
    metaTitle: `Open Source ${game.name} Alternatives - Free Games Like ${game.name} | Open Source Games`,
    metaDescription: `Looking for free alternatives to ${game.name}? Discover open-source games that offer ${game.description.toLowerCase()}. No cost, full source code access.`,
    filter: { alternativeTo: game.slug, topics: [game.slug] },
    icon: "gamepad",
    faqs: [
      {
        question: `Are there free alternatives to ${game.name}?`,
        answer: `Yes! There are several open-source alternatives to ${game.name} that offer similar gameplay. These games provide ${game.description.toLowerCase()} while being completely free and open-source.`,
      },
      {
        question: `How do open-source ${game.name} alternatives compare to the original?`,
        answer: `Open-source alternatives often focus on core gameplay mechanics while adding unique features or improvements. While they may not have the same polish as commercial titles, they offer freedom to modify and contribute to development.`,
      },
      {
        question: `Can I play ${game.name} alternatives on Linux?`,
        answer: `Most open-source games support multiple platforms including Linux. Check each game's documentation for specific platform support and installation instructions.`,
      },
    ],
  }));
}

// Generate platform-specific lightweight categories
function generatePlatformCategories(): Category[] {
  return PLATFORMS.map((platform) => ({
    slug: `lightweight-games-for-${platform.slug}`,
    title: `Lightweight Open Source Games for ${platform.name}`,
    description: `Games optimized for ${platform.name}. ${platform.description}.`,
    metaTitle: `Lightweight Games for ${platform.name} - Open Source | Open Source Games`,
    metaDescription: `Find lightweight open-source games that run well on ${platform.name}. ${platform.description}. Performance-optimized free games.`,
    filter: { platforms: [platform.slug] },
    icon: getPlatformIcon(platform.slug),
    faqs: [
      {
        question: `What are lightweight games for ${platform.name}?`,
        answer: `Lightweight games are optimized to run on ${platform.name} with minimal resource usage. These games offer enjoyable gameplay without requiring high-end hardware.`,
      },
      {
        question: `How do I install open-source games on ${platform.name}?`,
        answer: `Most open-source games provide installation instructions in their README files. Common methods include package managers, direct downloads, or building from source.`,
      },
      {
        question: `Will these games run smoothly on ${platform.name}?`,
        answer: `Games in this category are selected for their compatibility with ${platform.name}. However, performance may vary based on your specific hardware configuration.`,
      },
    ],
  }));
}

// Special categories
function generateSpecialCategories(): Category[] {
  return [
    {
      slug: "multiplayer-open-source-games",
      title: "Best Multiplayer Open Source Games in 2025",
      description:
        "Play with friends or compete online in these community-driven multiplayer experiences.",
      metaTitle:
        "Multiplayer Open Source Games - Free Online Games | Open Source Games",
      metaDescription:
        "Discover the best free multiplayer open-source games. Play with friends, host your own servers, and join active gaming communities.",
      filter: { isMultiplayer: true, topics: ["multiplayer"] },
      icon: "users",
      faqs: [
        {
          question:
            "Can I host my own server for multiplayer open-source games?",
          answer:
            "Yes! One of the biggest advantages of open-source multiplayer games is the ability to host your own servers. This gives you full control over gameplay rules, mods, and who can join.",
        },
        {
          question: "Are open-source multiplayer games active?",
          answer:
            "Many open-source multiplayer games have active communities. Popular titles maintain consistent player bases, and the open-source nature means communities can keep games alive indefinitely.",
        },
        {
          question: "How do I find servers for open-source multiplayer games?",
          answer:
            "Most multiplayer games have built-in server browsers or community-maintained server lists. Many also have Discord servers or forums where players organize matches.",
        },
      ],
    },
    {
      slug: "single-player-open-source-games",
      title: "Best Single-Player Open Source Games in 2025",
      description:
        "Immersive single-player experiences without subscriptions or always-online requirements.",
      metaTitle:
        "Single-Player Open Source Games - Free Offline Games | Open Source Games",
      metaDescription:
        "Explore the best free single-player open-source games. No subscriptions, no DRM, just pure gaming enjoyment with full offline support.",
      filter: { isMultiplayer: false },
      icon: "user",
      faqs: [
        {
          question: "Do single-player open-source games work offline?",
          answer:
            "Yes! Single-player open-source games typically work fully offline. No internet connection required after downloading, and no DRM restrictions.",
        },
        {
          question: "How long are open-source single-player games?",
          answer:
            "Game length varies widely. Some offer quick play sessions while others provide dozens of hours of content. Many have high replayability due to procedural generation or modding support.",
        },
        {
          question: "Can I mod single-player open-source games?",
          answer:
            "Absolutely! Open-source games are perfect for modding. With full source code access, you can modify anything from game balance to adding entirely new content.",
        },
      ],
    },
    {
      slug: "browser-playable-open-source-games",
      title: "Browser-Playable Open Source Games",
      description:
        "Play instantly in your browser without downloads or installations.",
      metaTitle:
        "Browser Games - Play Free Open Source Games Online | Open Source Games",
      metaDescription:
        "Play open-source games directly in your browser. No downloads, no installation. Instant access to free games with HTML5 and WebGL.",
      filter: { platforms: ["web"], topics: ["html5", "webgl", "browser"] },
      icon: "globe",
      faqs: [
        {
          question: "Do browser games work on mobile devices?",
          answer:
            "Many browser-based open-source games work on mobile browsers, though experience varies. Games built with responsive design and touch controls work best on mobile.",
        },
        {
          question: "Are browser games as good as downloadable games?",
          answer:
            "Modern browser technology (WebGL, WebAssembly) enables impressive games. While some complex games still require downloads, many browser games offer excellent experiences.",
        },
        {
          question: "How do browser games save progress?",
          answer:
            "Browser games typically save progress using local storage or IndexedDB. Some offer cloud saves if you create an account. Your progress persists in the same browser.",
        },
      ],
    },
    {
      slug: "mobile-friendly-open-source-games",
      title: "Mobile-Friendly Open Source Games",
      description: "Open-source games optimized for Android and iOS devices.",
      metaTitle:
        "Mobile Open Source Games - Free Android & iOS Games | Open Source Games",
      metaDescription:
        "Discover free open-source games for mobile devices. Android and iOS compatible games without ads or in-app purchases.",
      filter: { platforms: ["android", "ios"] },
      icon: "smartphone",
      faqs: [
        {
          question: "Where can I download mobile open-source games?",
          answer:
            "Mobile open-source games are available through F-Droid (Android), App Store, Google Play, or by building from source. F-Droid is especially popular for open-source Android apps.",
        },
        {
          question: "Do mobile open-source games have ads?",
          answer:
            "Open-source games rarely include ads. Since the source code is public, intrusive ads would be easily removed. Most rely on donations or are passion projects.",
        },
        {
          question: "Can I play open-source games on tablets?",
          answer:
            "Yes! Most mobile-friendly open-source games work great on tablets, often with adapted interfaces for larger screens.",
        },
      ],
    },
    {
      slug: "games-for-kids",
      title: "Open Source Games for Kids",
      description: "Family-friendly, educational, and safe games for children.",
      metaTitle:
        "Open Source Games for Kids - Free Educational Games | Open Source Games",
      metaDescription:
        "Safe, free, and educational open-source games for children. No ads, no in-app purchases, no online dangers. Perfect for young gamers.",
      filter: { topics: ["kids", "educational", "family-friendly"] },
      icon: "baby",
      faqs: [
        {
          question: "Are open-source games safe for children?",
          answer:
            "Open-source games are generally safer for children as they don't contain hidden monetization, tracking, or inappropriate content. You can review the source code yourself.",
        },
        {
          question: "Do these games have educational value?",
          answer:
            "Many open-source games for kids are designed with educational goals, teaching programming logic, mathematics, reading, or creative thinking through gameplay.",
        },
        {
          question: "Can children play these games offline?",
          answer:
            "Yes! Most games work fully offline, eliminating concerns about online interactions or inappropriate content from other players.",
        },
      ],
    },
    {
      slug: "retro-style-open-source-games",
      title: "Retro-Style Open Source Games",
      description:
        "Classic pixel art aesthetics and nostalgic gameplay mechanics.",
      metaTitle:
        "Retro Open Source Games - Free Pixel Art Games | Open Source Games",
      metaDescription:
        "Relive classic gaming with free retro-style open-source games. Pixel art, chiptune music, and nostalgic gameplay. Perfect for retro gaming enthusiasts.",
      filter: { topics: ["retro", "pixel-art", "8bit", "16bit"] },
      icon: "monitor",
      faqs: [
        {
          question: "What makes a game retro-style?",
          answer:
            "Retro-style games embrace aesthetics from earlier gaming eras: pixel art graphics, chiptune soundtracks, simple controls, and gameplay mechanics reminiscent of classic arcade and console games.",
        },
        {
          question: "Do retro games run on low-end hardware?",
          answer:
            "Generally yes! Retro-style games typically have modest system requirements, making them perfect for older computers, Raspberry Pi, or other low-powered devices.",
        },
        {
          question: "Why are retro games popular?",
          answer:
            "Retro games offer nostalgia, accessible gameplay, and often focus on pure fun mechanics rather than complex systems. They're also easier to develop, encouraging indie and open-source projects.",
        },
      ],
    },
    {
      slug: "moddable-open-source-games",
      title: "Most Moddable Open Source Games",
      description: "Games designed for extensive modding and customization.",
      metaTitle:
        "Moddable Open Source Games - Create Your Own Content | Open Source Games",
      metaDescription:
        "Discover highly moddable open-source games. Create custom content, modify gameplay, and share your creations with the community.",
      filter: { topics: ["moddable", "modding", "extensible"] },
      icon: "wrench",
      faqs: [
        {
          question: "What can I mod in open-source games?",
          answer:
            "With full source code access, you can mod anything: game mechanics, graphics, sound, levels, UI, and more. Many games also support plugins or scripting for easier modding.",
        },
        {
          question: "Do I need programming skills to mod games?",
          answer:
            "Not always! Many games have modding tools or support simple configuration files. For deeper mods, basic programming knowledge helps but isn't always required.",
        },
        {
          question: "Where can I share my game mods?",
          answer:
            "Popular platforms include GitHub, ModDB, and game-specific forums or Discord servers. Many open-source games have active modding communities eager to try new content.",
        },
      ],
    },
    {
      slug: "cross-platform-open-source-games",
      title: "Cross-Platform Open Source Games",
      description: "Play on Windows, Mac, Linux, and more with the same game.",
      metaTitle:
        "Cross-Platform Open Source Games - Play Anywhere | Open Source Games",
      metaDescription:
        "Find open-source games that work on all platforms. Windows, macOS, Linux compatibility. Play the same game on any computer.",
      filter: { platforms: ["windows", "macos", "linux"] },
      icon: "layers",
      faqs: [
        {
          question: "Will my save files work across platforms?",
          answer:
            "Many cross-platform games store saves in compatible formats. Check each game's documentation, but save file portability is common in well-designed cross-platform games.",
        },
        {
          question: "Do all features work on every platform?",
          answer:
            "Most core features work identically, though some platform-specific features may vary. Games built with cross-platform frameworks tend to have the best compatibility.",
        },
        {
          question: "Which platforms are most supported?",
          answer:
            "Linux typically has the strongest support in open-source gaming, followed by Windows. macOS support varies but is common in popular projects.",
        },
      ],
    },
    {
      slug: "game-engines-open-source",
      title: "Open Source Game Engines and Frameworks",
      description: "Build your own games with free, open-source game engines.",
      metaTitle:
        "Open Source Game Engines - Free Game Development Tools | Open Source Games",
      metaDescription:
        "Explore open-source game engines and frameworks. Start building your own games with free, community-driven development tools.",
      filter: { topics: ["engine", "framework", "game-engine"] },
      icon: "cpu",
      faqs: [
        {
          question: "What's the best open-source game engine for beginners?",
          answer:
            "Godot is often recommended for beginners due to its intuitive interface, excellent documentation, and supportive community. It's completely free and open-source.",
        },
        {
          question: "Can I make commercial games with open-source engines?",
          answer:
            "Yes! Most open-source engines (like Godot, Bevy, or LOVE2D) allow commercial use. Check the specific license, but MIT and similar licenses typically permit commercial projects.",
        },
        {
          question: "Are open-source engines as capable as commercial ones?",
          answer:
            "Open-source engines have made tremendous progress. While they may lack some AAA-specific features, they're fully capable of creating professional-quality games.",
        },
      ],
    },
    {
      slug: "active-development-games",
      title: "Actively Developed Open Source Games",
      description:
        "Games with regular updates and active development communities.",
      metaTitle:
        "Active Open Source Games - Regularly Updated Free Games | Open Source Games",
      metaDescription:
        "Discover open-source games with active development. Regular updates, bug fixes, and new features from dedicated development teams.",
      filter: { minStars: 100 },
      icon: "activity",
      faqs: [
        {
          question: "How can I tell if a game is actively developed?",
          answer:
            "Check the GitHub repository for recent commits, open issues being addressed, and release history. Active projects typically have commits within the last few months.",
        },
        {
          question: "Can I contribute to game development?",
          answer:
            "Yes! Active projects often welcome contributions. Start by reading the CONTRIBUTING.md file, checking open issues, or asking in the project's community channels.",
        },
        {
          question: "Why choose actively developed games?",
          answer:
            "Active development means bug fixes, new content, security updates, and community support. You'll have a better experience and can participate in shaping the game's future.",
        },
      ],
    },
    {
      slug: "beginner-friendly-games",
      title: "Beginner-Friendly Open Source Games",
      description:
        "Easy to learn games perfect for newcomers to gaming or open source.",
      metaTitle:
        "Beginner-Friendly Open Source Games - Easy to Play Free Games | Open Source Games",
      metaDescription:
        "Find open-source games that are easy to pick up and play. Perfect for casual gamers and those new to open-source gaming.",
      filter: { topics: ["beginner", "casual", "easy"] },
      icon: "smile",
      faqs: [
        {
          question: "What makes a game beginner-friendly?",
          answer:
            "Beginner-friendly games have intuitive controls, clear tutorials, gradual difficulty progression, and forgiving gameplay that lets new players learn at their own pace.",
        },
        {
          question: "Are beginner games too easy for experienced players?",
          answer:
            "Many beginner-friendly games offer advanced modes or challenges for experienced players. The accessibility makes them great for playing with family and friends of all skill levels.",
        },
        {
          question: "How do I install these games?",
          answer:
            "Most beginner-friendly games have simple installation processes with pre-built binaries available for download. Check each game's README for specific instructions.",
        },
      ],
    },
    {
      slug: "3d-open-source-games",
      title: "3D Open Source Games",
      description:
        "Three-dimensional games with impressive graphics and immersive worlds.",
      metaTitle:
        "3D Open Source Games - Free 3D Games with Source Code | Open Source Games",
      metaDescription:
        "Explore open-source 3D games featuring impressive graphics and immersive gameplay. From FPS to racing, discover free 3D games.",
      filter: { topics: ["3d", "3d-graphics", "opengl", "vulkan"] },
      icon: "cube",
      faqs: [
        {
          question: "Can open-source 3D games match commercial graphics?",
          answer:
            "Many open-source 3D games feature impressive graphics. While they may not match AAA budgets, projects like Veloren and SuperTuxKart showcase what open-source can achieve.",
        },
        {
          question: "What graphics APIs do open-source 3D games use?",
          answer:
            "Common graphics APIs include OpenGL, Vulkan, and WebGL for browser games. Some engines like Godot support multiple backends for cross-platform compatibility.",
        },
        {
          question: "Do 3D open-source games require powerful hardware?",
          answer:
            "Requirements vary widely. Many open-source 3D games are well-optimized and run on modest hardware, while some showcase cutting-edge graphics requiring modern GPUs.",
        },
      ],
    },
    {
      slug: "2d-open-source-games",
      title: "2D Open Source Games",
      description: "Classic two-dimensional games from platformers to RPGs.",
      metaTitle:
        "2D Open Source Games - Free 2D Platformers, RPGs & More | Open Source Games",
      metaDescription:
        "Discover open-source 2D games including platformers, RPGs, puzzle games, and more. Classic gameplay with modern polish.",
      filter: { topics: ["2d", "2d-game", "pixel-art", "platformer"] },
      icon: "square",
      faqs: [
        {
          question: "Why are 2D games so popular in open source?",
          answer:
            "2D games are more accessible to develop, requiring smaller teams and less complex art. This makes them perfect for indie and open-source projects where resources are limited.",
        },
        {
          question: "Can 2D games be as engaging as 3D games?",
          answer:
            "Absolutely! 2D games often focus on tight gameplay mechanics, compelling stories, and beautiful art. Many beloved games like Celeste and Hollow Knight prove 2D can be incredibly engaging.",
        },
        {
          question: "What engines are best for 2D open-source games?",
          answer:
            "Popular choices include Godot, Pygame, LOVE2D, and Phaser. Each has strengths: Godot for full-featured development, Pygame for Python learners, LOVE2D for Lua simplicity.",
        },
      ],
    },
    {
      slug: "turn-based-open-source-games",
      title: "Turn-Based Open Source Games",
      description:
        "Strategy and RPG games where you take turns making decisions.",
      metaTitle:
        "Turn-Based Open Source Games - Free Strategy & Tactical Games | Open Source Games",
      metaDescription:
        "Play free turn-based open-source games. From tactical combat to strategic empire building, find games that reward careful planning.",
      filter: { topics: ["turn-based", "tactical", "strategy"] },
      icon: "clock",
      faqs: [
        {
          question: "What types of turn-based games are available?",
          answer:
            "Turn-based open-source games include tactical RPGs, 4X strategy games, roguelikes, card games, and classic board game adaptations. Something for every strategic mind.",
        },
        {
          question: "Are turn-based games good for beginners?",
          answer:
            "Turn-based games are excellent for beginners as they allow time to think and plan. There's no time pressure, making them more accessible than real-time games.",
        },
        {
          question: "Can I play turn-based games with friends?",
          answer:
            "Many turn-based games support multiplayer, either local hot-seat play, online matches, or play-by-email for longer strategic games.",
        },
      ],
    },
    {
      slug: "open-source-emulators",
      title: "Open Source Emulators",
      description:
        "Play classic console and arcade games with open-source emulators.",
      metaTitle:
        "Open Source Emulators - Free Console & Arcade Emulation | Open Source Games",
      metaDescription:
        "Discover open-source emulators for retro gaming. Play classic console and arcade games with free, community-developed emulation software.",
      filter: { topics: ["emulator", "retro", "console", "arcade"] },
      icon: "gamepad-2",
      faqs: [
        {
          question: "Are emulators legal?",
          answer:
            "Emulators themselves are legal as they don't contain copyrighted code. However, downloading copyrighted game ROMs you don't own is illegal. Use emulators with your own game backups.",
        },
        {
          question: "Which consoles can I emulate?",
          answer:
            "Open-source emulators exist for most classic consoles: NES, SNES, Game Boy, PlayStation, N64, and more. Newer systems are also supported with varying accuracy.",
        },
        {
          question: "How accurate are open-source emulators?",
          answer:
            "Many open-source emulators prioritize accuracy. Projects like BSNES/higan achieve cycle-accurate SNES emulation, while others balance accuracy with performance.",
        },
      ],
    },
    {
      slug: "co-op-open-source-games",
      title: "Co-op Open Source Games",
      description:
        "Play together with friends in cooperative multiplayer games.",
      metaTitle:
        "Co-op Open Source Games - Free Cooperative Multiplayer | Open Source Games",
      metaDescription:
        "Find open-source games to play with friends. Cooperative multiplayer games where teamwork leads to victory.",
      filter: { topics: ["coop", "co-op", "cooperative", "multiplayer"] },
      icon: "users",
      faqs: [
        {
          question: "Can I play co-op games online?",
          answer:
            "Many open-source co-op games support online multiplayer. Some use dedicated servers, others peer-to-peer connections. Check each game's documentation for setup instructions.",
        },
        {
          question: "Do I need to host a server for co-op?",
          answer:
            "It depends on the game. Some have built-in hosting, others require separate server software. Open-source games often have community-hosted public servers too.",
        },
        {
          question: "What types of co-op experiences are available?",
          answer:
            "Open-source co-op games range from survival crafting to tactical shooters, puzzle games to MMO-style adventures. There's something for every group of friends.",
        },
      ],
    },
    {
      slug: "clicker-idle-games",
      title: "Open Source Clicker and Idle Games",
      description:
        "Incremental games that play themselves while you watch numbers go up.",
      metaTitle:
        "Open Source Clicker & Idle Games - Free Incremental Games | Open Source Games",
      metaDescription:
        "Discover free open-source clicker and idle games. Watch numbers grow exponentially in these addictive incremental games.",
      filter: { topics: ["clicker", "idle", "incremental"] },
      icon: "mouse-pointer",
      faqs: [
        {
          question: "What makes idle games so addictive?",
          answer:
            "Idle games tap into our desire for progression and optimization. The constant growth and upgrade systems provide satisfying feedback loops that keep players engaged.",
        },
        {
          question: "Can I mod open-source idle games?",
          answer:
            "Yes! With source code access, you can modify progression rates, add new features, or create entirely new upgrade trees. Many idle games are written in JavaScript, making modding accessible.",
        },
        {
          question: "Do idle games work offline?",
          answer:
            "Many open-source idle games support offline progress, calculating gains when you return. Check each game's features as implementation varies.",
        },
      ],
    },
    {
      slug: "vr-open-source-games",
      title: "VR Open Source Games",
      description:
        "Virtual reality games and experiences with open source code.",
      metaTitle:
        "VR Open Source Games - Free Virtual Reality Games | Open Source Games",
      metaDescription:
        "Explore open-source VR games and experiences. Free virtual reality content for various headsets with source code access.",
      filter: { topics: ["vr", "virtual-reality", "oculus", "steamvr"] },
      icon: "glasses",
      faqs: [
        {
          question: "Which VR headsets are supported?",
          answer:
            "Support varies by project. Many open-source VR games work with SteamVR-compatible headsets (Valve Index, Vive, Quest with Link). Some support Oculus native or other platforms.",
        },
        {
          question: "Are there open-source VR engines?",
          answer:
            "Yes! Godot 4 has VR support, and projects like OpenHMD provide open-source VR runtime. Many games use OpenXR for cross-platform VR compatibility.",
        },
        {
          question: "Can I develop VR games with open-source tools?",
          answer:
            "Absolutely! Godot, Blender, and various open-source libraries make VR development accessible. The open-source community actively develops VR tools and resources.",
        },
      ],
    },
    {
      slug: "text-based-games",
      title: "Open Source Text-Based Games",
      description: "Interactive fiction, MUDs, and text adventures.",
      metaTitle:
        "Text-Based Open Source Games - Free Interactive Fiction | Open Source Games",
      metaDescription:
        "Discover open-source text-based games and interactive fiction. From classic text adventures to modern narrative games.",
      filter: {
        topics: ["text-based", "interactive-fiction", "mud", "text-adventure"],
      },
      icon: "type",
      faqs: [
        {
          question: "What are text-based games?",
          answer:
            "Text-based games use written descriptions instead of graphics. Players type commands or make choices to interact with the game world. They range from classic adventures to complex MUDs.",
        },
        {
          question: "Are text-based games still popular?",
          answer:
            "Yes! Interactive fiction has a dedicated community. Modern tools like Twine and Ink make creating narrative games accessible, and the genre has evolved with new innovations.",
        },
        {
          question: "How do I play text-based games?",
          answer:
            "Most run in terminals, browsers, or dedicated interpreters. Classic formats like Z-machine have multiple open-source interpreters. Many modern games are browser-based.",
        },
      ],
    },
    {
      slug: "educational-programming-games",
      title: "Open Source Programming Games",
      description:
        "Learn to code while playing games that teach programming concepts.",
      metaTitle:
        "Programming Games - Learn to Code with Open Source Games | Open Source Games",
      metaDescription:
        "Learn programming through play with open-source coding games. From visual programming to algorithm challenges.",
      filter: {
        topics: ["programming", "coding", "learn-to-code", "educational"],
      },
      icon: "code",
      faqs: [
        {
          question: "Can games really teach programming?",
          answer:
            "Yes! Programming games teach problem-solving, logic, and specific language syntax in engaging ways. Many developers started with games like these.",
        },
        {
          question: "What programming languages can I learn?",
          answer:
            "Various games teach different languages: JavaScript, Python, Lua, and even visual programming. Some teach general concepts applicable to any language.",
        },
        {
          question: "Are these suitable for complete beginners?",
          answer:
            "Many programming games are designed specifically for beginners, starting with basic concepts and gradually introducing complexity. Perfect for all skill levels.",
        },
      ],
    },
    {
      slug: "open-world-games",
      title: "Open World Open Source Games",
      description: "Explore vast, open worlds at your own pace.",
      metaTitle:
        "Open World Open Source Games - Free Exploration Games | Open Source Games",
      metaDescription:
        "Discover open-source open world games with vast landscapes to explore. From survival games to RPGs, find your next adventure.",
      filter: { topics: ["open-world", "exploration", "sandbox"] },
      icon: "map",
      faqs: [
        {
          question: "What defines an open world game?",
          answer:
            "Open world games feature large, freely explorable environments where players choose their own path. They emphasize player freedom over linear storytelling.",
        },
        {
          question: "Are open world games demanding on hardware?",
          answer:
            "It varies. Some open-source open world games are well-optimized for modest hardware, while others with detailed 3D worlds may require more powerful systems.",
        },
        {
          question: "Do open world games have stories?",
          answer:
            "Many do! While exploration is central, open world games often feature main quests, side stories, and emergent narratives from player actions.",
        },
      ],
    },
    {
      slug: "local-multiplayer-games",
      title: "Local Multiplayer Open Source Games",
      description: "Games to play together on the same screen.",
      metaTitle:
        "Local Multiplayer Open Source Games - Couch Co-op Free Games | Open Source Games",
      metaDescription:
        "Find open-source games for local multiplayer. Perfect for game nights with friends and family on a single screen.",
      filter: { topics: ["local-multiplayer", "couch-coop", "split-screen"] },
      icon: "monitor",
      faqs: [
        {
          question: "What controllers work with local multiplayer games?",
          answer:
            "Most games support standard gamepads (Xbox, PlayStation controllers). Some support keyboard sharing or multiple keyboards. Check each game's documentation.",
        },
        {
          question: "How many players can play locally?",
          answer:
            "Typically 2-4 players, though some games support more. Split-screen games may require larger displays for comfortable viewing with more players.",
        },
        {
          question: "Can I connect multiple computers for LAN play?",
          answer:
            "Many games support LAN multiplayer as an alternative to local split-screen, offering the best of both worlds for groups with multiple devices.",
        },
      ],
    },
    {
      slug: "speedrunning-games",
      title: "Open Source Speedrunning Games",
      description:
        "Games popular in the speedrunning community with competitive potential.",
      metaTitle:
        "Speedrunning Open Source Games - Competitive Speed Games | Open Source Games",
      metaDescription:
        "Discover open-source games perfect for speedrunning. Tight controls, interesting mechanics, and active speedrun communities.",
      filter: { topics: ["speedrun", "speedrunning", "competitive"] },
      icon: "timer",
      faqs: [
        {
          question: "What makes a game good for speedrunning?",
          answer:
            "Good speedrun games have precise controls, interesting movement mechanics, route optimization potential, and ideally, built-in timing or replay features.",
        },
        {
          question: "Are there leaderboards for open-source speedruns?",
          answer:
            "Some games have dedicated leaderboards. Many use speedrun.com for tracking records. The open-source nature allows for verified, unmodified game versions.",
        },
        {
          question: "Can I modify games for speedrun practice?",
          answer:
            "Yes! Open-source games can be modified for practice modes, save states, and tools. Just be sure to run unmodified versions for official record attempts.",
        },
      ],
    },
    {
      slug: "procedurally-generated-games",
      title: "Procedurally Generated Open Source Games",
      description:
        "Games with procedural generation for endless unique experiences.",
      metaTitle:
        "Procedurally Generated Open Source Games - Infinite Replayability | Open Source Games",
      metaDescription:
        "Discover open-source games with procedural generation. Every playthrough is unique with algorithmically created content.",
      filter: { topics: ["procedural", "procedural-generation", "roguelike"] },
      icon: "shuffle",
      faqs: [
        {
          question: "What is procedural generation?",
          answer:
            "Procedural generation uses algorithms to create game content like levels, items, or worlds. This provides infinite variety, making each playthrough unique.",
        },
        {
          question: "Which open-source games use procedural generation?",
          answer:
            "Many roguelikes and roguelites use procedural generation. Games like NetHack, Cataclysm DDA, and Dwarf Fortress pioneered these techniques in open source.",
        },
        {
          question: "Is procedural content as good as handcrafted?",
          answer:
            "It's different! Procedural generation excels at variety and replayability, while handcrafted content offers more curated experiences. Many games combine both approaches.",
        },
      ],
    },
    {
      slug: "accessibility-focused-games",
      title: "Accessibility-Focused Open Source Games",
      description:
        "Games designed with accessibility features for all players.",
      metaTitle:
        "Accessible Open Source Games - Games for Everyone | Open Source Games",
      metaDescription:
        "Find open-source games with accessibility features. Remappable controls, colorblind modes, screen reader support, and more.",
      filter: { topics: ["accessibility", "accessible", "a11y"] },
      icon: "accessibility",
      faqs: [
        {
          question: "What accessibility features can games have?",
          answer:
            "Common features include remappable controls, colorblind modes, screen reader support, adjustable text sizes, audio cues, reduced motion options, and one-handed play modes.",
        },
        {
          question: "Can I add accessibility features to open-source games?",
          answer:
            "Yes! Open-source games welcome accessibility improvements. You can contribute features like colorblind modes, alternative control schemes, or improved UI readability.",
        },
        {
          question:
            "Are there games specifically for visually impaired players?",
          answer:
            "Yes, audio games and games with comprehensive screen reader support exist. The open-source community has created several games designed primarily for audio-based play.",
        },
      ],
    },
    {
      slug: "game-jams-open-source",
      title: "Game Jam Open Source Games",
      description:
        "Creative games born from game jams with source code available.",
      metaTitle:
        "Game Jam Open Source Games - Creative Jam Games | Open Source Games",
      metaDescription:
        "Explore open-source games created during game jams. Unique, creative experiences made in limited time with source code available.",
      filter: { topics: ["game-jam", "gamejam", "jam"] },
      icon: "sparkles",
      faqs: [
        {
          question: "What are game jam games?",
          answer:
            "Game jams are events where developers create games in a limited time (usually 48-72 hours). The results are often innovative and experimental, with many releasing their source code.",
        },
        {
          question: "Are game jam games polished?",
          answer:
            "Jam games vary in polish. Some are rough prototypes, while others are remarkably complete. Many developers continue improving their jam games after the event.",
        },
        {
          question: "Can I learn from game jam source code?",
          answer:
            "Absolutely! Jam games are excellent learning resources. They show how developers quickly prototype ideas and solve problems under time pressure.",
        },
      ],
    },
  ];
}

// Helper functions for icons (Lucide icon names)
function getGenreIcon(genre: string): string {
  const icons: Record<string, string> = {
    rpg: "sword",
    fps: "crosshair",
    rts: "flag",
    puzzle: "puzzle",
    platformer: "footprints",
    roguelike: "skull",
    simulation: "plane",
    strategy: "chess",
    racing: "car",
    sandbox: "box",
    card: "spade",
    "tower-defense": "tower-control",
    adventure: "compass",
    survival: "campfire",
    horror: "ghost",
    arcade: "joystick",
    fighting: "swords",
    sports: "trophy",
    music: "music",
    educational: "graduation-cap",
  };
  return icons[genre] || "gamepad-2";
}

function getLanguageIcon(language: string): string {
  const normalized = language.trim().toLowerCase();
  if (["c", "c++", "rust", "go", "zig"].includes(normalized)) return "cpu";
  return "code";
}

function getEngineIcon(engine: string): string {
  const normalized = engine.trim().toLowerCase();
  if (normalized.includes("godot")) return "wrench";
  if (normalized.includes("unity")) return "layers";
  if (normalized.includes("unreal")) return "layers";
  return "cog";
}

function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    "raspberry-pi": "cpu",
    "old-pcs": "monitor",
    "low-end": "hard-drive",
    linux: "terminal",
    macos: "apple",
    windows: "layout-grid",
    android: "smartphone",
    ios: "smartphone",
    web: "globe",
    "steam-deck": "gamepad-2",
  };
  return icons[platform] || "monitor";
}

// Generate all categories
export function getAllCategories(): Category[] {
  return [
    ...generateGenreCategories(),
    ...generateLanguageCategories(),
    ...generateEngineCategories(),
    ...generateAlternativeCategories(),
    ...generatePlatformCategories(),
    ...generateSpecialCategories(),
  ];
}

// Get category by slug
export function getCategoryBySlug(slug: string): Category | undefined {
  return getAllCategories().find((cat) => cat.slug === slug);
}

// Get all category slugs for static generation
export function getAllCategorySlugs(): string[] {
  return getAllCategories().map((cat) => cat.slug);
}

// Group categories by type for the index page
export function getCategoriesByType(): Record<string, Category[]> {
  return {
    "By Genre": generateGenreCategories(),
    "By Programming Language": generateLanguageCategories(),
    "By Game Engine": generateEngineCategories(),
    "Commercial Alternatives": generateAlternativeCategories(),
    "By Platform": generatePlatformCategories(),
    "Special Collections": generateSpecialCategories(),
  };
}

// Export count for stats
export const TOTAL_CATEGORIES = getAllCategories().length;
