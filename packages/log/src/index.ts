// Shared pino logger. One logger for the whole codebase — every package and
// app imports from here instead of creating their own. Controlled by LOG_LEVEL.
import pino from "pino";

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug");

export const log = pino({ level });