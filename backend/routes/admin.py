from functools import wraps
from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, FuelPrice, GroceryPrice

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        if not user or user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper


@admin_bp.route("/submissions", methods=["GET"])
@admin_required
def get_submissions():
    fuel_prices = FuelPrice.query.filter_by(is_approved=False).all()
    grocery_prices = GroceryPrice.query.filter_by(is_approved=False).all()

    return jsonify({
        "fuel_prices": [fp.to_dict() for fp in fuel_prices],
        "grocery_prices": [gp.to_dict() for gp in grocery_prices],
    }), 200


@admin_bp.route("/submissions/<string:submission_type>/<int:submission_id>/approve", methods=["POST"])
@admin_required
def approve_submission(submission_type, submission_id):
    user_id = get_jwt_identity()

    if submission_type == "fuel":
        submission = FuelPrice.query.get(submission_id)
        if not submission:
            return jsonify({"error": "Fuel price submission not found"}), 404
        submission.is_approved = True
        submission.approved_at = datetime.now(timezone.utc)
        submission.approved_by = int(user_id)
    elif submission_type == "grocery":
        submission = GroceryPrice.query.get(submission_id)
        if not submission:
            return jsonify({"error": "Grocery price submission not found"}), 404
        submission.is_approved = True
    else:
        return jsonify({"error": "Invalid submission type. Use 'fuel' or 'grocery'."}), 400

    db.session.commit()
    return jsonify({"message": f"{submission_type.capitalize()} price approved"}), 200


@admin_bp.route("/submissions/<string:submission_type>/<int:submission_id>/reject", methods=["POST"])
@admin_required
def reject_submission(submission_type, submission_id):
    if submission_type == "fuel":
        submission = FuelPrice.query.get(submission_id)
        if not submission:
            return jsonify({"error": "Fuel price submission not found"}), 404
    elif submission_type == "grocery":
        submission = GroceryPrice.query.get(submission_id)
        if not submission:
            return jsonify({"error": "Grocery price submission not found"}), 404
    else:
        return jsonify({"error": "Invalid submission type. Use 'fuel' or 'grocery'."}), 400

    db.session.delete(submission)
    db.session.commit()
    return jsonify({"message": f"{submission_type.capitalize()} price rejected and removed"}), 200
