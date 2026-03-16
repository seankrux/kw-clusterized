/**
 * Simple keyword clustering using text similarity
 * Groups keywords that share common words or have high word overlap
 */

// Common stop words to ignore
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
  "to", "was", "will", "with", "how", "what", "when", "where", "who",
  "why", "best", "top", "vs", "versus", "or", "the", "new", "old"
]);

/**
 * Extract significant words from a keyword phrase
 */
function extractWords(keyword: string): string[] {
  return keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Calculate Jaccard similarity between two sets
 */
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * Calculate similarity score between two keywords
 */
function calculateSimilarity(keyword1: string, keyword2: string): number {
  const words1 = extractWords(keyword1);
  const words2 = extractWords(keyword2);

  if (words1.length === 0 || words2.length === 0) {
    // If no significant words, check for substring match
    return keyword1.includes(keyword2) || keyword2.includes(keyword1) ? 0.5 : 0;
  }

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  // Jaccard similarity
  const jaccard = jaccardSimilarity(set1, set2);

  // Check for common prefix/suffix
  const words1Str = words1.join(" ");
  const words2Str = words2.join(" ");
  const prefixBonus = words1Str.startsWith(words2Str.split(" ")[0]) ? 0.2 : 0;
  const suffixBonus = words1Str.endsWith(words2Str.split(" ").pop() || "") ? 0.2 : 0;

  return Math.min(1, jaccard + prefixBonus + suffixBonus);
}

/**
 * Cluster keywords using hierarchical clustering with a similarity threshold
 */
export function clusterKeywords(
  keywords: string[],
  threshold: number = 0.3
): string[][] {
  if (keywords.length === 0) return [];
  if (keywords.length === 1) return [keywords];

  const clusters: string[][] = [];
  const assigned = new Set<number>();

  // Sort keywords by length (longer first) for better clustering
  const sortedIndices = keywords
    .map((_, i) => i)
    .sort((a, b) => keywords[b].length - keywords[a].length);

  for (const i of sortedIndices) {
    if (assigned.has(i)) continue;

    const cluster: string[] = [keywords[i]];
    assigned.add(i);

    // Find similar keywords
    for (const j of sortedIndices) {
      if (i === j || assigned.has(j)) continue;

      const similarity = calculateSimilarity(keywords[i], keywords[j]);
      
      if (similarity >= threshold) {
        cluster.push(keywords[j]);
        assigned.add(j);
      }
    }

    clusters.push(cluster);
  }

  // Sort clusters by size (largest first)
  return clusters.sort((a, b) => b.length - a.length);
}
