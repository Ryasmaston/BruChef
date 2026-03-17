from rapidfuzz import fuzz, process
from typing import List

FILLER_WORDS = {
    'a', 'an', 'the', 'fresh', 'pure', 'premium', 'original',
    'classic', 'special', 'extra'
}

def normalise(name: str) -> str:
    import re
    name = name.lower().strip()
    name = re.sub(r'[^a-z0-9\s]', '', name)
    words = [w for w in name.split() if w not in FILLER_WORDS]
    return ' '.join(words)

def find_similar(query: str, candidates: List[str], threshold: float = 40, limit: int = 5) -> List[dict]:
    normalised_query = normalise(query)
    normalised_candidates = {c: normalise(c) for c in candidates}

    results = process.extract(
        normalised_query,
        normalised_candidates,
        scorer=fuzz.WRatio,
        limit=limit * 2
    )

    seen = set()
    filtered = []
    for original_name, score, _ in results:
        if score >= threshold and original_name not in seen:
            seen.add(original_name)
            filtered.append({'name': original_name, 'score': score / 100})

    return filtered[:limit]
