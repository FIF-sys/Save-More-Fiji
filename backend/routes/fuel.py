from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, FuelStation, FuelPrice

fuel_bp = Blueprint("fuel", __name__, url_prefix="/api/fuel")


@fuel_bp.route("/stations", methods=["GET"])
def get_stations():
    stations = FuelStation.query.all()
    return jsonify({"stations": [s.to_dict() for s in stations]}), 200


@fuel_bp.route("/prices", methods=["GET"])
def get_prices():
    sort = request.args.get("sort", "cheapest")
    q = request.args.get("q", "").strip()

    query = (
        db.session.query(FuelPrice, FuelStation)
        .join(FuelStation, FuelPrice.station_id == FuelStation.id)
        .filter(FuelPrice.is_approved == True)
    )

    if q:
        query = query.filter(
            db.or_(
                FuelStation.name.ilike(f"%{q}%"),
                FuelStation.location.ilike(f"%{q}%"),
            )
        )

    if sort == "cheapest":
        query = query.order_by(FuelPrice.petrol_price.asc())
    elif sort == "highest":
        query = query.order_by(FuelPrice.petrol_price.desc())
    elif sort == "rating":
        query = query.order_by(FuelStation.rating.desc())

    results = query.all()
    prices = []
    for price, station in results:
        price_dict = price.to_dict()
        price_dict["station"] = station.to_dict()
        prices.append(price_dict)

    return jsonify({"prices": prices}), 200


@fuel_bp.route("/prices", methods=["POST"])
@jwt_required()
def submit_price():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    station_id = data.get("station_id")
    petrol_price = data.get("petrol_price")
    diesel_price = data.get("diesel_price")
    premium_price = data.get("premium_price")

    if not station_id or petrol_price is None or diesel_price is None:
        return jsonify({"error": "station_id, petrol_price, and diesel_price are required"}), 400

    station = FuelStation.query.get(station_id)
    if not station:
        return jsonify({"error": "Station not found"}), 404

    fuel_price = FuelPrice(
        station_id=station_id,
        petrol_price=petrol_price,
        diesel_price=diesel_price,
        premium_price=premium_price,
        submitted_by=int(user_id),
        is_approved=False,
    )
    db.session.add(fuel_price)
    db.session.commit()

    return jsonify({"message": "Price submitted for review", "price": fuel_price.to_dict()}), 201
