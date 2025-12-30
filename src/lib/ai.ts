/**
 * AI Integration for Open Source Games Platform
 *
 * Provides functions for generating AI content using OpenAI GPT-4o-mini:
 * - Game reviews (300-500 words)
 * - SEO meta titles
 * - SEO meta descriptions
 */

import type { AIReviewRequest, AIReviewResponse } from "../types/game";

// OpenAI API configuration
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_REVIEW_TOKENS = 800;
const MAX_META_TOKENS = 150;

interface OpenAIResponse {
  choices?: { message?: { content?: string } }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    type: string;
    code: string;
  };
}

interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

interface AIGenerationResult<T> {
  data: T;
  tokenUsage?: TokenUsage;
}

/**
 * Call OpenAI API with the given prompt
 */
async function callOpenAI(
  apiKey: string,
  prompt: string,
  maxTokens: number,
  temperature: number = 0.7,
): Promise<{ content: string; tokenUsage?: TokenUsage }> {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as OpenAIResponse;

  if (data.error) {
    throw new Error(`OpenAI API error: ${data.error.message}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  const tokenUsage = data.usage
    ? {
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
        total: data.usage.total_tokens,
      }
    : undefined;

  return { content: content.trim(), tokenUsage };
}

/**
 * Generate a 300-500 word game review
 *
 * The review includes:
 * - Game type and gameplay (100 words)
 * - Technical highlights (100 words)
 * - Target audience (50 words)
 * - Comparison with competitors (100 words)
 * - Recommendation (50 words)
 */
export async function generateGameReview(
  game: AIReviewRequest,
  apiKey: string,
): Promise<AIGenerationResult<string>> {
  const prompt = `You are a professional game editor writing reviews for an open-source games directory.

Game Information:
- Name: ${game.title}
- Description: ${game.description || "No description available"}
- Primary Language: ${game.language || "Unknown"}
- GitHub Topics: ${game.topics?.join(", ") || "None"}
- GitHub Stars: ${game.stars?.toLocaleString() || "Unknown"}
- Category: ${game.category || "General"}

Task: Write a 300-500 word review with the following sections:

## Game Type and Gameplay (100 words)
What type of game is this? What is the core gameplay? Use comparisons (e.g., "an open-source version of Civilization 5").

## Technical Highlights (100 words)
What tech stack is used? What are the unique technical advantages? (e.g., "Written in Rust, starts 3x faster than similar games")

## Target Audience (50 words)
Who should play this game? Is it beginner-friendly or for hardcore players?

## Comparison with Competitors (100 words)
How does it compare to commercial games or other open-source alternatives? What are the pros and cons?

## Recommendation (50 words)
Summarize in one sentence why this game is worth trying.

Tone: Professional but engaging, like an IGN review with attitude.
Output: Plain text in Markdown format. Do not include the word counts in the output.`;

  const { content, tokenUsage } = await callOpenAI(
    apiKey,
    prompt,
    MAX_REVIEW_TOKENS,
    0.7,
  );

  return { data: content, tokenUsage };
}

/**
 * Generate SEO-optimized meta title for a game
 *
 * Format: "[Game Name] - [Key Feature] | Open Source Games"
 * Max length: 60 characters
 */
export async function generateMetaTitle(
  game: AIReviewRequest,
  apiKey: string,
): Promise<AIGenerationResult<string>> {
  const prompt = `Generate an SEO-optimized meta title for this open-source game.

Game Information:
- Name: ${game.title}
- Description: ${game.description || "No description"}
- Language: ${game.language || "Unknown"}
- Category: ${game.category || "General"}
- Stars: ${game.stars?.toLocaleString() || "Unknown"}

Requirements:
- Format: "[Game Name] - [Key Feature/Type] | Open Source Games"
- Maximum 60 characters
- Include primary keyword (game type or unique feature)
- Make it compelling for search results

Output only the title, nothing else.`;

  const { content, tokenUsage } = await callOpenAI(
    apiKey,
    prompt,
    MAX_META_TOKENS,
    0.5,
  );

  // Ensure title is within limits
  const title = content.replace(/^["']|["']$/g, "").slice(0, 60);

  return { data: title, tokenUsage };
}

/**
 * Generate SEO-optimized meta description for a game
 *
 * Max length: 155 characters
 */
export async function generateMetaDescription(
  game: AIReviewRequest,
  apiKey: string,
): Promise<AIGenerationResult<string>> {
  const prompt = `Generate an SEO-optimized meta description for this open-source game.

Game Information:
- Name: ${game.title}
- Description: ${game.description || "No description"}
- Language: ${game.language || "Unknown"}
- Topics: ${game.topics?.join(", ") || "None"}
- Category: ${game.category || "General"}
- Stars: ${game.stars?.toLocaleString() || "Unknown"}

Requirements:
- Maximum 155 characters
- Include a call to action (e.g., "Download now", "Try it free")
- Mention it's open-source and free
- Be compelling for search results

Output only the description, nothing else.`;

  const { content, tokenUsage } = await callOpenAI(
    apiKey,
    prompt,
    MAX_META_TOKENS,
    0.5,
  );

  // Ensure description is within limits
  const description = content.replace(/^["']|["']$/g, "").slice(0, 155);

  return { data: description, tokenUsage };
}

/**
 * Generate complete AI content for a game (review + meta title + meta description)
 */
export async function generateGameContent(
  game: AIReviewRequest,
  apiKey: string,
): Promise<AIGenerationResult<AIReviewResponse>> {
  const [reviewResult, titleResult, descriptionResult] = await Promise.all([
    generateGameReview(game, apiKey),
    generateMetaTitle(game, apiKey),
    generateMetaDescription(game, apiKey),
  ]);

  const totalUsage: TokenUsage = {
    prompt:
      (reviewResult.tokenUsage?.prompt || 0) +
      (titleResult.tokenUsage?.prompt || 0) +
      (descriptionResult.tokenUsage?.prompt || 0),
    completion:
      (reviewResult.tokenUsage?.completion || 0) +
      (titleResult.tokenUsage?.completion || 0) +
      (descriptionResult.tokenUsage?.completion || 0),
    total:
      (reviewResult.tokenUsage?.total || 0) +
      (titleResult.tokenUsage?.total || 0) +
      (descriptionResult.tokenUsage?.total || 0),
  };

  return {
    data: {
      aiReview: reviewResult.data,
      metaTitle: titleResult.data,
      metaDescription: descriptionResult.data,
    },
    tokenUsage: totalUsage,
  };
}

// ============================================================================
// Mock Data Generation (for dry-run mode without API key)
// ============================================================================

/**
 * Generate mock review for testing without API
 */
export function generateMockReview(game: AIReviewRequest): string {
  const language = game.language || "Unknown";
  const category = game.category || "game";
  const stars = game.stars?.toLocaleString() || "many";

  return `## Game Type and Gameplay

${game.title} is an engaging open-source ${category} that showcases what community-driven development can achieve. ${game.description ? `The game offers ${game.description.toLowerCase().slice(0, 100)}...` : "Players can expect a unique gaming experience with thoughtful mechanics."} Think of it as a community-built alternative that prioritizes player freedom and customization.

## Technical Highlights

Built with ${language}, ${game.title} demonstrates solid engineering practices. The codebase is well-structured, making it an excellent learning resource for aspiring game developers. With ${stars} GitHub stars, it has proven community interest and ongoing development support. The architecture allows for easy modification and extension.

## Target Audience

This game is perfect for players who appreciate open-source software and want to support community projects. ${game.topics?.includes("multiplayer") ? "Multiplayer features make it great for gaming with friends." : "Solo players will find plenty of content to explore."} Suitable for both casual players and those seeking deeper engagement.

## Comparison with Competitors

Compared to commercial alternatives, ${game.title} offers complete freedom to modify and redistribute. While it may lack the polish of AAA titles, it compensates with transparency and community involvement. The active development means regular updates and improvements based on player feedback.

## Recommendation

${game.title} is a must-try for open-source gaming enthusiasts who value freedom, community, and the ability to contribute to the games they play.`;
}

/**
 * Generate mock meta title for testing without API
 */
export function generateMockMetaTitle(game: AIReviewRequest): string {
  const category = game.category || "Game";
  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);
  return `${game.title} - Free Open Source ${capitalizedCategory} | Open Source Games`.slice(
    0,
    60,
  );
}

/**
 * Generate mock meta description for testing without API
 */
export function generateMockMetaDescription(game: AIReviewRequest): string {
  const language = game.language ? ` Built with ${game.language}.` : "";
  return `Download ${game.title}, a free open-source game.${language} Join the community today!`.slice(
    0,
    155,
  );
}

/**
 * Generate complete mock content for testing without API
 */
export function generateMockGameContent(
  game: AIReviewRequest,
): AIReviewResponse {
  return {
    aiReview: generateMockReview(game),
    metaTitle: generateMockMetaTitle(game),
    metaDescription: generateMockMetaDescription(game),
  };
}
