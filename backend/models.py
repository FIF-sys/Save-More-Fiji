from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    display_name = db.Column(db.String(255), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(10), nullable=False, default="user")
    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "display_name": self.display_name,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class FuelStation(db.Model):
    __tablename__ = "fuel_stations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(500))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    rating = db.Column(db.Float, default=0.0)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    prices = db.relationship("FuelPrice", backref="station", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "address": self.address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "rating": self.rating,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class FuelPrice(db.Model):
    __tablename__ = "fuel_prices"

    id = db.Column(db.Integer, primary_key=True)
    station_id = db.Column(
        db.Integer, db.ForeignKey("fuel_stations.id"), nullable=False
    )
    petrol_price = db.Column(db.Float, nullable=False)
    diesel_price = db.Column(db.Float, nullable=False)
    premium_price = db.Column(db.Float, nullable=True)
    submitted_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    submitted_at = db.Column(db.DateTime, default=utcnow)
    is_approved = db.Column(db.Boolean, default=False)
    approved_at = db.Column(db.DateTime, nullable=True)
    approved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "station_id": self.station_id,
            "petrol_price": self.petrol_price,
            "diesel_price": self.diesel_price,
            "premium_price": self.premium_price,
            "submitted_by": self.submitted_by,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "is_approved": self.is_approved,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "approved_by": self.approved_by,
        }


class GroceryStore(db.Model):
    __tablename__ = "grocery_stores"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(500))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    rating = db.Column(db.Float, default=0.0)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    prices = db.relationship("GroceryPrice", backref="store", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "address": self.address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "rating": self.rating,
            "is_verified": self.is_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class GroceryItem(db.Model):
    __tablename__ = "grocery_items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    unit = db.Column(db.String(50), nullable=False)

    prices = db.relationship("GroceryPrice", backref="item", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "unit": self.unit,
        }


class GroceryPrice(db.Model):
    __tablename__ = "grocery_prices"

    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(
        db.Integer, db.ForeignKey("grocery_items.id"), nullable=False
    )
    store_id = db.Column(
        db.Integer, db.ForeignKey("grocery_stores.id"), nullable=False
    )
    price = db.Column(db.Float, nullable=False)
    is_on_sale = db.Column(db.Boolean, default=False)
    original_price = db.Column(db.Float, nullable=True)
    submitted_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    submitted_at = db.Column(db.DateTime, default=utcnow)
    is_approved = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "item_id": self.item_id,
            "store_id": self.store_id,
            "price": self.price,
            "is_on_sale": self.is_on_sale,
            "original_price": self.original_price,
            "submitted_by": self.submitted_by,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "is_approved": self.is_approved,
        }


class StudentDeal(db.Model):
    __tablename__ = "student_deals"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)  # food/transport/tech/books/phone/other
    provider = db.Column(db.String(255))
    discount = db.Column(db.String(255))
    expiry_date = db.Column(db.DateTime, nullable=True)
    location = db.Column(db.String(255))
    is_verified = db.Column(db.Boolean, default=False)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"))
    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "provider": self.provider,
            "discount": self.discount,
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None,
            "location": self.location,
            "is_verified": self.is_verified,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Budget(db.Model):
    __tablename__ = "budgets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    income = db.Column(db.Float, default=0.0)
    fuel = db.Column(db.Float, default=0.0)
    groceries = db.Column(db.Float, default=0.0)
    rent = db.Column(db.Float, default=0.0)
    bills = db.Column(db.Float, default=0.0)
    transport = db.Column(db.Float, default=0.0)
    entertainment = db.Column(db.Float, default=0.0)
    other = db.Column(db.Float, default=0.0)
    savings_goal = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "income": self.income,
            "fuel": self.fuel,
            "groceries": self.groceries,
            "rent": self.rent,
            "bills": self.bills,
            "transport": self.transport,
            "entertainment": self.entertainment,
            "other": self.other,
            "savings_goal": self.savings_goal,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
