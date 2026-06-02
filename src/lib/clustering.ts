const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "will",
  "with",
  "how",
  "what",
  "when",
  "where",
  "who",
  "why",
  "vs",
  "versus",
  "or",
  "do",
  "does",
  "did",
  "not",
  "no",
  "but",
  "if",
  "so",
  "than",
  "too",
  "very",
  "can",
  "just",
  "should",
  "now",
  "your",
  "you",
  "my",
  "our",
  "their",
  "his",
  "her",
]);

function tokenize(kw: string): string[] {
  return kw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function buildTfIdf(keywords: string[]): Map<string, Map<string, number>> {
  const tokenized = keywords.map(tokenize);
  const df = new Map<string, number>();
  for (const toks of tokenized) {
    const uniq = new Set(toks);
    uniq.forEach((t) => df.set(t, (df.get(t) || 0) + 1));
  }
  const n = keywords.length;
  const vectors = new Map<string, Map<string, number>>();
  keywords.forEach((kw, i) => {
    const toks = tokenized[i];
    const tf = new Map<string, number>();
    toks.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
    const vec = new Map<string, number>();
    tf.forEach((count, term) => {
      const idf = Math.log((n + 1) / ((df.get(term) || 0) + 1)) + 1;
      vec.set(term, (count / toks.length) * idf);
    });
    vectors.set(kw, vec);
  });
  return vectors;
}

function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  a.forEach((v, k) => {
    dot += v * (b.get(k) || 0);
    normA += v * v;
  });
  b.forEach((v) => {
    normB += v * v;
  });
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function clusterSimilarity(
  kw: string,
  cluster: string[],
  vectors: Map<string, Map<string, number>>,
): number {
  let max = 0;
  for (const member of cluster) {
    const a = vectors.get(kw);
    const b = vectors.get(member);
    if (a && b) {
      const s = cosineSimilarity(a, b);
      if (s > max) max = s;
    }
  }
  return max;
}

export function clusterKeywords(
  keywords: string[],
  threshold = 0.2,
): string[][] {
  if (keywords.length === 0) return [];
  if (keywords.length === 1) return [keywords];

  const vectors = buildTfIdf(keywords);
  const clusters: string[][] = [];
  const assigned = new Set<number>();

  const sorted = [...keywords].sort(
    (a, b) => tokenize(b).length - tokenize(a).length,
  );
  const indices = sorted.map((kw) => keywords.indexOf(kw));

  for (const i of indices) {
    if (assigned.has(i)) continue;
    const kw = keywords[i];

    let bestIdx = -1,
      bestSim = 0;
    for (let c = 0; c < clusters.length; c++) {
      const sim = clusterSimilarity(kw, clusters[c], vectors);
      if (sim > bestSim) {
        bestSim = sim;
        bestIdx = c;
      }
    }

    if (bestSim >= threshold && bestIdx >= 0) {
      clusters[bestIdx].push(kw);
      assigned.add(i);
    } else {
      const cluster: string[] = [kw];
      assigned.add(i);
      for (const j of indices) {
        if (assigned.has(j)) continue;
        const sim = clusterSimilarity(keywords[j], cluster, vectors);
        if (sim >= threshold) {
          cluster.push(keywords[j]);
          assigned.add(j);
        }
      }
      clusters.push(cluster);
    }
  }

  return clusters.sort((a, b) => b.length - a.length);
}
