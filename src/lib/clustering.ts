/**
 * Keyword clustering using text similarity.
 * Groups keywords that share common significant words using
 * weighted Jaccard similarity with single-linkage clustering.
 * Words are weighted by inverse document frequency so common
 * words across the corpus (e.g. "tool", "free") contribute less.
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
 * Build inverse document frequency weights for all words in the corpus.
 * Words that appear in many keywords get lower weights.
 */
function buildIdfWeights(keywords: string[]): Record<string, number> {
  const docFreq: Record<string, number> = {};
  const n = keywords.length;

  for (const kw of keywords) {
    const uniqueWords = new Set(extractWords(kw));
    Array.from(uniqueWords).forEach((word) => {
      docFreq[word] = (docFreq[word] || 0) + 1;
    });
  }

  const idf: Record<string, number> = {};
  for (const word in docFreq) {
    // Standard IDF: log(N / df). Words appearing in every doc get ~0.
    idf[word] = Math.log((n + 1) / (docFreq[word] + 1)) + 1;
  }
  return idf;
}

/**
 * Calculate weighted Jaccard similarity between two keywords.
 * Shared words contribute their IDF weight; the score is the
 * sum of shared weights divided by the sum of all weights.
 */
function calculateSimilarity(
  keyword1: string,
  keyword2: string,
  idf: Record<string, number>
): number {
  const words1 = extractWords(keyword1);
  const words2 = extractWords(keyword2);

  if (words1.length === 0 || words2.length === 0) {
    const k1 = keyword1.toLowerCase();
    const k2 = keyword2.toLowerCase();
    return k1.includes(k2) || k2.includes(k1) ? 0.5 : 0;
  }

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  // Weighted Jaccard: sum of min(w) / sum of max(w)
  const allWords = new Set([...Array.from(set1), ...Array.from(set2)]);
  let intersectionWeight = 0;
  let unionWeight = 0;

  Array.from(allWords).forEach((word) => {
    const w = idf[word] || 1;
    const in1 = set1.has(word) ? 1 : 0;
    const in2 = set2.has(word) ? 1 : 0;
    intersectionWeight += Math.min(in1, in2) * w;
    unionWeight += Math.max(in1, in2) * w;
  });

  if (unionWeight === 0) return 0;
  return intersectionWeight / unionWeight;
}

/**
 * Calculate similarity between a keyword and a cluster.
 * Returns the maximum similarity to any member (single-linkage).
 */
function clusterSimilarity(
  keyword: string,
  cluster: string[],
  idf: Record<string, number>
): number {
  let maxSim = 0;
  for (const member of cluster) {
    const sim = calculateSimilarity(keyword, member, idf);
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

  // Pre-compute IDF weights from the full corpus
  const idf = buildIdfWeights(keywords);

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
      const sim = clusterSimilarity(keywords[i], clusters[c], idf);
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
        const sim = clusterSimilarity(keywords[j], cluster, idf);
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
