from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, StudentDeal

deals_bp = Blueprint("deals", __name__, url_prefix="/api/deals")


@deals_bp.route("", methods=["GET"])
def get_deals():
    category = request.args.get("category", "").strip()
    q = request.args.get("q", "").strip()

    query = StudentDeal.query

    if category:
        query = query.filter(StudentDeal.category == category)

    if q:
        query = query.filter(
            db.or_(
                StudentDeal.title.ilike(f"%{q}%"),
                StudentDeal.description.ilike(f"%{q}%"),
                StudentDeal.provider.ilike(f"%{q}%"),
                StudentDeal.location.ilike(f"%{q}%"),
            )
        )

    deals = query.order_by(StudentDeal.created_at.desc()).all()
    return jsonify({"deals": [d.to_dict() for d in deals]}), 200


@deals_bp.route("", methods=["POST"])
@jwt_required()
def create_deal():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    title = data.get("title")
    category = data.get("category")

    if not title or not category:
        return jsonify({"error": "Title and category are required"}), 400

    valid_categories = ["food", "transport", "tech", "books", "phone", "other"]
    if category not in valid_categories:
        return jsonify({"error": f"Category must be one of: {', '.join(valid_categories)}"}), 400

    deal = StudentDeal(
        title=title,
        description=data.get("description"),
        category=category,
        provider=data.get("provider"),
        discount=data.get("discount"),
        location=data.get("location"),
        is_verified=False,
        created_by=int(user_id),
    )

    expiry = data.get("expiry_date")
    if expiry:
        from datetime import datetime
        try:
            deal.expiry_date = datetime.fromisoformat(expiry)
        except ValueError:
            return jsonify({"error": "Invalid expiry_date format. Use ISO 8601."}), 400

    db.session.add(deal)
    db.session.commit()

    return jsonify({"message": "Deal created", "deal": deal.to_dict()}), 201
