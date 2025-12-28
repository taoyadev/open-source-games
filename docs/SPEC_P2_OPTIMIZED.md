# Open Source Games Platform - P2 Optimized (Reality Check Version)

> **Philosophy**: SEO 是生命线，Affiliate 是钱袋子，简单技术撑起来
> **Based on**: 专业反馈 - 砍掉过度设计，聚焦流量和变现

---

## P2 的唯一目标

**从 P1 的"能用"到 P2 的"被 Google 收录 + 有钱赚"**

| P1 状态         | P2 目标                                | 为什么重要                          |
| --------------- | -------------------------------------- | ----------------------------------- |
| ✅ 有游戏列表   | 🎯 **每个游戏一个 SEO 优化的详情页**   | Google 收录的基本单位               |
| ✅ 简单搜索     | 🎯 **SQLite FTS5 全文搜索**            | 够用 + 零成本 + 秒级响应            |
| ❌ 没有原创内容 | 🎯 **AI 生成 300-500 字游戏评测**      | 唯一能对抗 Duplicate Content 的武器 |
| ❌ 没有变现     | 🎯 **Affiliate 埋点（硬件/VPS/教程）** | 开源社区唯一可行的变现路径          |
| ❌ SEO 为 0     | 🎯 **pSEO 自动生成长尾页面**           | 让 Google 给你带来 10 倍流量        |

---

## P2 核心三件事（按优先级）

### 1️⃣ SEO 优先：让 Google 收录你（而不是 bobeff）

#### 1.1 Schema.org 结构化数据（必须）

**问题**：没有 Schema，Google 不知道这是游戏，不会展示"评分、平台、价格"等 Rich Snippet。

**解决方案**：每个游戏详情页插入 JSON-LD

```typescript
// src/app/game/[id]/page.tsx
export default async function GamePage({ params }: { params: { id: string } }) {
  const game = await getGameById(params.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["VideoGame", "SoftwareApplication"],
    "name": game.title,
    "description": game.aiReview, // AI 生成的长评测
    "url": `https://osgames.dev/game/${game.id}`,
    "applicationCategory": "Game",
    "operatingSystem": game.platforms?.join(", ") || "Cross-platform",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": Math.min(5, game.stars / 2000), // 星数转 5 分制
      "reviewCount": game.stars,
    },
    "author": {
      "@type": "Organization",
      "name": game.repoUrl.split('/')[3], // GitHub owner
    },
    "softwareVersion": game.latestRelease || "N/A",
    "datePublished": game.createdAt,
    "dateModified": game.lastCommitAt,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 游戏详情页内容 */}
    </>
  );
}
```

#### 1.2 Programmatic SEO (pSEO) - 自动生成长尾页面

**问题**：只有 `/game/minecraft-clone` 页面，流量太少。

**解决方案**：自动生成分类聚合页

```typescript
// 自动生成的页面示例
/best-open-source-rpg-games              (按 stars 排序的 RPG)
/games-written-in-rust                   (按语言聚合)
/unity-alternatives-open-source          (竞品对比页)
/open-source-games-for-kids              (按受众聚合)
/lightweight-games-for-raspberry-pi      (按硬件聚合)
```

**实现**：动态路由 + SEO 优化的模板

```typescript
// src/app/category/[slug]/page.tsx
import { Metadata } from 'next';

const CATEGORIES = {
  'best-open-source-rpg-games': {
    title: 'Best Open Source RPG Games in 2025',
    filter: { topics: ['rpg'] },
    description: 'Discover the top open-source RPG games. Free, community-driven alternatives to commercial RPGs.',
  },
  'games-written-in-rust': {
    title: 'Open Source Games Written in Rust',
    filter: { language: 'Rust' },
    description: 'High-performance games built with Rust. Memory-safe, blazingly fast.',
  },
  // ... 100+ 预定义分类
};

export async function generateMetadata({ params }): Promise<Metadata> {
  const category = CATEGORIES[params.slug];

  return {
    title: category.title,
    description: category.description,
    openGraph: {
      title: category.title,
      description: category.description,
      images: ['/og-images/' + params.slug + '.png'], // 自动生成 OG 图
    },
  };
}

export default async function CategoryPage({ params }) {
  const category = CATEGORIES[params.slug];
  const games = await db.select()
    .from(gamesTable)
    .where(/* 根据 category.filter 构建 SQL */)
    .orderBy(desc(gamesTable.stars))
    .limit(50);

  return (
    <main>
      <h1>{category.title}</h1>
      <p className="text-lg mb-8">{category.description}</p>

      {/* AI 生成的分类介绍（300-500 字） */}
      <section className="prose mb-12">
        <h2>Why {category.title}?</h2>
        {/* 从 KV 读取预生成的 AI 内容 */}
      </section>

      {/* 游戏列表 */}
      <GameGrid games={games} />

      {/* FAQ 区域（SEO 黄金） */}
      <FAQSection category={params.slug} />
    </main>
  );
}
```

**pSEO 页面生成脚本**

```typescript
// scripts/generate-category-pages.ts
const TEMPLATES = [
  "best-open-source-{genre}-games", // RPG, FPS, RTS, Puzzle...
  "games-written-in-{language}", // Rust, C++, Python...
  "{engine}-open-source-games", // Godot, Unity (克隆), Unreal...
  "open-source-{commercial}-alternatives", // Minecraft, Civilization, Terraria...
  "lightweight-games-for-{platform}", // Raspberry Pi, Old PCs...
];

const GENRES = [
  "rpg",
  "fps",
  "rts",
  "puzzle",
  "platformer",
  "roguelike",
  "simulation",
];
const LANGUAGES = ["Rust", "C++", "Python", "JavaScript", "Go"];
const COMMERCIAL_GAMES = ["minecraft", "civilization", "terraria", "factorio"];

// 生成 100+ 个分类
for (const template of TEMPLATES) {
  // 自动生成 slug + metadata + AI 内容
}
```

#### 1.3 AI 生成长文评测（对抗 Duplicate Content）

**问题**：游戏描述直接抄 GitHub README，Google 会判定为重复内容。

**解决方案**：AI 生成 **300-500 字**原创评测 + 对比分析

**新的 AI Prompt**（替换 P2.md 中的 50 字版本）：

```typescript
const prompt = `你是一个资深游戏编辑，为开源游戏导航站写评测。

游戏信息：
- 名称：${game.title}
- 描述：${game.description}
- 主要语言：${game.language}
- GitHub Topics: ${game.topics.join(", ")}
- 星数：${game.stars}

任务：写一篇 300-500 字的评测，包含：

## 1. 游戏类型和玩法（100 字）
这是什么类型的游戏？核心玩法是什么？用类比说明（例如："开源版的《文明5》"）。

## 2. 技术亮点（100 字）
用什么技术栈开发？有什么独特的技术优势？（例如："用 Rust 编写，启动速度比同类游戏快 3 倍"）

## 3. 适合人群（50 字）
谁应该玩这个游戏？新手友好吗？还是硬核玩家向？

## 4. 对比竞品（100 字）
和商业游戏或其他开源游戏对比，优势和劣势是什么？

## 5. 推荐理由（50 字）
用一句话总结为什么值得试玩。

语气：专业但不枯燥，像 IGN 评测那样有态度。
输出：纯文本，Markdown 格式。`;

const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: prompt }],
  max_tokens: 800, // 增加到 800
});

game.aiReview = response.choices[0].message.content;
```

**成本控制**：

- 只对新增游戏生成
- 已有游戏按需生成（用户访问时异步生成，存入 KV Cache）
- GPT-4o-mini：~$0.15/1000 次，2000 个游戏 = **$0.30**

---

### 2️⃣ 技术降本：SQLite FTS5 替代 Vectorize

#### 2.1 为什么不用 Vectorize？

| 维度     | Vectorize             | SQLite FTS5             |
| -------- | --------------------- | ----------------------- |
| 适用场景 | 10000+ 文档，语义搜索 | < 5000 文档，关键词搜索 |
| 成本     | $0.04/百万维（每月）  | $0（D1 内置）           |
| 延迟     | 冷启动 100-300ms      | < 10ms                  |
| 复杂度   | 需要 embedding 生成   | SQL 查询即可            |

**结论**：2000 个游戏用 Vectorize = 用坦克去菜市场买菜。

#### 2.2 SQLite FTS5 实现

**Step 1: 创建 FTS5 虚拟表**

```sql
-- migration: 002_add_fts5.sql
CREATE VIRTUAL TABLE games_fts USING fts5(
  id UNINDEXED,
  title,
  description,
  aiReview,
  topics,
  content='games', -- 映射到主表
  content_rowid='rowid'
);

-- 插入现有数据
INSERT INTO games_fts(id, title, description, aiReview, topics)
SELECT id, title, description, aiReview, json_extract(topics, '$') FROM games;
```

**Step 2: 搜索 API**

```typescript
// src/app/api/search/route.ts
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return Response.json({ results: [] });
  }

  const { env } = getRequestContext();
  const db = drizzle(env.DB);

  // FTS5 全文搜索（支持中英文、AND/OR/NOT 操作符）
  const results = await env.DB.prepare(
    `
    SELECT
      g.*,
      snippet(games_fts, 1, '<mark>', '</mark>', '...', 64) as highlight
    FROM games_fts
    JOIN games g ON games_fts.id = g.id
    WHERE games_fts MATCH ?
    ORDER BY rank
    LIMIT 50
  `,
  )
    .bind(query)
    .all();

  return Response.json({ results: results.results });
}
```

**搜索语法示例**：

```
"multiplayer FPS"          → 包含两个词
"rust OR c++"              → 包含任一词
"game -unity"              → 排除 Unity
"open source" NEAR/5 rpg   → 两词距离 < 5
```

---

### 3️⃣ 变现埋点：Affiliate 是唯一可行路径

#### 3.1 硬件推荐（Amazon Affiliate）

**场景**：很多开源游戏是怀旧/模拟器类，用户需要掌机。

```typescript
// 游戏详情页底部
<section className="bg-gray-50 p-6 rounded-lg mt-12">
  <h3 className="text-xl font-bold mb-4">
    🎮 Best Devices to Play {game.title}
  </h3>
  <div className="grid md:grid-cols-3 gap-4">
    {/* Anbernic RG35XX */}
    <a
      href="https://amzn.to/YOUR-AFFILIATE-LINK"
      target="_blank"
      rel="nofollow sponsored"
      className="border rounded p-4 hover:shadow-lg"
    >
      <img src="/devices/anbernic-rg35xx.jpg" alt="Anbernic RG35XX" />
      <h4 className="font-bold mt-2">Anbernic RG35XX</h4>
      <p className="text-sm text-gray-600">Perfect for 2D retro games</p>
      <span className="text-green-600 font-bold">$59.99</span>
    </a>

    {/* Steam Deck */}
    <a
      href="https://amzn.to/YOUR-AFFILIATE-LINK"
      rel="nofollow sponsored"
    >
      <img src="/devices/steam-deck.jpg" alt="Steam Deck" />
      <h4 className="font-bold mt-2">Steam Deck</h4>
      <p className="text-sm text-gray-600">Runs AAA open source games</p>
      <span className="text-green-600 font-bold">$399</span>
    </a>

    {/* Raspberry Pi 5 */}
    <a
      href="https://amzn.to/YOUR-AFFILIATE-LINK"
      rel="nofollow sponsored"
    >
      <img src="/devices/rpi5.jpg" alt="Raspberry Pi 5" />
      <h4 className="font-bold mt-2">Raspberry Pi 5</h4>
      <p className="text-sm text-gray-600">DIY gaming console</p>
      <span className="text-green-600 font-bold">$80</span>
    </a>
  </div>
</section>
```

**转化率预估**：

- 月访问 10000 人 → 点击率 2% = 200 点击
- 转化率 5% = 10 单
- 每单佣金 $5 = **$50/月**

#### 3.2 VPS 推荐（针对多人游戏）

**场景**：Multiplayer 游戏需要服务器（Minecraft 克隆、Teeworlds 等）

```typescript
// 针对 multiplayer 标签的游戏
{game.topics.includes('multiplayer') && (
  <section className="border-l-4 border-blue-500 bg-blue-50 p-6 mt-8">
    <h3 className="text-xl font-bold mb-2">
      🌐 Host Your Own {game.title} Server
    </h3>
    <p className="text-gray-700 mb-4">
      Want to play with friends? Deploy a dedicated server in 5 minutes.
    </p>
    <div className="flex gap-4">
      <a
        href="https://www.vultr.com/?ref=YOUR-REF"
        className="bg-blue-600 text-white px-6 py-3 rounded font-bold"
        rel="nofollow sponsored"
      >
        Deploy on Vultr ($2.50/mo)
      </a>
      <a
        href="https://m.do.co/c/YOUR-REF"
        className="bg-black text-white px-6 py-3 rounded font-bold"
        rel="nofollow sponsored"
      >
        DigitalOcean ($6/mo)
      </a>
    </div>
  </section>
)}
```

**VPS Affiliate 收益**：

- Vultr: 新用户首次充值佣金 $10-$50
- DigitalOcean: $25/单
- 月推荐 10 个新用户 = **$100-$250/月**

#### 3.3 教程内容变现

**场景**：复杂游戏需要安装教程（如 Battle for Wesnoth、0 A.D.）

```typescript
// 详情页嵌入教程
<section className="prose max-w-none mt-8">
  <h2>How to Install {game.title}</h2>

  {/* 嵌入视频教程（YouTube Affiliate） */}
  <iframe
    src="https://www.youtube.com/embed/YOUR-VIDEO-ID"
    className="w-full aspect-video"
  />

  {/* 文字教程（插入 Amazon 工具链接） */}
  <ol>
    <li>Download from <a href={game.githubReleases}>GitHub Releases</a></li>
    <li>Install dependencies...
      <a href="https://amzn.to/compiler-book" rel="nofollow sponsored">
        Need help with compilers? This book explains everything.
      </a>
    </li>
  </ol>
</section>
```

---

## P2 数据模型优化

```typescript
// schema.ts
export const games = sqliteTable(
  "games",
  {
    // P1 字段
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    repoUrl: text("repo_url").notNull(),
    description: text("description"),
    stars: integer("stars").default(0),

    // P2 新增
    language: text("language"),
    topics: text("topics", { mode: "json" }).$type<string[]>(),
    lastCommitAt: integer("last_commit_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }),

    // SEO 核心字段
    aiReview: text("ai_review"), // 300-500 字 AI 评测
    metaTitle: text("meta_title"), // SEO 标题
    metaDescription: text("meta_description"), // SEO 描述
    slug: text("slug").unique(), // URL slug (例: "minecraft-clone")

    // 变现字段
    affiliateDevices: text("affiliate_devices", { mode: "json" }).$type<
      { name: string; url: string; price: string }[]
    >(),
    isMultiplayer: integer("is_multiplayer", { mode: "boolean" }).default(
      false,
    ),

    // 图片（优化版）
    thumbnailUrl: text("thumbnail_url"), // R2 直链（预处理好的 WebP）
    screenshotUrls: text("screenshot_urls", { mode: "json" }).$type<string[]>(),

    // 元数据
    license: text("license"),
    platforms: text("platforms", { mode: "json" }).$type<string[]>(),
    latestRelease: text("latest_release"),
    downloadCount: integer("download_count").default(0),

    updatedAt: integer("updated_at", { mode: "timestamp" }),
  },
  (table) => ({
    starsIdx: index("stars_idx").on(table.stars),
    languageIdx: index("language_idx").on(table.language),
    slugIdx: index("slug_idx").on(table.slug),
  }),
);
```

---

## P2 抓取脚本优化

### 避免 GitHub API Rate Limit 爆炸

**问题**：每天全量更新会超速率限制。

**解决方案**：分级更新策略

```typescript
// scripts/smart-sync.ts
import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function smartSync() {
  const games = await db.select().from(gamesTable);

  const now = Date.now();
  const SIX_MONTHS = 6 * 30 * 24 * 60 * 60 * 1000;
  const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;

  for (const game of games) {
    const [owner, repo] = game.id.split("-");

    // 分级策略
    let shouldUpdate = false;

    if (!game.lastCommitAt) {
      shouldUpdate = true; // 新游戏，立刻更新
    } else if (game.lastCommitAt > now - SIX_MONTHS) {
      // 活跃游戏：每天更新
      shouldUpdate = true;
    } else if (game.lastCommitAt > now - ONE_YEAR) {
      // 不活跃：每周更新（今天是周一？）
      shouldUpdate = new Date().getDay() === 1;
    } else {
      // 死游戏：每月更新（今天是 1 号？）
      shouldUpdate = new Date().getDate() === 1;
    }

    if (!shouldUpdate) continue;

    try {
      // 使用 If-None-Match 头节省 API quota
      const { data: repoData, headers } = await octokit.rest.repos.get({
        owner,
        repo,
        headers: {
          "If-None-Match": game.etag || "",
        },
      });

      if (headers.status === "304") {
        console.log(`${game.id} not modified, skipping`);
        continue;
      }

      // 更新游戏数据
      await updateGame(game.id, repoData, headers.etag);
    } catch (e) {
      console.error(`Failed to update ${game.id}: ${e.message}`);
    }
  }
}
```

**API Quota 优化**：

- 分级更新：每天只更新 ~500 个游戏（而不是 2000 个）
- `If-None-Match`：如果内容未变，不消耗 quota
- 总 API 调用：500/天 << 5000/小时限制 ✅

---

## 图片处理优化（零成本方案）

### 问题：Cloudflare Images = $5/月起步

### 解决方案：R2 + Python 预处理

```python
# scripts/process-images.py
from PIL import Image
import io
import boto3

s3 = boto3.client(
    's3',
    endpoint_url=f'https://{ACCOUNT_ID}.r2.cloudflarestorage.com',
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
)

def process_and_upload(game_id: str, image_url: str):
    """
    1. 下载原图
    2. 转 WebP + 压缩到 < 100KB
    3. 生成 3 个尺寸（缩略图 300x200、中图 600x400、大图 1200x800）
    4. 上传到 R2 Public Bucket
    """
    response = requests.get(image_url)
    img = Image.open(io.BytesIO(response.content))

    sizes = {
        'thumb': (300, 200),
        'medium': (600, 400),
        'large': (1200, 800),
    }

    urls = {}
    for size_name, (width, height) in sizes.items():
        # 等比例缩放
        img_resized = img.copy()
        img_resized.thumbnail((width, height), Image.Resampling.LANCZOS)

        # 转 WebP
        buffer = io.BytesIO()
        img_resized.save(buffer, format='WebP', quality=85)
        buffer.seek(0)

        # 上传到 R2
        key = f'games/{game_id}/{size_name}.webp'
        s3.upload_fileobj(
            buffer,
            'os-games',
            key,
            ExtraArgs={'ContentType': 'image/webp'}
        )

        urls[size_name] = f'https://cdn.osgames.dev/{key}'

    return urls

# 批量处理
for game in games:
    # 从 GitHub repo 找图片（README 里的第一张图）
    image_url = extract_first_image_from_readme(game.repo_url)
    if image_url:
        urls = process_and_upload(game.id, image_url)
        db.update(games).set({
            thumbnailUrl: urls['thumb'],
            screenshotUrls: [urls['medium'], urls['large']],
        }).where(eq(games.id, game.id))
```

**成本**：

- R2 存储：5GB × $0.015 = **$0.075/月**
- R2 流量：免费（Cloudflare CDN 出站）
- 总计：**< $0.10/月** (vs Cloudflare Images 的 $5/月)

---

## 法律合规（避坑指南）

### 红线 1: 绝不托管二进制文件

```typescript
// ❌ 错误做法
<a href="/downloads/minecraft-clone.zip">Download</a>

// ✅ 正确做法（302 重定向到 GitHub）
<a
  href={`https://github.com/${owner}/${repo}/releases/latest`}
  target="_blank"
  rel="noopener noreferrer"
>
  Download from GitHub →
</a>
```

### 红线 2: 检测商业游戏资源

```typescript
// scripts/validate-license.ts
const COMMERCIAL_KEYWORDS = [
  "quake",
  "doom",
  "half-life",
  "counter-strike",
  "warcraft",
  "starcraft",
  "diablo",
];

function isCommercialAssets(game) {
  const title = game.title.toLowerCase();
  const hasCommercialKeyword = COMMERCIAL_KEYWORDS.some((kw) =>
    title.includes(kw),
  );

  if (hasCommercialKeyword) {
    // 检查 README 是否明确说明 "engine only"
    const readme = fetchReadme(game.repoUrl);
    const isEngineOnly =
      readme.includes("engine only") || readme.includes("assets not included");

    if (!isEngineOnly) {
      console.warn(`⚠️ ${game.id} may contain commercial assets, skip hosting`);
      return true;
    }
  }

  return false;
}
```

### 红线 3: Affiliate Link 合规

```html
<!-- ✅ 正确：必须加 rel="nofollow sponsored" -->
<a href="https://amzn.to/YOUR-LINK" rel="nofollow sponsored" target="_blank">
  Buy on Amazon
</a>

<!-- ✅ 必须有免责声明 -->
<footer className="text-sm text-gray-500 mt-4">
  * We earn from qualifying purchases (Amazon Associate)
</footer>
```

---

## P2 行动计划（砍掉冗余，只做必要）

### Phase 2.1: SEO 基建（核心）

1. 添加 Schema.org JSON-LD 到所有游戏详情页
2. 修改抓取脚本，调用 GPT-4o-mini 生成 300-500 字评测
3. 生成 100 个 pSEO 分类页（`/best-open-source-{genre}-games`）
4. 添加 `sitemap.xml` 和 `robots.txt`
5. 提交到 Google Search Console

### Phase 2.2: 搜索优化（零成本）

1. 创建 SQLite FTS5 虚拟表
2. 实现 `/api/search` 端点
3. 前端添加搜索建议（Autocomplete）
4. 添加高级筛选器（语言、活跃度、星数范围）

### Phase 2.3: 变现埋点

1. 注册 Amazon Associates + Vultr Affiliate
2. 游戏详情页添加硬件推荐模块（针对怀旧游戏）
3. Multiplayer 游戏添加 VPS 推荐按钮
4. 添加安装教程（嵌入 Affiliate 链接）

### Phase 2.4: 图片优化（降本版）

1. 创建 R2 Bucket（Public）
2. Python 脚本批量处理图片 → WebP
3. 更新数据库 `thumbnailUrl` 字段
4. 添加图片加载失败 fallback（emoji 占位符）

---

## P2 vs P3 边界（重新划分）

| 功能           | 放在哪里？ | 原因                          |
| -------------- | ---------- | ----------------------------- |
| Schema.org     | P2         | SEO 基础设施，没有=不收录     |
| AI 长评测      | P2         | 唯一的原创内容                |
| FTS5 搜索      | P2         | 用户基本需求 + 零成本         |
| pSEO 分类页    | P2         | 流量主要来源                  |
| Affiliate 埋点 | P2         | 变现基础                      |
| ~~Vectorize~~  | ❌ P3      | 杀鸡用牛刀，数据量 > 1 万再说 |
| ~~Queue~~      | ❌ P3      | 过度设计，GitHub API 够用     |
| 用户系统       | P3         | 没流量前没意义                |
| 评论/社区      | P3         | 运营成本高                    |

---

## 成本对比（优化前 vs 优化后）

| 项目     | P2 原方案       | P2 优化版      | 节省         |
| -------- | --------------- | -------------- | ------------ |
| 搜索引擎 | Vectorize $5/月 | SQLite FTS5 $0 | **$5**       |
| 图片托管 | CF Images $5/月 | R2 $0.10/月    | **$4.9**     |
| AI 生成  | 长文 $2/月      | 长文 $0.30/月  | **$1.7**     |
| 任务队列 | CF Queues $1/月 | 不需要 $0      | **$1**       |
| **总计** | **$13/月**      | **$0.40/月**   | **节省 97%** |

---

## 关键决策（需确认）

| 决策           | 选项                      | 推荐        | 原因                       |
| -------------- | ------------------------- | ----------- | -------------------------- |
| AI 模型        | GPT-4o-mini vs Workers AI | GPT-4o-mini | 质量更好，成本可控 ($0.30) |
| 图片方案       | R2 预处理 vs CF Images    | R2 预处理   | 节省 $4.9/月               |
| 搜索方案       | FTS5 vs Vectorize         | FTS5        | 够用 + 零成本              |
| Affiliate 平台 | Amazon vs 自建商城        | Amazon      | 开源社区信任度高           |
| pSEO 页面数量  | 50 vs 100 vs 500          | 100         | 平衡质量和覆盖面           |

---

## 风险和缓解

| 风险                          | 影响 | 缓解措施                                     |
| ----------------------------- | ---- | -------------------------------------------- |
| Google 判定 Duplicate Content | 致命 | AI 生成 300-500 字原创评测 + pSEO 页面       |
| Affiliate 转化率过低          | 高   | A/B 测试不同推荐位置，优化文案               |
| GitHub API Rate Limit         | 中   | 分级更新 + If-None-Match                     |
| 图片版权纠纷                  | 中   | 只从 GitHub repo README 抓取，标注来源       |
| FTS5 搜索质量不够             | 低   | 先上线，收集用户反馈，数据量大再换 Vectorize |

---

## 总结

**P2 优化版的核心**：

1. **SEO 是生命线** - Schema.org + pSEO + AI 长文
2. **技术够用就好** - FTS5 > Vectorize，R2 > CF Images
3. **变现靠 Affiliate** - 硬件 + VPS + 教程
4. **降本 97%** - $13/月 → $0.40/月

**三个月后的北极星指标**：

- Google 收录 > 500 页
- 月访问 > 10000 人
- Affiliate 收入 > $100/月

---

**下一步**：需要我生成具体代码吗？还是先实现 P2.1（SEO 基建）？
