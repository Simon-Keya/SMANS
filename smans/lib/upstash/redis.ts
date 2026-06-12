// lib/upstash/redis.ts
import { Redis } from "@upstash/redis";

// Check if we should enable Upstash
const ENABLE_UPSTASH = process.env.ENABLE_UPSTASH === "true";

// Only validate and create Redis client if enabled
const hasRedisUrl = process.env.UPSTASH_REDIS_REST_URL;
const hasRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (ENABLE_UPSTASH && !hasRedisUrl) {
  console.warn("⚠️ ENABLE_UPSTASH is true but UPSTASH_REDIS_REST_URL is not set");
}

if (ENABLE_UPSTASH && !hasRedisToken) {
  console.warn("⚠️ ENABLE_UPSTASH is true but UPSTASH_REDIS_REST_TOKEN is not set");
}

// Create Redis client only if enabled and configured
export const redis = ENABLE_UPSTASH && hasRedisUrl && hasRedisToken
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Export a flag to check if Redis is available
export const isRedisAvailable = redis !== null;