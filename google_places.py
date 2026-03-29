"""Google Places API service — fetches real reviews and caches them in the DB."""
import requests
from flask import current_app


FIND_URL   = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
DETAIL_URL = "https://maps.googleapis.com/maps/api/place/details/json"

PLATFORM_MAP = {
    'google': 'Google'
}


def _api_key():
    return current_app.config.get('GOOGLE_PLACES_API_KEY', '')


def fetch_and_cache_reviews(venue):
    """
    Fetch up to 5 Google reviews for *venue* and store them in the DB.
    Returns True on success, False if API is unavailable or fails.
    Already-cached venues (source='google') are skipped.
    """
    from app import db
    from app.models import Review

    # Don't re-fetch if we already have live reviews
    if Review.query.filter_by(venue_id=venue.id, source='google').first():
        return True

    api_key = _api_key()
    if not api_key:
        return False

    try:
        # ── Step 1: find place_id ──────────────────────────────────────────
        query = f"{venue.name} {venue.location}"
        r = requests.get(FIND_URL, params={
            'input': query,
            'inputtype': 'textquery',
            'fields': 'place_id,name,rating',
            'key': api_key,
        }, timeout=8)
        candidates = r.json().get('candidates', [])
        if not candidates:
            return False

        place_id = candidates[0]['place_id']

        # ── Step 2: fetch place details ────────────────────────────────────
        r2 = requests.get(DETAIL_URL, params={
            'place_id': place_id,
            'fields': 'name,rating,reviews,user_ratings_total',
            'reviews_sort': 'most_relevant',
            'language': 'en',
            'key': api_key,
        }, timeout=8)
        result = r2.json().get('result', {})

        raw_reviews = result.get('reviews', [])
        if not raw_reviews:
            return False

        # ── Step 3: store in DB ────────────────────────────────────────────
        for rev in raw_reviews:
            review = Review(
                venue_id=venue.id,
                reviewer_name=rev.get('author_name', 'Guest'),
                rating=float(rev.get('rating', 4)),
                text=rev.get('text', ''),
                platform='Google',
                review_date=rev.get('relative_time_description', ''),
                helpful_count=0,
                source='google',
            )
            db.session.add(review)

        db.session.commit()
        return True

    except Exception as exc:
        current_app.logger.warning(f"Google Places fetch failed for {venue.name}: {exc}")
        return False
