/**
 * Lightweight Indonesian + English stemmer for keyword clustering.
 * Spec section 4.2: tokenisasi dan stemming ringan.
 */

// Common Indonesian suffixes to strip
const ID_SUFFIXES = ['kan', 'an', 'nya', 'lah', 'kah', 'pun', 'mu', 'ku'];
const ID_PREFIXES = ['me', 'mem', 'men', 'meng', 'meny', 'ber', 'di', 'ke', 'se', 'pe', 'per', 'ter'];

// Common English suffixes to strip
const EN_SUFFIXES = ['ing', 'tion', 'sion', 'ment', 'ness', 'able', 'ible', 'ful', 'less', 'ous', 'ive', 'ly', 'er', 'est', 'ed', 'es', 's'];

// Stop words (ID + EN) to exclude from similarity comparison
const STOP_WORDS = new Set([
  // Indonesian
  'dan', 'di', 'ke', 'dari', 'yang', 'untuk', 'dengan', 'adalah', 'ini', 'itu',
  'pada', 'atau', 'juga', 'tidak', 'akan', 'bisa', 'ada', 'oleh', 'saya', 'kami',
  'kita', 'mereka', 'anda', 'dia', 'ia', 'se', 'ber', 'ter',
  // English
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with',
  'at', 'by', 'from', 'as', 'into', 'about', 'but', 'or', 'and', 'not',
  'this', 'that', 'it', 'its', 'my', 'your', 'his', 'her', 'our', 'their',
  'what', 'which', 'who', 'how', 'when', 'where', 'why',
]);

/**
 * Simple stem for Indonesian word.
 */
function stemIndonesian(word: string): string {
  let stemmed = word.toLowerCase();

  // Remove suffixes first
  for (const suffix of ID_SUFFIXES) {
    if (stemmed.endsWith(suffix) && stemmed.length > suffix.length + 2) {
      stemmed = stemmed.slice(0, -suffix.length);
      break;
    }
  }

  // Remove prefixes
  for (const prefix of ID_PREFIXES) {
    if (stemmed.startsWith(prefix) && stemmed.length > prefix.length + 2) {
      stemmed = stemmed.slice(prefix.length);
      break;
    }
  }

  return stemmed;
}

/**
 * Simple stem for English word.
 */
function stemEnglish(word: string): string {
  let stemmed = word.toLowerCase();

  for (const suffix of EN_SUFFIXES) {
    if (stemmed.endsWith(suffix) && stemmed.length > suffix.length + 2) {
      stemmed = stemmed.slice(0, -suffix.length);
      break;
    }
  }

  return stemmed;
}

/**
 * Tokenize a keyword into stemmed, non-stop tokens.
 */
export function tokenize(keyword: string): Set<string> {
  const words = keyword
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024F\s]/gi, '') // Keep alphanumeric + accented chars
    .split(/\s+/)
    .filter(w => w.length > 0 && !STOP_WORDS.has(w));

  const tokens = new Set<string>();
  for (const word of words) {
    // Apply both stemmers and keep shortest result
    const idStem = stemIndonesian(word);
    const enStem = stemEnglish(word);
    const stem = idStem.length <= enStem.length ? idStem : enStem;
    tokens.add(stem);
  }

  return tokens;
}

/**
 * Jaccard similarity between two token sets.
 * Spec section 4.2: similarity >= 0.6 means same cluster.
 */
export function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
