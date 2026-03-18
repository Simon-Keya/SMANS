// lib/upstash/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Rate limit presets (you can add more as needed)

// 1. Login attempts: 10 attempts per 5 minutes per IP
export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "5 m"),
  analytics: true,
  prefix: "ratelimit:login",
});

// 2. Forgot password requests: 5 per email per 10 minutes
export const forgotPasswordLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "ratelimit:forgot-password",
});

// 3. SMS sending: 50 per minute globally (or per user/IP)
export const smsLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 m"),
  analytics: true,
  prefix: "ratelimit:sms",
});

// 4. General API rate limit (example for public endpoints)
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:api",
});