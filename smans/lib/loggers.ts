// lib/logger.ts
// Simple structured logger (can be extended with Winston/Pino later)

type LogLevel = "info" | "warn" | "error" | "debug";

const colors = {
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  debug: "\x1b[36m",
  reset: "\x1b[0m",
};

function format(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const color = colors[level] || "";
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";

  return `${color}[${level.toUpperCase()}] ${timestamp} - ${message}${metaStr}${colors.reset}`;
}

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(format("info", message, meta));
  },

  warn: (message: string, meta?: any) => {
    console.warn(format("warn", message, meta));
  },

  error: (message: string, error?: any) => {
    console.error(format("error", message, error));
    if (error?.stack) console.error(error.stack);
  },

  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(format("debug", message, meta));
    }
  },
};