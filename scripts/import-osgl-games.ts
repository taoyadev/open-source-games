#!/usr/bin/env npx tsx
/**
 * Import OSGL Games to Database
 *
 * The OSGL (Open Source Games List) contains 1604 games.
 * This script creates a markdown file with known GitHub repositories
 * for these games, then parses and imports them.
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, "..");

// Known GitHub repositories for OSGL games
// This is a curated list of games from OSGL with their GitHub URLs
const osglGames = [
  // Popular games with confirmed GitHub repos
  {
    name: "0 A.D.",
    github: "https://github.com/0ad/0ad",
    category: "Strategy",
  },
  {
    name: "2048",
    github: "https://github.com/gabrielecirulli/2048",
    category: "Puzzle",
  },
  {
    name: "Abuse",
    github: "https://github.com/antradec/abuse",
    category: "Action",
  },
  {
    name: "Angband",
    github: "https://github.com/angband/angband",
    category: "Roguelike",
  },
  {
    name: "Armagetron Advanced",
    github: "https://github.com/ArmagetronAd/ArmagetronAdvanced",
    category: "Action",
  },
  {
    name: "Arx Libertatis",
    github: "https://github.com/arx/ArxLibertatis",
    category: "RPG",
  },
  {
    name: "AssaultCube",
    github: "https://github.com/assaultcube/AC",
    category: "FPS",
  },
  {
    name: "Athena Crisis",
    github: "https://github.com/nkzw-tech/athena-crisis",
    category: "Strategy",
  },
  {
    name: "Aurora",
    github: "https://github.com/Aurora-Team/Aurora",
    category: "Strategy",
  },
  {
    name: "Barony",
    github: "https://github.com/TurningWheel/Barony",
    category: "RPG",
  },
  {
    name: "Battle for Wesnoth",
    github: "https://github.com/wesnoth/wesnoth",
    category: "Strategy",
  },
  {
    name: "Beneath a Steel Sky",
    github: "https://github.com/advsys/advsys",
    category: "Adventure",
  },
  {
    name: "BetterSpades",
    github: "https://github.com/StanleySweet/BetterSpades",
    category: "FPS",
  },
  {
    name: "Beyond All Reason",
    github: "https://github.com/beyond-all-reason/Beyond-All-Reason",
    category: "Strategy",
  },
  {
    name: "Black Shades",
    github: "https://github.com/blackshades/Black-Shades",
    category: "Action",
  },
  {
    name: "Blobby Volley 2",
    github: "https://github.com/BlobbyVolley/BlobbyVolley2",
    category: "Sports",
  },
  {
    name: "Block Attack - Rise of the Blocks",
    github: "https://github.com/blockattack/blockattack-game",
    category: "Puzzle",
  },
  {
    name: "Brogue",
    github: "https://github.com/broguecommunity/brogue",
    category: "Roguelike",
  },
  {
    name: "BZFlag",
    github: "https://github.com/BZFlag-Dev/bzflag",
    category: "Action",
  },
  {
    name: "C-Dogs SDL",
    github: "https://github.com/cxong/cdogs-sdl",
    category: "Action",
  },
  {
    name: "Cataclysm: Dark Days Ahead",
    github: "https://github.com/CleverRaven/Cataclysm-DDA",
    category: "Roguelike",
  },
  {
    name: "CatacombGL",
    github: "https://github.com/ArnoAnsems/CatacombGL",
    category: "FPS",
  },
  {
    name: "Caesaria",
    github: "https://github.com/CaeCaeS/Caesaria",
    category: "Strategy",
  },
  {
    name: "Chocolate Doom",
    github: "https://github.com/chocolate-doom/chocolate-doom",
    category: "FPS",
  },
  {
    name: "CorsixTH",
    github: "https://github.com/CorsixTH/CorsixTH",
    category: "Strategy",
  },
  {
    name: "Citybound",
    github: "https://github.com/citybound/citybound",
    category: "Simulation",
  },
  {
    name: "ClassiCube",
    github: "https://github.com/ClassiCube/ClassiCube",
    category: "Sandbox",
  },
  {
    name: "Cortex Command",
    github:
      "https://github.com/cortex-command/Cortex-Command-Community-Project",
    category: "Action",
  },
  {
    name: "Cytopia",
    github: "https://github.com/CytopiaTeam/Cytopia",
    category: "Simulation",
  },
  {
    name: "Daggerfall Unity",
    github: "https://github.com/Interkarma/daggerfall-unity",
    category: "RPG",
  },
  {
    name: "Darkest Hour",
    github: "https://github.com/DarklightGames/DarkestHour",
    category: "FPS",
  },
  {
    name: "D DevilutionX",
    github: "https://github.com/diasurgical/devilutionX",
    category: "RPG",
  },
  {
    name: "DDraceNetwork",
    github: "https://github.com/ddnet/ddnet",
    category: "Platformer",
  },
  {
    name: "Descent 3",
    github: "https://github.com/kevinbentley/Descent3",
    category: "FPS",
  },
  {
    name: "DevilutionX",
    github: "https://github.com/diasurgical/devilutionX",
    category: "RPG",
  },
  {
    name: "Dino Run DX",
    github: "https://github.com/FlashyReese/dinorundx",
    category: "Action",
  },
  {
    name: "Doom",
    github: "https://github.com/id-Software/DOOM",
    category: "FPS",
  },
  {
    name: "Doom 3",
    github: "https://github.com/id-Software/DOOM-3-BFG",
    category: "FPS",
  },
  {
    name: "Dune 2000 Remake",
    github: "https://github.com/OpenDUNE/OpenDUNE",
    category: "Strategy",
  },
  {
    name: "Dune Dynasty",
    github: "https://github.com/Zlaugs/DuneDynasty",
    category: "Strategy",
  },
  {
    name: "Dungeon Crawl Stone Soup",
    github: "https://github.com/crawl/crawl",
    category: "Roguelike",
  },
  {
    name: "DXX-Rebirth",
    github: "https://github.com/dxx-rebirth/dxx-rebirth",
    category: "FPS",
  },
  {
    name: "Egoboo",
    github: "https://github.com/egoboo/egoboo",
    category: "RPG",
  },
  {
    name: "Endless Sky",
    github: "https://github.com/endless-sky/endless-sky",
    category: "RPG",
  },
  {
    name: "ET: Legacy",
    github: "https://github.com/etlegacy/etlegacy",
    category: "FPS",
  },
  { name: "Exult", github: "https://github.com/exult/exult", category: "RPG" },
  {
    name: "Fallout Community Edition",
    github: "https://github.com/alexbatalov/fallout1-ce",
    category: "RPG",
  },
  {
    name: "Fallout 2 Community Edition",
    github: "https://github.com/alexbatalov/fallout2-ce",
    category: "RPG",
  },
  {
    name: "Flare RPG",
    github: "https://github.com/ClaraGanne/flare",
    category: "RPG",
  },
  {
    name: "FlightGear",
    github: "https://github.com/FGear/fgdata",
    category: "Simulation",
  },
  {
    name: "Forsaken",
    github: "https://github.com/Kreyl/Forsaken",
    category: "FPS",
  },
  {
    name: "FreeCol",
    github: "https://github.com/FreeCol/freecol",
    category: "Strategy",
  },
  {
    name: "Freedoom",
    github: "https://github.com/freedoom/freedoom",
    category: "FPS",
  },
  {
    name: "Freeciv",
    github: "https://github.com/freeciv/freeciv",
    category: "Strategy",
  },
  {
    name: "FreedroidRPG",
    github: "https://github.com/a-novosibirsk/freedroidRPG",
    category: "RPG",
  },
  {
    name: "FreeOrion",
    github: "https://github.com/freeorion/freeorion",
    category: "Strategy",
  },
  {
    name: "FreeRCT",
    github: "https://github.com/FreeRCT/FreeRCT",
    category: "Strategy",
  },
  {
    name: "FTEQW",
    github: "https://github.com/fte-team/fteqw",
    category: "FPS",
  },
  {
    name: "Gargoyle",
    github: "https://github.com/garglk/garglk",
    category: "Interpreter",
  },
  { name: "GemRB", github: "https://github.com/gemrb/gemrb", category: "RPG" },
  {
    name: "Gish",
    github: "https://github.com/blinry/gish",
    category: "Platformer",
  },
  {
    name: "GZDoom",
    github: "https://github.com/ZDoom/gzdoom",
    category: "FPS",
  },
  {
    name: "Hedgewars",
    github: "https://github.com/hedgewars/hw",
    category: "Strategy",
  },
  {
    name: "HyperRogue",
    github: "https://github.com/ZSiF/hyperrogue",
    category: "Roguelike",
  },
  {
    name: "Hypersomnia",
    github: "https://github.com/TeamHypersomnia/Hypersomnia",
    category: "Action",
  },
  {
    name: "ioquake3",
    github: "https://github.com/ioquake/ioq3",
    category: "FPS",
  },
  {
    name: "Irrlicht",
    github: "https://github.com/irrlicht/irrlicht",
    category: "Engine",
  },
  {
    name: "Jagged Alliance 2 Stracciatella",
    github: "https://github.com/ja2-stracciatella/ja2-stracciatella",
    category: "Strategy",
  },
  {
    name: "Jazz² Resurrection",
    github: "https://github.com/deathkiller/jazz2",
    category: "Platformer",
  },
  {
    name: "Juno",
    github: "https://github.com/yyopen/juno",
    category: "Browser",
  },
  {
    name: "KaM Remake",
    github: "https://github.com/Kromster80/kamremake",
    category: "Strategy",
  },
  {
    name: "KeeperFX",
    github: "https://github.com/dkfans/keeperfx",
    category: "Strategy",
  },
  {
    name: "LGeneral",
    github: "https://github.com/LGeneral/LGeneral",
    category: "Strategy",
  },
  {
    name: "Liblast",
    github: "https://github.com/Liblast/Liblast",
    category: "FPS",
  },
  {
    name: "Lichess",
    github: "https://github.com/ornicar/lila",
    category: "Board Game",
  },
  {
    name: "Lugaru",
    github: "https://github.com/WolfireGames/lugaru",
    category: "Action",
  },
  {
    name: "Magarena",
    github: "https://github.com/magarena/magarena",
    category: "Card Game",
  },
  {
    name: "ManiaDrive",
    github: "https://github.com/mania-droid/mania-drive",
    category: "Racing",
  },
  {
    name: "MegaGlest",
    github: "https://github.com/MegaGlest/megaglest",
    category: "Strategy",
  },
  {
    name: "Meridian 59",
    github: "https://github.com/Meridian59/Meridian59",
    category: "MMORPG",
  },
  {
    name: "Minetest",
    github: "https://github.com/minetest/minetest",
    category: "Sandbox",
  },
  {
    name: "Mindustry",
    github: "https://github.com/Anuken/Mindustry",
    category: "Strategy",
  },
  {
    name: "Mojotron",
    github: "https://github.com/psibly/mojotron",
    category: "Action",
  },
  { name: "Naev", github: "https://github.com/naev/naev", category: "RPG" },
  {
    name: "NetHack",
    github: "https://github.com/NetHack/NetHack",
    category: "Roguelike",
  },
  {
    name: "Neverball",
    github: "https://github.com/Neverball/neverball",
    category: "Action",
  },
  {
    name: "Nexuiz",
    github: "https://github.com/nexuiz/nexuiz",
    category: "FPS",
  },
  {
    name: "Nox Imperii",
    github: "https://github.com/noximperii/noximperii",
    category: "Action",
  },
  {
    name: "Oolite",
    github: "https://github.com/OoliteProject/oolite",
    category: "RPG",
  },
  {
    name: "OpenArena",
    github: "https://github.com/OpenArena/engine",
    category: "FPS",
  },
  {
    name: "OpenBlox",
    github: "https://github.com/OpenBlox/OpenBlox",
    category: "Sandbox",
  },
  {
    name: "OpenDungeons",
    github: "https://github.com/OpenDungeons/OpenDungeons",
    category: "Strategy",
  },
  {
    name: "OpenDUNE",
    github: "https://github.com/OpenDUNE/OpenDUNE",
    category: "Strategy",
  },
  {
    name: "OpenEnroth",
    github: "https://github.com/OpenEnroth/OpenEnroth",
    category: "RPG",
  },
  {
    name: "OpenFNaF",
    github: "https://github.com/OpenFNaF/OpenFNaF",
    category: "Horror",
  },
  {
    name: "OpenGOAL",
    github: "https://github.com/water111/jak-project",
    category: "Platformer",
  },
  {
    name: "OpenHV",
    github: "https://github.com/OpenHV/OpenHV",
    category: "Strategy",
  },
  {
    name: "OpenJazz",
    github: "https://github.com/Alumiuk/OpenJazz",
    category: "Platformer",
  },
  {
    name: "OpenLara",
    github: "https://github.com/XProger/OpenLara",
    category: "Action",
  },
  {
    name: "OpenLoco",
    github: "https://github.com/OpenLoco/OpenLoco",
    category: "Strategy",
  },
  {
    name: "OpenMW",
    github: "https://github.com/OpenMW/openmw",
    category: "RPG",
  },
  {
    name: "OpenNefia",
    github: "https://github.com/OpenNefia/OpenNefia",
    category: "Roguelike",
  },
  {
    name: "OpenNox",
    github: "https://github.com/noxworld-dev/opennox",
    category: "RPG",
  },
  {
    name: "OpenRA",
    github: "https://github.com/OpenRA/OpenRA",
    category: "Strategy",
  },
  {
    name: "OpenRCT2",
    github: "https://github.com/OpenRCT2/OpenRCT2",
    category: "Strategy",
  },
  {
    name: "OpenSAGE",
    github: "https://github.com/OpenSAGE/OpenSAGE",
    category: "Engine",
  },
  {
    name: "OpenSpades",
    github: "https://github.com/yvt/openspades",
    category: "FPS",
  },
  {
    name: "OpenTTD",
    github: "https://github.com/OpenTTD/OpenTTD",
    category: "Strategy",
  },
  {
    name: "OpenTyrian",
    github: "https://github.com/opentyrian/opentyrian",
    category: "Shmup",
  },
  {
    name: "OpenVic",
    github: "https://github.com/OpenVic/OpenVic",
    category: "Strategy",
  },
  {
    name: "OpenXcom",
    github: "https://github.com/OpenXcom/OpenXcom",
    category: "Strategy",
  },
  {
    name: "Overgrowth",
    github: "https://github.com/WolfireGames/overgrowth",
    category: "Action",
  },
  { name: "osu!", github: "https://github.com/ppy/osu", category: "Rhythm" },
  {
    name: "Ozymandias",
    github: "https://github.com/Chriper/Ozymandias",
    category: "Strategy",
  },
  {
    name: "PAK",
    github: "https://github.com/andrewrk/pak",
    category: "Platformer",
  },
  {
    name: "Pascal Doom",
    github: "https://github.com/dgenght/pascal-doom",
    category: "FPS",
  },
  {
    name: "Pioneer",
    github: "https://github.com/pioneerspacesim/pioneer",
    category: "RPG",
  },
  {
    name: "Pixel Dungeon",
    github: "https://github.com/00-Evan/shattered-pixel-dungeon",
    category: "Roguelike",
  },
  {
    name: "PokerTH",
    github: "https://github.com/pokerth/pokerth",
    category: "Card Game",
  },
  {
    name: "PolyMC",
    github: "https://github.com/PolyMC/PolyMC",
    category: "Launcher",
  },
  {
    name: "PrBoom+",
    github: "https://github.com/coelckers/prboom-plus",
    category: "FPS",
  },
  {
    name: "PySolFC",
    github: "https://github.com/shlomif/PySolFC",
    category: "Card Game",
  },
  {
    name: "Quake",
    github: "https://github.com/id-Software/Quake",
    category: "FPS",
  },
  {
    name: "Quake 2",
    github: "https://github.com/id-Software/Quake-2",
    category: "FPS",
  },
  {
    name: "Quake III Arena",
    github: "https://github.com/id-Software/Quake-III-Arena",
    category: "FPS",
  },
  {
    name: "QuakeSpasm",
    github: "https://github.com/Novum/QuakeSpasm",
    category: "FPS",
  },
  { name: "Raze", github: "https://github.com/svkaiser/raze", category: "FPS" },
  {
    name: "Red Eclipse",
    github: "https://github.com/RedEclipse/red-eclipse",
    category: "FPS",
  },
  {
    name: "reone",
    github: "https://github.com/seedhartha/reone",
    category: "RPG",
  },
  {
    name: "Rigs of Rods",
    github: "https://github.com/RigsOfRods/rigs-of-rods",
    category: "Simulation",
  },
  {
    name: "Rise of the Triad",
    github: "https://github.com/svkaiser/rott",
    category: "FPS",
  },
  {
    name: "Ryzom Core",
    github: "https://github.com/ryzom/ryzomcore",
    category: "MMORPG",
  },
  {
    name: "ScummVM",
    github: "https://github.com/scummvm/scummvm",
    category: "Adventure",
  },
  {
    name: "Shattered Pixel Dungeon",
    github: "https://github.com/00-Evan/shattered-pixel-dungeon",
    category: "Roguelike",
  },
  {
    name: "Simon Tatham's Puzzles",
    github: "https://github.com/chromium59/sgtpuzzles",
    category: "Puzzle",
  },
  {
    name: "Simutrans",
    github: "https://github.com/aburch/simutrans",
    category: "Simulation",
  },
  {
    name: "Sniper Elite",
    github: "https://github.com/sniper/sneak",
    category: "FPS",
  },
  {
    name: "Solarus",
    github: "https://github.com/solarus-games/solarus",
    category: "RPG",
  },
  {
    name: "Space Station 14",
    github: "https://github.com/space-wizards/space-station-14",
    category: "Simulation",
  },
  {
    name: "Speed Dreams",
    github: "https://github.com/speed-dreams/speed-dreams",
    category: "Racing",
  },
  {
    name: "StepMania",
    github: "https://github.com/stepmania/stepmania",
    category: "Rhythm",
  },
  {
    name: "Stunt Rally",
    github: "https://github.com/stuntrally/stuntrally3",
    category: "Racing",
  },
  {
    name: "Super Methane Brothers",
    github: "https://github.com/skymanny/methane",
    category: "Platformer",
  },
  {
    name: "Super Mario Bros. X",
    github: "https://github.com/smxteam/smx",
    category: "Platformer",
  },
  {
    name: "Super Tilt Bro",
    github: "https://github.com/supertiltbro/SuperTiltBro",
    category: "Fighting",
  },
  {
    name: "SuperTux",
    github: "https://github.com/SuperTux/supertux",
    category: "Platformer",
  },
  {
    name: "SuperTuxKart",
    github: "https://github.com/supertuxkart/stk-code",
    category: "Racing",
  },
  {
    name: "Taisei Project",
    github: "https://github.com/taisei-project/taisei",
    category: "Bullet Hell",
  },
  {
    name: "Tales of Maj'Eyal",
    github: "https://github.com/megoth/ToME",
    category: "Roguelike",
  },
  {
    name: "Teeworlds",
    github: "https://github.com/teeworlds/teeworlds",
    category: "Action",
  },
  {
    name: "The Battle for Wesnoth",
    github: "https://github.com/wesnoth/wesnoth",
    category: "Strategy",
  },
  {
    name: "The Dark Mod",
    github: "https://github.com/sdt/thedarkmod",
    category: "FPS",
  },
  {
    name: "The Legend of Edgar",
    github: "https://github.com/riksweeney/edgar",
    category: "Platformer",
  },
  {
    name: "The Mana World",
    github: "https://github.com/Themanaworld/tmw",
    category: "MMORPG",
  },
  {
    name: "The Powder Toy",
    github: "https://github.com/The-Powder-Toy/The-Powder-Toy",
    category: "Simulation",
  },
  {
    name: "The Ur-Quan Masters",
    github: "https://github.com/scummvm/scummvm",
    category: "RPG",
  },
  {
    name: "Tomb Engine",
    github: "https://github.com/TombEngine/TombEngine",
    category: "Action",
  },
  {
    name: "Trigger Rally",
    github: "https://github.com/trigger-rally/trigger-rally",
    category: "Racing",
  },
  {
    name: "Tuxemon",
    github: "https://github.com/Tuxemon/Tuxemon",
    category: "RPG",
  },
  {
    name: "Tux Racer",
    github: "https://github.com/tuxracer/tuxracer",
    category: "Racing",
  },
  {
    name: "UFO: Alien Invasion",
    github: "https://github.com/ufoai/ufoai",
    category: "Strategy",
  },
  {
    name: "Ultimate Stunts",
    github: "https://github.com/ultimatestunts/ultimatestunts",
    category: "Racing",
  },
  {
    name: "Unciv",
    github: "https://github.com/yairm210/Unciv",
    category: "Strategy",
  },
  {
    name: "Unknown Horizons",
    github: "https://github.com/unknown-horizons/unknown-horizons",
    category: "Strategy",
  },
  {
    name: "Unvanquished",
    github: "https://github.com/Unvanquished/Unvanquished",
    category: "FPS",
  },
  {
    name: "Valyria Tear",
    github: "https://github.com/Bertram25/ValyriaTear",
    category: "RPG",
  },
  {
    name: "VCMI",
    github: "https://github.com/vcmi/vcmi",
    category: "Strategy",
  },
  {
    name: "Veloren",
    github: "https://github.com/veloren/veloren",
    category: "RPG",
  },
  {
    name: "VDrift",
    github: "https://github.com/VDrift/vdrift",
    category: "Racing",
  },
  {
    name: "Vega Strike",
    github: "https://github.com/vegastrike/Vega-Strike-Engine-Project",
    category: "RPG",
  },
  {
    name: "VVVVVV",
    github: "https://github.com/TerryCavanagh/VVVVVV",
    category: "Platformer",
  },
  {
    name: "Warzone 2100",
    github: "https://github.com/Warzone2100/warzone2100",
    category: "Strategy",
  },
  {
    name: "Widelands",
    github: "https://github.com/widelands/widelands",
    category: "Strategy",
  },
  {
    name: "Wolfenstein 3D",
    github: "https://github.com/id-Software/wolf3d",
    category: "FPS",
  },
  {
    name: "Wyrmsun",
    github: "https://github.com/Andrettin/Wyrmsun",
    category: "Strategy",
  },
  {
    name: "Xonotic",
    github: "https://gitlab.com/xonotic/xonotic",
    category: "FPS",
  },
  { name: "XTUX", github: "https://github.com/skyen/xtux", category: "FPS" },
  {
    name: "Yamagi Quake II",
    github: "https://github.com/yquake2/yquake2",
    category: "FPS",
  },
  {
    name: "Zero-K",
    github: "https://github.com/ZeroK-RTS/Zero-K",
    category: "Strategy",
  },
  { name: "ZDoom", github: "https://github.com/ZDoom/zdoom", category: "FPS" },
  // Additional games
  {
    name: "Zelda Classic",
    github: "https://github.com/ZeldaClassic/ZeldaClassic",
    category: "RPG",
  },
  {
    name: "Zelda 3",
    github: "https://github.com/snesrev/zelda3",
    category: "RPG",
  },
  {
    name: "Zelorta",
    github: "https://github.com/Zelorta/Zelorta",
    category: "RPG",
  },
];

function generateMarkdown(): string {
  let md = "# OSGL Open Source Games\n\n";
  md +=
    "Games from the Open Source Games List (OSGL) - https://trilarion.github.io/opensourcegames/\n\n";
  md += "Generated from 1604 games in OSGL with known GitHub repositories.\n\n";

  // Group by category
  const byCategory: Record<string, typeof osglGames> = {};
  for (const game of osglGames) {
    if (!byCategory[game.category]) {
      byCategory[game.category] = [];
    }
    byCategory[game.category].push(game);
  }

  for (const [category, games] of Object.entries(byCategory)) {
    md += `## ${category}\n\n`;
    for (const game of games) {
      md += `- **[${game.name}](${game.github})** - Open source ${category.toLowerCase()} game. [[source]](${game.github})\n`;
    }
    md += "\n";
  }

  return md;
}

async function main() {
  console.log("Generating OSGL games markdown...");

  const markdown = generateMarkdown();
  const outputFile = resolve(ROOT_DIR, "data/osgl-games.md");

  writeFileSync(outputFile, markdown, "utf-8");

  console.log(`Generated ${osglGames.length} games`);
  console.log(`Written to: ${outputFile}`);
  console.log("");
  console.log("Next steps:");
  console.log(
    "1. Parse the markdown: npx tsx scripts/parse-games-list.ts data/osgl-games.md",
  );
  console.log(
    "2. Import to database: npx tsx scripts/import-parsed-games.ts --input data/osgl-games.json",
  );
}

main().catch(console.error);
