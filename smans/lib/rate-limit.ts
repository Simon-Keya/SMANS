// lib/rate-limit.ts
// Simple in-memory rate limiter (for dev) - use Upstash/Redis in production

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Use Redis if available, fallback to in-memory
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : undefined;

export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 requests per minute
      analytics: true,
      prefix: "smans:ratelimit",
    })
  : {
      limit: async (identifier: string) => ({
        success: true,
        pending: Promise.resolve(),
        reset: Date.now() + 60000,
      }),
    };

// Usage in action or route:
export async function applyRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    throw new Error("Rate limit exceeded. Try again later.");
  }
}

// Example: limit login attempts by IP
// await applyRateLimit(`login:${ip}`);