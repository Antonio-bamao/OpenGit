import type { GitCommand } from "./types";

export function parseGitCommand(input: string): GitCommand {
  const raw = input.trim();
  const tokens = tokenize(raw);

  if (tokens[0] !== "git") {
    return {
      raw,
      isGit: false,
      name: "",
      args: tokens
    };
  }

  return {
    raw,
    isGit: true,
    name: tokens[1] ?? "",
    args: tokens.slice(2)
  };
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;

  for (const char of input) {
    if ((char === '"' || char === "'") && quote === null) {
      quote = char;
      continue;
    }

    if (char === quote) {
      quote = null;
      continue;
    }

    if (char === " " && quote === null) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

