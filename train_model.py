"""Train a Random Forest model on sample booking data."""
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'sample_data.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'booking_model.pkl')


def generate_sample_data():
    """Create synthetic training data if CSV does not exist."""
    import numpy as np
    np.random.seed(42)

    n = 500
    data = {
        'venue_id': np.random.randint(1, 6, n),
        'day_of_week': np.random.randint(0, 7, n),
        'month': np.random.randint(1, 13, n),
        'capacity': np.random.choice([150, 200, 300, 400, 500], n),
        'price': np.random.choice([120, 180, 200, 220, 250], n),
        'is_weekend': np.random.randint(0, 2, n),
        'location_score': np.random.randint(1, 11, n),
    }
    df = pd.DataFrame(data)

    # Generate target: higher probability of booking for weekends, lower price,
    # higher location score, and certain months (wedding season etc.)
    score = (
        df['is_weekend'] * 2
        + (df['location_score'] / 2)
        + (df['month'].isin([3, 4, 5, 10, 11, 12])).astype(int) * 2
        - (df['price'] / 100)
        + np.random.normal(0, 1, n)
    )
    df['booked'] = (score > 2.5).astype(int)
    df.to_csv(DATA_PATH, index=False)
    print(f"Generated {n} sample records -> {DATA_PATH}")
    return df


def train():
    if os.path.exists(DATA_PATH):
        df = pd.read_csv(DATA_PATH)
    else:
        df = generate_sample_data()

    features = ['venue_id', 'day_of_week', 'month', 'capacity', 'price',
                'is_weekend', 'location_score']
    X = df[features]
    y = df['booked']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nModel Accuracy: {acc:.2%}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    joblib.dump(model, MODEL_PATH)
    print(f"\nModel saved -> {MODEL_PATH}")


if __name__ == '__main__':
    train()
