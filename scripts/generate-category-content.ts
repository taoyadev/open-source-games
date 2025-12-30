/**
 * Script to generate AI content for each pSEO category
 * Run with: npx tsx scripts/generate-category-content.ts
 *
 * This generates 300-500 word introductions for each category
 * to avoid duplicate content and improve SEO.
 */

import { getAllCategories, type Category } from "../src/lib/categories";

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DRY_RUN = process.env.DRY_RUN === "true";
const BATCH_SIZE = 5; // Number of concurrent requests
const DELAY_MS = 1000; // Delay between batches to avoid rate limits

interface GeneratedContent {
  slug: string;
  content: string;
  generatedAt: string;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

// OpenAI API call
async function generateContentWithOpenAI(
  category: Category,
): Promise<GeneratedContent | null> {
  if (!OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable is required");
    process.exit(1);
  }

  const prompt = `You are a gaming expert and SEO content writer for an open-source games directory website.

Write a compelling, SEO-optimized introduction for a category page. The content should:
- Be 300-500 words
- Sound natural and engaging (not robotic or stuffed with keywords)
- Highlight the benefits of open-source games in this category
- Include relevant keywords naturally
- Provide value to readers looking for these types of games
- Use proper HTML formatting (<p>, <h3>, <ul>, <li> tags as needed)

Category Details:
- Title: ${category.title}
- Description: ${category.description}
- Target Keywords: ${category.metaTitle}

Write the content in HTML format (just the content, no wrapper divs).
Focus on being informative and helpful while naturally incorporating SEO elements.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`OpenAI API error for ${category.slug}:`, error);
      return null;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error(`No content generated for ${category.slug}`);
      return null;
    }

    return {
      slug: category.slug,
      content: content.trim(),
      generatedAt: new Date().toISOString(),
      tokenUsage: data.usage
        ? {
            prompt: data.usage.prompt_tokens,
            completion: data.usage.completion_tokens,
            total: data.usage.total_tokens,
          }
        : undefined,
    };
  } catch (error) {
    console.error(`Error generating content for ${category.slug}:`, error);
    return null;
  }
}

// Generate sample content without API (for dry runs or testing)
function generateSampleContent(category: Category): GeneratedContent {
  const sampleContent = `
<p>${category.description} This curated collection showcases the best that the open-source gaming community has to offer.</p>

<h3>Why Choose Open Source?</h3>
<p>Open-source games provide unique advantages that commercial alternatives cannot match. With full access to the source code, you can:</p>
<ul>
  <li>Modify and customize gameplay to your preferences</li>
  <li>Learn game development by studying real-world codebases</li>
  <li>Contribute improvements back to the community</li>
  <li>Play games that are completely free with no hidden costs</li>
</ul>

<h3>Community-Driven Development</h3>
<p>The games featured in this category benefit from passionate communities of developers, artists, and players who continuously improve and expand them. Many have been in active development for years, with dedicated teams ensuring regular updates and new content.</p>

<p>Whether you're looking for your next gaming adventure, want to contribute to a project, or are seeking inspiration for your own game development journey, you'll find quality options here. Each game is handpicked for its playability, active maintenance, and overall quality.</p>
`.trim();

  return {
    slug: category.slug,
    content: sampleContent,
    generatedAt: new Date().toISOString(),
  };
}

// Batch processing helper
async function processBatch(
  categories: Category[],
  useAI: boolean,
): Promise<GeneratedContent[]> {
  const results: GeneratedContent[] = [];

  for (const category of categories) {
    let content: GeneratedContent | null;

    if (useAI && !DRY_RUN) {
      content = await generateContentWithOpenAI(category);
    } else {
      content = generateSampleContent(category);
    }

    if (content) {
      results.push(content);
      console.log(`Generated content for: ${category.slug}`);
    }
  }

  return results;
}

// Save content to output file
async function saveContent(allContent: GeneratedContent[]): Promise<void> {
  const fs = await import("fs/promises");
  const path = await import("path");

  const outputDir = path.join(process.cwd(), "data");
  const outputFile = path.join(outputDir, "category-content.json");

  // Create directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });

  // Read existing content if any
  let existingContent: Record<string, GeneratedContent> = {};
  try {
    const existing = await fs.readFile(outputFile, "utf-8");
    const parsed = JSON.parse(existing);
    if (parsed.categories) {
      existingContent = parsed.categories;
    }
  } catch {
    // File doesn't exist yet, that's fine
  }

  // Merge new content with existing
  for (const content of allContent) {
    existingContent[content.slug] = content;
  }

  // Save merged content
  const output = {
    generatedAt: new Date().toISOString(),
    totalCategories: Object.keys(existingContent).length,
    categories: existingContent,
  };

  await fs.writeFile(outputFile, JSON.stringify(output, null, 2));
  console.log(`\nSaved ${allContent.length} entries to ${outputFile}`);
}

// Main execution
async function main(): Promise<void> {
  console.log("=== Category Content Generator ===\n");

  const categories = getAllCategories();
  console.log(`Total categories: ${categories.length}`);

  const useAI = !!OPENAI_API_KEY && !DRY_RUN;
  console.log(
    `Mode: ${DRY_RUN ? "DRY RUN (sample content)" : useAI ? "AI Generation" : "Sample content (no API key)"}\n`,
  );

  const allContent: GeneratedContent[] = [];

  // Process in batches
  for (let i = 0; i < categories.length; i += BATCH_SIZE) {
    const batch = categories.slice(i, i + BATCH_SIZE);
    console.log(
      `\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(categories.length / BATCH_SIZE)}...`,
    );

    const batchResults = await processBatch(batch, useAI);
    allContent.push(...batchResults);

    // Add delay between batches to avoid rate limits
    if (i + BATCH_SIZE < categories.length && useAI) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  // Save all content
  await saveContent(allContent);

  // Summary
  console.log("\n=== Summary ===");
  console.log(
    `Generated: ${allContent.length}/${categories.length} categories`,
  );

  if (useAI) {
    const totalTokens = allContent.reduce(
      (sum, c) => sum + (c.tokenUsage?.total || 0),
      0,
    );
    const estimatedCost = (totalTokens / 1000000) * 0.15; // GPT-4o-mini pricing
    console.log(`Total tokens used: ${totalTokens.toLocaleString()}`);
    console.log(`Estimated cost: $${estimatedCost.toFixed(4)}`);
  }
}

// Run the script
main().catch(console.error);
