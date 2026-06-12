// lib/upstash/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { redis, isRedisAvailable } from "./redis";

// Create a no-op rate limiter for when Redis is not available
const createNoOpLimiter = () => ({
  limit: async (identifier: string) => ({
    success: true,
    pending: Promise.resolve(),
    reset: Date.now() + 60000,
  }),
});

// Only create real rate limiters if Redis is available
export const loginLimiter = isRedisAvailable
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(10, "5 m"),
      analytics: true,
      prefix: "ratelimit:login",
    })
  : createNoOpLimiter();

export const forgotPasswordLimiter = isRedisAvailable
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
      prefix: "ratelimit:forgot-password",
    })
  : createNoOpLimiter();

export const smsLimiter = isRedisAvailable
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(50, "1 m"),
      analytics: true,
      prefix: "ratelimit:sms",
    })
  : createNoOpLimiter();

export const signUpLimiter = isRedisAvailable
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "ratelimit:signup",
    })
  : createNoOpLimiter();

export const apiLimiter = isRedisAvailable
  ? new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:api",
    })
  : createNoOpLimiter();

// Helper function to apply rate limiting
export async function applyRateLimit(
  limiter: typeof loginLimiter,
  identifier: string
): Promise<{ success: boolean; message?: string }> {
  const { success } = await limiter.limit(identifier);

  if (!success) {
    return {
      success: false,
      message: "Rate limit exceeded. Please try again later.",
    };
  }

  return { success: true };
}