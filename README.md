# SaveMore Fiji &mdash; Hyperlocal Financial Savings Platform

SaveMore Fiji is a mobile-first financial price comparison and budgeting web platform built specifically for Fiji residents, families, and students. It tracks fuel prices, supermarket groceries, and student discounts across major centers (Suva, Nausori, Nadi, Lautoka), and includes a budget calculator in Fijian Dollars (FJD).

---

## Architecture Overview

The project is structured into two clean standalone directories:

```
savemore-fiji/
├── backend/          # Python (Flask + SQLAlchemy + JWT) REST API
│   ├── app.py        # Flask application entry point
│   ├── models.py     # Database schema (User, Fuel, Grocery, Deals, Budget)
│   ├── config.py     # Configuration & environment variables
│   ├── seed.py       # Fiji sample dataset & default admin seeder
│   ├── requirements.txt
│   └── routes/       # API endpoints (auth, fuel, groceries, deals, budget, admin)
├── frontend/         # React (JavaScript) + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/ # Minimal, professional UI components
│   │   ├── pages/      # Route pages (Home, Fuel, Grocery, Deals, Budget, Admin)
│   │   ├── api.js      # Backend API fetch client with JWT management
│   │   └── auth.jsx    # Authentication context & state
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## Visual Design Philosophy

- **Professional & Clean:** Plain white surfaces, subtle neutral-200 borders, high-contrast black/neutral typography.
- **No AI Aesthetic:** No heavy rainbow color gradients, no dark-mode neon glows, and no emojis used as interface buttons or icons.
- **Mobile-Responsive:** Built with system-native fonts and low data consumption suited for Pacific mobile networks.

---

## Getting Started

### 1. Backend Setup (Python)

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with Fiji locations, prices, and default admin
python seed.py

# Start the Flask API server (runs on http://localhost:5001)
python app.py
```

#### Default Administrator Account:
- **Email:** `admin@savemorefiji.com`
- **Password:** `admin123`

---

### 2. Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Run the Vite local development server (runs on http://localhost:5173)
npm run dev
```

The frontend Vite server automatically proxies requests from `/api/*` to the Python Flask backend at `http://localhost:5001`.

---

## API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` &mdash; Create user account (returns JWT)
- `POST /api/auth/login` &mdash; Authenticate user (returns JWT)
- `GET /api/auth/me` &mdash; Current user profile (Bearer token required)

### Fuel Tracker (`/api/fuel`)
- `GET /api/fuel/stations` &mdash; List service stations in Fiji
- `GET /api/fuel/prices?sort=cheapest|highest|rating&q=` &mdash; Query verified fuel rates
- `POST /api/fuel/prices` &mdash; Submit price update for moderation

### Grocery Tracker (`/api/groceries`)
- `GET /api/groceries/stores` &mdash; List supermarkets (MHCC, RB Patel, New World)
- `GET /api/groceries/items` &mdash; List tracked staple grocery goods
- `GET /api/groceries/prices?sort=sale|cheapest|store&q=` &mdash; Query prices and sale items
- `POST /api/groceries/prices` &mdash; Submit grocery price update

### Student Deals (`/api/deals`)
- `GET /api/deals?category=&q=` &mdash; Query verified and community discounts
- `POST /api/deals` &mdash; Post a new student deal

### Budget Tool (`/api/budget`)
- `GET /api/budget` &mdash; Retrieve user's saved monthly budgets
- `POST /api/budget` &mdash; Save a new monthly cash flow plan

### Admin Moderation (`/api/admin`)
- `GET /api/admin/submissions` &mdash; List unapproved user contributions
- `POST /api/admin/submissions/<type>/<id>/approve` &mdash; Approve and publish
- `POST /api/admin/submissions/<type>/<id>/reject` &mdash; Reject and remove

---

## Future Enhancements
- Geolocation distance calculation from current GPS position to nearest service station
- Push alerts for government regulated monthly fuel price reviews
- Export monthly budget plan as printable PDF statement
