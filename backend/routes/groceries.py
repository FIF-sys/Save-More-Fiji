from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, GroceryStore, GroceryItem, GroceryPrice

groceries_bp = Blueprint("groceries", __name__, url_prefix="/api/groceries")


@groceries_bp.route("/stores", methods=["GET"])
def get_stores():
    stores = GroceryStore.query.all()
    return jsonify({"stores": [s.to_dict() for s in stores]}), 200


@groceries_bp.route("/items", methods=["GET"])
def get_items():
    items = GroceryItem.query.all()
    return jsonify({"items": [i.to_dict() for i in items]}), 200


@groceries_bp.route("/prices", methods=["GET"])
def get_prices():
    sort = request.args.get("sort", "cheapest")
    q = request.args.get("q", "").strip()

    query = (
        db.session.query(GroceryPrice, GroceryItem, GroceryStore)
        .join(GroceryItem, GroceryPrice.item_id == GroceryItem.id)
        .join(GroceryStore, GroceryPrice.store_id == GroceryStore.id)
        .filter(GroceryPrice.is_approved == True)
    )

    if q:
        query = query.filter(
            db.or_(
                GroceryItem.name.ilike(f"%{q}%"),
                GroceryStore.name.ilike(f"%{q}%"),
                GroceryItem.category.ilike(f"%{q}%"),
            )
        )

    if sort == "cheapest":
        query = query.order_by(GroceryPrice.price.asc())
    elif sort == "sale":
        query = query.order_by(GroceryPrice.is_on_sale.desc(), GroceryPrice.price.asc())
    elif sort == "store":
        query = query.order_by(GroceryStore.name.asc(), GroceryPrice.price.asc())

    results = query.all()
    prices = []
    for price, item, store in results:
        price_dict = price.to_dict()
        price_dict["item"] = item.to_dict()
        price_dict["store"] = store.to_dict()
        prices.append(price_dict)

    return jsonify({"prices": prices}), 200


@groceries_bp.route("/prices", methods=["POST"])
@jwt_required()
def submit_price():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body is required"}), 400

    item_id = data.get("item_id")
    store_id = data.get("store_id")
    price = data.get("price")
    is_on_sale = data.get("is_on_sale", False)
    original_price = data.get("original_price")

    if not item_id or not store_id or price is None:
        return jsonify({"error": "item_id, store_id, and price are required"}), 400

    item = GroceryItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404

    store = GroceryStore.query.get(store_id)
    if not store:
        return jsonify({"error": "Store not found"}), 404

    grocery_price = GroceryPrice(
        item_id=item_id,
        store_id=store_id,
        price=price,
        is_on_sale=is_on_sale,
        original_price=original_price,
        submitted_by=int(user_id),
        is_approved=False,
    )
    db.session.add(grocery_price)
    db.session.commit()

    return jsonify({"message": "Price submitted for review", "price": grocery_price.to_dict()}), 201
