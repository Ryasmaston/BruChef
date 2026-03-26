import requests
import os

UNSPLASH_ACCESS_KEY = os.environ.get('UNSPLASH_ACCESS_KEY')
BASE_URL = 'https://api.unsplash.com'

def fetch_image_url(query: str) -> str | None:
    if not UNSPLASH_ACCESS_KEY:
        return None
    try:
        response = requests.get(
            f'{BASE_URL}/search/photos',
            params={
                'query': query,
                'per_page': 1,
                'orientation': 'landscape',
                'client_id': UNSPLASH_ACCESS_KEY
            }
        )
        data = response.json()
        results = data.get('results', [])
        if results:
            return results[0]['urls']['regular']
        return None
    except Exception:
        return None
