import requests
import os

BASE_URL = 'https://api.unsplash.com'

def fetch_image_url(query: str) -> str | None:
    UNSPLASH_ACCESS_KEY = os.environ.get('UNSPLASH_ACCESS_KEY')
    if not UNSPLASH_ACCESS_KEY:
        return None
    try:
        response = requests.get(
            f'{BASE_URL}/search/photos',
            params={
                'query': query,
                'per_page': 5,
                'orientation': 'landscape',
                'client_id': UNSPLASH_ACCESS_KEY
            }
        )
        data = response.json()
        results = data.get('results', [])
        if not results:
            return None
        for result in results:
            w = result.get('width', 0)
            h = result.get('height', 0)
            if w >= 1200 and h >= 600:
                raw = result['urls']['raw']
                return raw
        return results[0]['urls']['raw']

    except Exception:
        return None
