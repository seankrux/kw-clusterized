/**
 * Keyword clustering using text similarity.
 * Groups keywords that share common significant words using
 * Jaccard similarity with single-linkage clustering.
 */

// Only remove truly empty function words
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
  "to", "was", "will", "with", "how", "what", "when", "where", "who",
  "why", "vs", "versus", "or", "do", "does", "did", "not", "no",
  "but", "if", "so", "than", "too", "very", "can", "just", "should",
  "now", "your", "you", "my", "our", "their", "his", "her",
]);

/**
 * Extract significant words from a keyword phrase.
 */
function extractWords(keyword: string): string[] {
  return keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Calculate Jaccard similarity between two keywords based on word overlap.
 */
function calculateSimilarity(keyword1: string, keyword2: string): number {
  const words1 = extractWords(keyword1);
  const words2 = extractWords(keyword2);

  if (words1.length === 0 || words2.length === 0) {
    const k1 = keyword1.toLowerCase();
    const k2 = keyword2.toLowerCase();
    return k1.includes(k2) || k2.includes(k1) ? 0.5 : 0;
  }

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  // Count intersection
  let intersectionSize = 0;
  Array.from(set1).forEach((word) => {
    if (set2.has(word)) intersectionSize++;
  });
  const unionSize = new Set([...Array.from(set1), ...Array.from(set2)]).size;

  if (unionSize === 0) return 0;

  const jaccard = intersectionSize / unionSize;

  // Bonus: if any shared word is 4+ chars (semantically meaningful), boost the score.
  // This helps group keywords like "content marketing" + "content creation" that
  // share a strong topical word but have low raw Jaccard due to differing modifiers.
  let meaningfulOverlap = false;
  Array.from(set1).forEach((word) => {
    if (word.length >= 4 && set2.has(word)) meaningfulOverlap = true;
  });

  return meaningfulOverlap ? Math.min(1, jaccard + 0.15) : jaccard;
}

/**
 * Calculate similarity between a keyword and a cluster.
 * Returns the maximum similarity to any member (single-linkage).
 */
function clusterSimilarity(keyword: string, cluster: string[]): number {
  let maxSim = 0;
  for (const member of cluster) {
    const sim = calculateSimilarity(keyword, member);
    if (sim > maxSim) maxSim = sim;
  }
  return maxSim;
}

/**
 * Cluster keywords using greedy single-linkage agglomerative clustering.
 * Keywords are assigned to the best matching existing cluster, or start
 * a new one if no cluster exceeds the similarity threshold.
 */
export function clusterKeywords(
  keywords: string[],
  threshold: number = 0.25
): string[][] {
  if (keywords.length === 0) return [];
  if (keywords.length === 1) return [keywords];

  const clusters: string[][] = [];
  const assigned = new Set<number>();

  // Sort keywords by length (longer first) for better seed selection
  const sortedIndices = keywords
    .map((_, i) => i)
    .sort((a, b) => keywords[b].length - keywords[a].length);

  for (const i of sortedIndices) {
    if (assigned.has(i)) continue;

    // Try to find the best existing cluster for this keyword
    let bestClusterIdx = -1;
    let bestSim = 0;
    for (let c = 0; c < clusters.length; c++) {
      const sim = clusterSimilarity(keywords[i], clusters[c]);
      if (sim > bestSim) {
        bestSim = sim;
        bestClusterIdx = c;
      }
    }

    if (bestSim >= threshold && bestClusterIdx >= 0) {
      clusters[bestClusterIdx].push(keywords[i]);
      assigned.add(i);
    } else {
      // Start a new cluster
      const cluster: string[] = [keywords[i]];
      assigned.add(i);

      // Pull in remaining unassigned keywords
      for (const j of sortedIndices) {
        if (i === j || assigned.has(j)) continue;
        const sim = clusterSimilarity(keywords[j], cluster);
        if (sim >= threshold) {
          cluster.push(keywords[j]);
          assigned.add(j);
        }
      }

      clusters.push(cluster);
    }
  }

  // Sort clusters by size (largest first)
  return clusters.sort((a, b) => b.length - a.length);
}
