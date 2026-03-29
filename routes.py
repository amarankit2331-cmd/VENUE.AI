"""Venue routes — search, detail, admin CRUD."""
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime

from app import db
from app.models import Venue, Booking
from app.ml.predict import predict_booking_probability

venues_bp = Blueprint('venues', __name__)


# ── Public ────────────────────────────────────────────────────────────
@venues_bp.route('/')
def index():
    return redirect(url_for('auth.login'))


@venues_bp.route('/search')
@login_required
def search():
    location = request.args.get('location', '').strip()
    capacity = request.args.get('capacity', type=int)
    date_str = request.args.get('date', '').strip()

    query = Venue.query
    if location:
        query = query.filter(Venue.location.ilike(f'%{location}%'))
    if capacity:
        query = query.filter(Venue.capacity >= capacity)

    venues = query.all()

    day_of_week = datetime.today().weekday()
    month       = datetime.today().month
    is_weekend  = 1 if day_of_week >= 5 else 0

    for v in venues:
        v.prediction = predict_booking_probability({
            'venue_id': v.id, 'day_of_week': day_of_week, 'month': month,
            'capacity': v.capacity, 'price': v.price_per_hour,
            'is_weekend': is_weekend, 'location_score': hash(v.location) % 10 + 1,
        })

    return render_template('search.html', venues=venues,
                           location=location, capacity=capacity, date=date_str)


@venues_bp.route('/venue/<int:venue_id>')
@login_required
def venue_detail(venue_id):
    venue    = db.get_or_404(Venue, venue_id)
    date_str = request.args.get('date', '')

    # Try to fetch live Google reviews (cached after first fetch)
    try:
        from app.venues.google_places import fetch_and_cache_reviews
        fetch_and_cache_reviews(venue)
        # Refresh relationship after potential new inserts
        db.session.refresh(venue)
    except Exception:
        pass

    bookings = []
    if date_str:
        try:
            event_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            bookings = Booking.query.filter_by(
                venue_id=venue_id, event_date=event_date, status='confirmed'
            ).all()
        except ValueError:
            pass

    day_of_week = datetime.today().weekday()
    month       = datetime.today().month
    is_weekend  = 1 if day_of_week >= 5 else 0
    prediction  = predict_booking_probability({
        'venue_id': venue.id, 'day_of_week': day_of_week, 'month': month,
        'capacity': venue.capacity, 'price': venue.price_per_hour,
        'is_weekend': is_weekend, 'location_score': hash(venue.location) % 10 + 1,
    })

    return render_template(
        'booking.html',
        venue=venue,
        images=venue.images,
        reviews=venue.reviews,
        discounts=[d for d in venue.discounts if d.is_active],
        bookings=bookings,
        date=date_str,
        prediction=prediction,
    )


# ── Admin CRUD ────────────────────────────────────────────────────────
@venues_bp.route('/admin/dashboard')
@login_required
def admin_dashboard():
    if not current_user.is_admin:
        flash('Admin access required.', 'danger')
        return redirect(url_for('venues.search'))
    venues   = Venue.query.all()
    bookings = Booking.query.order_by(Booking.created_at.desc()).limit(20).all()
    return render_template('admin_dashboard.html', venues=venues, bookings=bookings)


@venues_bp.route('/admin/venues', methods=['POST'])
@login_required
def add_venue():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    venue = Venue(
        name=request.form['name'],
        location=request.form['location'],
        capacity=int(request.form['capacity']),
        price_per_hour=float(request.form['price_per_hour']),
        amenities=request.form.get('amenities', ''),
        image_url=request.form.get('image_url', '/static/images/default_venue.jpg'),
    )
    db.session.add(venue)
    db.session.commit()
    flash('Venue added successfully!', 'success')
    return redirect(url_for('venues.admin_dashboard'))


@venues_bp.route('/admin/venues/<int:venue_id>/edit', methods=['POST'])
@login_required
def edit_venue(venue_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    venue = db.get_or_404(Venue, venue_id)
    venue.name           = request.form['name']
    venue.location       = request.form['location']
    venue.capacity       = int(request.form['capacity'])
    venue.price_per_hour = float(request.form['price_per_hour'])
    venue.amenities      = request.form.get('amenities', '')
    venue.image_url      = request.form.get('image_url', venue.image_url)
    db.session.commit()
    flash('Venue updated!', 'success')
    return redirect(url_for('venues.admin_dashboard'))


@venues_bp.route('/admin/venues/<int:venue_id>/delete', methods=['POST'])
@login_required
def delete_venue(venue_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403
    venue = db.get_or_404(Venue, venue_id)
    db.session.delete(venue)
    db.session.commit()
    flash('Venue deleted!', 'success')
    return redirect(url_for('venues.admin_dashboard'))
