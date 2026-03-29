"""Load trained model and predict booking probability."""
import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'booking_model.pkl')

_model = None


def _load_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            _model = None
    return _model


def predict_booking_probability(features: dict) -> int:
    """Return predicted booking probability as an integer 0-100.

    Parameters
    ----------
    features : dict
        Keys: venue_id, day_of_week, month, capacity, price, is_weekend, location_score
    """
    model = _load_model()
    if model is None:
        return 50  # Default when model not trained yet

    feature_order = ['venue_id', 'day_of_week', 'month', 'capacity', 'price',
                     'is_weekend', 'location_score']
    X = pd.DataFrame([[features.get(f, 0) for f in feature_order]], columns=feature_order)

    try:
        proba = model.predict_proba(X)[0][1]  # probability of class 1 (booked)
        return int(round(proba * 100))
    except Exception:
        return 50
