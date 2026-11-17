"""
Seed script for SaveMore Fiji database.
Run with: python seed.py
"""

from app import create_app
from models import db, User, FuelStation, FuelPrice, GroceryStore, GroceryItem, GroceryPrice, StudentDeal


def seed():
    app = create_app()

    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()

        print("Seeding database...")

        # --- Admin user ---
        admin = User(email="admin@savemorefiji.com", display_name="Admin", role="admin")
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.flush()
        admin_id = admin.id
        print(f"  Created admin user: admin@savemorefiji.com / admin123")

        # --- Fuel Stations ---
        stations = [
            FuelStation(
                name="Mobil Walu Bay",
                location="Suva",
                address="Walu Bay, Suva",
                latitude=-18.1292,
                longitude=178.4322,
                rating=4.3,
                is_verified=True,
            ),
            FuelStation(
                name="Z Energy Nasinu",
                location="Nausori/Nasinu",
                address="Kings Road, Nasinu",
                latitude=-18.0413,
                longitude=178.5506,
                rating=4.1,
                is_verified=True,
            ),
            FuelStation(
                name="Mobil Martintar",
                location="Nadi",
                address="Queens Highway, Martintar, Nadi",
                latitude=-17.7817,
                longitude=177.4147,
                rating=4.0,
                is_verified=True,
            ),
            FuelStation(
                name="Viti Petroleum Lautoka",
                location="Lautoka",
                address="Vitogo Parade, Lautoka",
                latitude=-17.6169,
                longitude=177.4505,
                rating=3.9,
                is_verified=False,
            ),
        ]
        db.session.add_all(stations)
        db.session.flush()
        print(f"  Created {len(stations)} fuel stations")

        # --- Fuel Prices ---
        fuel_prices_data = [
            (stations[0].id, 2.89, 2.67, 3.05),  # Walu Bay
            (stations[1].id, 2.85, 2.64, 3.02),  # Nasinu
            (stations[2].id, 2.92, 2.69, 3.08),  # Martintar
            (stations[3].id, 2.88, 2.66, 3.04),  # Lautoka
        ]
        fuel_prices = []
        for station_id, petrol, diesel, premium in fuel_prices_data:
            fp = FuelPrice(
                station_id=station_id,
                petrol_price=petrol,
                diesel_price=diesel,
                premium_price=premium,
                submitted_by=admin_id,
                is_approved=True,
            )
            fuel_prices.append(fp)
        db.session.add_all(fuel_prices)
        print(f"  Created {len(fuel_prices)} fuel prices")

        # --- Grocery Stores ---
        stores = [
            GroceryStore(
                name="MHCC Supermarket",
                location="Suva",
                address="MHCC Building, Victoria Parade, Suva",
                latitude=-18.1416,
                longitude=178.4419,
                rating=4.2,
                is_verified=True,
            ),
            GroceryStore(
                name="RB Patel Nadi",
                location="Nadi",
                address="Main Street, Nadi",
                latitude=-17.7765,
                longitude=177.4150,
                rating=4.1,
                is_verified=True,
            ),
            GroceryStore(
                name="New World IGA Lautoka",
                location="Lautoka",
                address="Vitogo Parade, Lautoka",
                latitude=-17.6150,
                longitude=177.4510,
                rating=4.0,
                is_verified=False,
            ),
        ]
        db.session.add_all(stores)
        db.session.flush()
        print(f"  Created {len(stores)} grocery stores")

        # --- Grocery Items ---
        items = [
            GroceryItem(name="Rice 10kg", category="staples", unit="bag"),
            GroceryItem(name="Milk 1L", category="dairy", unit="bottle"),
            GroceryItem(name="Bread standard loaf", category="bakery", unit="loaf"),
            GroceryItem(name="Eggs 12-pack", category="protein", unit="tray"),
            GroceryItem(name="Sugar 2kg", category="staples", unit="bag"),
        ]
        db.session.add_all(items)
        db.session.flush()
        print(f"  Created {len(items)} grocery items")

        # --- Grocery Prices ---
        grocery_prices = [
            GroceryPrice(
                item_id=items[0].id,  # Rice 10kg
                store_id=stores[0].id,  # MHCC
                price=24.95,
                is_on_sale=True,
                original_price=27.50,
                submitted_by=admin_id,
                is_approved=True,
            ),
            GroceryPrice(
                item_id=items[1].id,  # Milk 1L
                store_id=stores[1].id,  # RB Patel
                price=3.75,
                is_on_sale=False,
                submitted_by=admin_id,
                is_approved=True,
            ),
            GroceryPrice(
                item_id=items[2].id,  # Bread
                store_id=stores[2].id,  # New World
                price=2.25,
                is_on_sale=True,
                original_price=2.60,
                submitted_by=admin_id,
                is_approved=True,
            ),
            GroceryPrice(
                item_id=items[3].id,  # Eggs
                store_id=stores[0].id,  # MHCC
                price=8.90,
                is_on_sale=False,
                submitted_by=admin_id,
                is_approved=True,
            ),
        ]
        db.session.add_all(grocery_prices)
        print(f"  Created {len(grocery_prices)} grocery prices")

        # --- Student Deals ---
        deals = [
            StudentDeal(
                title="Student bus top-up bonus",
                description="Get 5% bonus credit when you top up your bus card as a student.",
                category="transport",
                provider="Fiji Bus Service",
                discount="5% bonus credit",
                location="Suva/Nausori",
                is_verified=True,
                created_by=admin_id,
            ),
            StudentDeal(
                title="Student meal combo discount",
                description="Show your student ID to save up to $2 on selected meal combos.",
                category="food",
                provider="Various restaurants",
                discount="Save up to $2",
                location="Suva/Nadi/Lautoka",
                is_verified=False,
                created_by=admin_id,
            ),
        ]
        db.session.add_all(deals)
        print(f"  Created {len(deals)} student deals")

        db.session.commit()
        print("\nDatabase seeded successfully!")


if __name__ == "__main__":
    seed()
