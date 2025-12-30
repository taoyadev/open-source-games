# Fetching Open Source Games

This document explains how to use the `fetch-more-games.ts` script to discover new open-source games from multiple sources and add them to the database.

## Overview

The `fetch-more-games.ts` script fetches open-source games from multiple GitHub repositories and sources:

1. **michelpereira/awesome-open-source-games** - A curated list with hundreds of games
2. **bobeff/open-source-games** - Another curated list
3. **leereilly/games** - Games on GitHub repository
4. **GitHub topic search** - Searches for game-related repositories tagged with `open-source-game`
5. **Extended web directories (optional)** - Wikipedia / LibreGameWiki / OSGameClones / itch.io, etc. (disabled by default)

## Usage

### Basic Usage

```bash
# Set your GitHub token (recommended to avoid rate limits)
export GITHUB_TOKEN=your_token_here

# Fetch games from enabled sources
npm run fetch

# Dry run without GitHub API metadata fetching
npm run fetch:dry

# Limit to first N games (for testing)
npm run fetch:limit 50
```

### Advanced Usage

```bash
# Fetch from specific sources only
npx tsx scripts/fetch-more-games.ts --sources awesome-open-source-games,bobeff-open-source-games

# Enable extended sources (disabled by default)
npx tsx scripts/fetch-more-games.ts --sources wikipedia-open-source-video-games,libregamewiki-list-of-games,osgameclones

# Output JSON instead of markdown
npx tsx scripts/fetch-more-games.ts --json --output data/fetched-games.json

# Use custom existing games file for deduplication
npx tsx scripts/fetch-more-games.ts --existing data/my-games.json

# Limit number of games to process
npx tsx scripts/fetch-more-games.ts --limit 100
```

## Options

| Option            | Description                                                         |
| ----------------- | ------------------------------------------------------------------- |
| `--limit N`       | Only process first N games (for testing)                            |
| `--sources X,Y`   | Comma-separated list of sources to fetch (default: enabled sources) |
| `--no-api`        | Skip GitHub API metadata fetching                                   |
| `--output PATH`   | Output file path (default: data/fetched-games.md)                   |
| `--json`          | Output JSON instead of markdown                                     |
| `--existing PATH` | Path to existing games.json for deduplication                       |

## Workflow

1. **Fetch games** from multiple sources

   ```bash
   npm run fetch
   ```

   This creates `data/fetched-games.md` with all discovered games.

2. **Review** the fetched games

   ```bash
   cat data/fetched-games.md
   ```

3. **Parse to JSON** (if you want JSON format)

   ```bash
   npx tsx scripts/parse-games-list.ts data/fetched-games.md --output data/fetched-games.json
   ```

4. **Sync to database**
   ```bash
   npm run sync:local
   ```

## Curated Popular Games

A hand-picked list of popular open-source games is available at `data/curated-popular-games.md`. This includes well-known games like:

- **Minetest** - Voxel sandbox game (Minecraft-inspired)
- **Veloren** - Voxel RPG
- **osu!** - Rhythm game
- **Taisei** - Touhou Project clone
- **Teeworlds** - Multiplayer shooter
- **Pixel Dungeon** - Roguelike
- **Unvanquished** - FPS/RTS hybrid
- **FlightGear** - Flight simulator
- **2048** - Puzzle game
- **Lichess** - Chess server
- And many more...

To import the curated list:

```bash
# Parse the curated list
npx tsx scripts/parse-games-list.ts data/curated-popular-games.md --output data/curated-parsed.json

# Then use sync-games.ts to sync to database
npm run sync:local
```

## Sources

The script currently supports these sources:

| Source                            | Description                                     | Default |
| --------------------------------- | ----------------------------------------------- | ------- |
| awesome-open-source-games         | michelpereira/awesome-open-source-games         | ✅      |
| bobeff-open-source-games          | bobeff/open-source-games                        | ✅      |
| leereilly-games                   | leereilly/games                                 | ✅      |
| github-topic-open-source-game     | GitHub search (`topic:open-source-game`)        | ✅      |
| wikipedia-open-source-video-games | Wikipedia list page (extract GitHub repos)      | ❌      |
| libregamewiki-list-of-games       | LibreGameWiki list page (extract GitHub repos)  | ❌      |
| osgameclones                      | OSGameClones website (extract GitHub repos)     | ❌      |
| awesome-game-remakes              | radek-sprta/awesome-game-remakes                | ❌      |
| gamesdev-directory                | gamesdev.github.io directory (extract GitHub)   | ❌      |
| libregames-directory              | libregames.gitlab.io directory (extract GitHub) | ❌      |
| itchio-open-source-tag            | itch.io tag crawl (extract GitHub from pages)   | ❌      |

## Skipping Non-Game Entries

The script automatically skips entries that appear to be non-game projects:

- Game engines (Godot, Unity, etc.)
- Frameworks and libraries
- SDKs and toolkits
- Templates and boilerplates
- Tutorials and examples
- Asset packs

## Output Format

The script generates markdown output compatible with `parse-games-list.ts`:

```markdown
## Category Name

- **[Game Title](https://github.com/owner/repo)** _[Category]_ - Description. (Language: C++, Stars: 1000)
```

## Troubleshooting

### Rate Limits

GitHub API has rate limits:

- **Without token**: 60 requests/hour
- **With token**: 5,000 requests/hour

To avoid rate limits, set a GitHub token:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

### Duplicate Games

The script automatically compares against existing games in `data/games.json` to avoid duplicates. Games are identified by `owner/repo` (case-insensitive).

### Parsing Errors

If some games fail to parse, check the output file. The script logs skipped entries with reasons like:

- "No title found" - Could not extract game name
- "No GitHub URL found" - No GitHub repository link
- "Non-game entry" - Filtered as engine/framework

## Related Scripts

- `scripts/parse-games-list.ts` - Parse markdown game lists to JSON
- `scripts/scraper.ts` - Fetch GitHub metadata for games
- `scripts/sync-games.ts` - Sync games to database
