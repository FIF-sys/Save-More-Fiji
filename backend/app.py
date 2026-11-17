import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app, origins=Config.CORS_ORIGINS.split(","))
    db.init_app(app)
    JWTManager(app)

    # Root informational route
    @app.route("/")
    def index():
        return jsonify({
            "name": "SaveMore Fiji API",
            "status": "online",
            "version": "1.0.0",
            "frontend_url": "http://localhost:5173",
            "message": "Welcome to SaveMore Fiji API. The visual website runs on http://localhost:5173",
            "endpoints": {
                "fuel_prices": "/api/fuel/prices",
                "fuel_stations": "/api/fuel/stations",
                "grocery_prices": "/api/groceries/prices",
                "student_deals": "/api/deals",
                "auth_login": "/api/auth/login",
                "auth_register": "/api/auth/register",
                "budget": "/api/budget"
            }
        }), 200

    # Register blueprints
    from routes.auth import auth_bp
    from routes.fuel import fuel_bp
    from routes.groceries import groceries_bp
    from routes.deals import deals_bp
    from routes.budget import budget_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(fuel_bp)
    app.register_blueprint(groceries_bp)
    app.register_blueprint(deals_bp)
    app.register_blueprint(budget_bp)
    app.register_blueprint(admin_bp)

    # Create database tables on first run
    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app()
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    port = int(os.getenv("PORT", 5001))
    print(f"\n=======================================================")
    print(f" SaveMore Fiji API running on http://localhost:{port}")
    print(f" React Frontend is at http://localhost:5173")
    print(f"=======================================================\n")
    app.run(host="0.0.0.0", port=port, debug=debug)
