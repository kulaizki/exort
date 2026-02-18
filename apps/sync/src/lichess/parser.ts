import type { LichessGame } from './types.js';

export function parseNdjsonLine(line: string): LichessGame | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as LichessGame;
  } catch {
    return null;
  }
}
