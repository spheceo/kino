import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import nspell from "nspell";

type SpellChecker = {
  correct: (word: string) => boolean;
  suggest: (word: string) => string[];
};

const dictionaryPath = join(process.cwd(), "node_modules", "dictionary-en");

const spell = nspell({
  aff: readFileSync(join(dictionaryPath, "index.aff")),
  dic: readFileSync(join(dictionaryPath, "index.dic")),
}) as SpellChecker;

const manualCorrections: Record<string, string> = {
  micheal: "michael",
};

function preserveCapitalization(original: string, suggestion: string) {
  if (original === original.toUpperCase()) {
    return suggestion.toUpperCase();
  }

  if (original[0] === original[0]?.toUpperCase()) {
    return suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
  }

  return suggestion.toLowerCase();
}

export function correctSearchQuery(query: string) {
  return query
    .split(/(\s+)/)
    .map((part) => {
      if (!part.trim() || !/^[a-z]+$/i.test(part)) {
        return part;
      }

      const lower = part.toLowerCase();
      const manualCorrection = manualCorrections[lower];

      if (manualCorrection) {
        return preserveCapitalization(part, manualCorrection);
      }

      if (spell.correct(part)) {
        return part;
      }

      const suggestion = spell.suggest(part)[0];

      return suggestion ? preserveCapitalization(part, suggestion) : part;
    })
    .join("");
}
