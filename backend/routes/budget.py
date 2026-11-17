from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Budget

budget_bp = Blueprint("budget", __name__, url_prefix="/api/budget")


@budget_bp.route("", methods=["GET"])
@jwt_required()
def get_budgets():
    user_id = get_jwt_identity()
    budgets = Budget.query.filter_by(user_id=int(user_id)).order_by(Budget.created_at.desc()).all()
    return jsonify({"budgets": [b.to_dict() for b in budgets]}), 200


@budget_bp.route("", methods=["POST"])
@jwt_required()
def save_budget():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    budget = Budget(
        user_id=int(user_id),
        income=data.get("income", 0.0),
        fuel=data.get("fuel", 0.0),
        groceries=data.get("groceries", 0.0),
        rent=data.get("rent", 0.0),
        bills=data.get("bills", 0.0),
        transport=data.get("transport", 0.0),
        entertainment=data.get("entertainment", 0.0),
        other=data.get("other", 0.0),
        savings_goal=data.get("savings_goal", 0.0),
    )
    db.session.add(budget)
    db.session.commit()

    return jsonify({"message": "Budget saved", "budget": budget.to_dict()}), 201
