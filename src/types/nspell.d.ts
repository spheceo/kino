declare module "nspell" {
  type Dictionary = {
    aff: Uint8Array;
    dic?: Uint8Array;
  };

  type SpellChecker = {
    correct: (word: string) => boolean;
    suggest: (word: string) => string[];
  };

  export default function nspell(dictionary: Dictionary): SpellChecker;
}
