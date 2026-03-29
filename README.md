# 🏛️ VenueAI — AI-Powered Venue Booking System

A full-stack web application for searching, booking, and managing function hall / venue reservations with ML-powered demand prediction.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python Flask, SQLAlchemy, Flask-Login |
| Database | MySQL (PyMySQL driver) |
| Frontend | Jinja2, HTML, CSS (dark theme), vanilla JS |
| ML | Scikit-learn RandomForest, pandas, NumPy |
| Notifications | In-app (DB-backed), optional Flask-Mail |

## Quick Start

### 1. Prerequisites
- Python 3.10+
- MySQL 8.0+ running locally

### 2. Create MySQL Database

```sql
-- Open MySQL Shell and run:
CREATE DATABASE IF NOT EXISTS venue_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or run the full schema:

```bash
mysql -u root -p < schema.sql
```

### 3. Update Database Password

Edit `app/config.py` and set your MySQL root password:

```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:YOUR_PASSWORD@localhost/venue_booking'
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Train the ML Model

```bash
python -m app.ml.train_model
```

This generates 500 synthetic records, trains a RandomForest model, and saves `booking_model.pkl`.

### 6. Create Admin User

The app auto-creates tables via SQLAlchemy. Register via the UI and then flip `is_admin` in MySQL:

```sql
UPDATE users SET is_admin = 1 WHERE username = 'your_username';
```

### 7. Run the Server

```bash
python run.py
```

Open **http://localhost:5000** in your browser.

## Features

- **User auth** — Register, login, logout with session management
- **Venue search** — Filter by location, capacity, date
- **AI predictions** — ML model shows booking demand probability on each venue card
- **Smart booking** — Time-overlap prevention prevents double bookings
- **My Bookings** — View history, cancel bookings
- **Admin dashboard** — Add / edit / delete venues, view all bookings
- **Notifications** — In-app alerts for booking confirmations and cancellations

## Project Structure

```
├── app/
│   ├── __init__.py          # App factory
│   ├── config.py            # Configuration
│   ├── models.py            # ORM models
│   ├── auth/routes.py       # Auth endpoints
│   ├── venues/routes.py     # Venue CRUD + search
│   ├── bookings/routes.py   # Booking logic
│   ├── notifications/routes.py
│   ├── ml/
│   │   ├── train_model.py   # Train ML model
│   │   ├── predict.py       # Predict booking probability
│   │   └── sample_data.csv  # Generated training data
│   └── static/
│       ├── css/style.css
│       └── js/app.js
├── templates/               # Jinja2 HTML pages
├── schema.sql               # MySQL DDL + seed data
├── requirements.txt
├── run.py                   # Entry point
└── README.md
```
