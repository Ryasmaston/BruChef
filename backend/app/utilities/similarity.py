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

def find_similar(query: str, candidates: List[str], threshold: float = 65, limit: int = 5) -> List[dict]:
    normalised_query = normalise(query)
    normalised_candidates = [(c, normalise(c)) for c in candidates]
    results = []
    for original_name, normalised_name in normalised_candidates:
        score = fuzz.WRatio(normalised_query, normalised_name)
        if score >= threshold:
            results.append({'name': original_name, 'score': score / 100})
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:limit]
