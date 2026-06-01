# Inventory & Order Management System

Full-stack CRUD app for managing products, customers, and orders. FastAPI + React + PostgreSQL. No auth.

## Features

- Product management (name, SKU, price, stock quantity)
- Customer management (name, email, phone)
- Order creation with line items and automatic stock deduction
- Server-side total calculation and price snapshotting
- Seed data on first startup (background thread)
- Responsive UI with CSS custom property design system
- Docker Compose for one-command setup
- Swagger docs at `/docs`

## Tech stack

| Layer       | Technology                                                  |
|-------------|-------------------------------------------------------------|
| Backend     | Python 3.11, FastAPI, SQLAlchemy, Pydantic, Uvicorn         |
| Frontend    | React 18, Vite, React Router 6, Axios, react-hot-toast     |
| Database    | PostgreSQL 15                                               |
| Containers  | Docker Compose                                              |

---

## Quick start (Docker)

```bash
git clone https://github.com/yourusername/inventory-order-system.git
cd inventory-order-system
docker-compose up --build
```

| Service    | URL                      |
|------------|--------------------------|
| Frontend   | http://localhost:3000     |
| Backend    | http://localhost:8000     |
| Swagger    | http://localhost:8000/docs |

On first startup a background thread seeds 5 products and 2 customers (only if tables are empty). API is available immediately.

---

## Local development

### Backend

Requires Python 3.11+ and PostgreSQL with a database named `inventory_db`.

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1    # PowerShell
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
# Edit .env — set DATABASE_URL to your local Postgres
uvicorn main:app --reload --port 8000
```

### Frontend

Requires Node.js 18+.

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000
npm run dev
```

### Smoke test

1. Dashboard at http://localhost:3000 shows 5 products, 2 customers, and orders
2. **Products** — CRUD works. Duplicate SKUs rejected
3. **Customers** — John Doe and Jane Smith. Duplicate emails rejected
4. **Orders** → **Create Order** — select customer, add items, place order. Stock deducted automatically
5. Ordering more than available stock returns an error
6. Total is calculated server-side

---

## Project structure

```
inventory-order-system/
├── backend/
│   ├── routes/
│   │   ├── products.py        # Product CRUD
│   │   ├── customers.py       # Customer CRUD
│   │   └── orders.py          # Order creation + stock deduction
│   ├── main.py                # FastAPI entry + background seed thread
│   ├── models.py              # SQLAlchemy models
│   ├── schemas.py             # Pydantic schemas
│   ├── database.py            # DB connection + session
│   ├── seed.py                # Seed data (also runs on startup)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   └── CreateOrder.jsx
│   │   ├── services/
│   │   │   └── api.js         # Axios client
│   │   ├── App.jsx            # Router + layout
│   │   ├── App.css            # Design system, responsive, animations
│   │   └── main.jsx           # Entry point
│   ├── Dockerfile             # Multi-stage: Node build → Nginx
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## Database models

### `products`
| Column          | Type          | Constraints               |
|-----------------|---------------|---------------------------|
| `id`            | Integer       | PK, indexed               |
| `name`          | String(255)   | NOT NULL                  |
| `sku`           | String(100)   | UNIQUE, NOT NULL, indexed |
| `price`         | Float         | NOT NULL                  |
| `stock_quantity`| Integer       | NOT NULL, default 0       |
| `created_at`    | DateTime      | auto                       |
| `updated_at`    | DateTime      | auto                       |

### `customers`
| Column       | Type          | Constraints               |
|--------------|---------------|---------------------------|
| `id`         | Integer       | PK, indexed               |
| `name`       | String(255)   | NOT NULL                  |
| `email`      | String(255)   | UNIQUE, NOT NULL, indexed |
| `phone`      | String(50)    | nullable                  |
| `created_at` | DateTime      | auto                       |
| `updated_at` | DateTime      | auto                       |

### `orders`
| Column         | Type      | Constraints                              |
|----------------|-----------|------------------------------------------|
| `id`           | Integer   | PK, indexed                              |
| `customer_id`  | Integer   | FK → customers.id, NOT NULL              |
| `total_amount` | Float     | NOT NULL, default 0.0                    |
| `created_at`   | DateTime  | auto                                     |

### `order_items`
| Column       | Type      | Constraints                   |
|--------------|-----------|-------------------------------|
| `id`         | Integer   | PK, indexed                   |
| `order_id`   | Integer   | FK → orders.id, NOT NULL      |
| `product_id` | Integer   | FK → products.id, NOT NULL    |
| `quantity`   | Integer   | NOT NULL                      |
| `unit_price` | Float     | NOT NULL (snapshotted)        |
| `subtotal`   | Float     | NOT NULL                      |

No cascade deletes are configured.

---

## API

### Products

**Request schemas:**
- POST `/api/products/` — `{"name": string, "sku": string, "price": float, "stock_quantity": int}`
- PUT `/api/products/{id}` — same fields, all optional

**Response:** `{"id": int, "name": string, "sku": string, "price": float, "stock_quantity": int, "created_at": datetime, "updated_at": datetime}`

| Method   | Endpoint                 | Status codes     |
|----------|--------------------------|------------------|
| `GET`    | `/api/products/`         | 200              |
| `GET`    | `/api/products/{id}`     | 200, 404         |
| `POST`   | `/api/products/`         | 201, 400, 422    |
| `PUT`    | `/api/products/{id}`     | 200, 400, 404    |
| `DELETE` | `/api/products/{id}`     | 204, 404         |

### Customers

**Request schemas:**
- POST `/api/customers/` — `{"name": string, "email": string, "phone": string | null}`
- PUT `/api/customers/{id}` — same fields, all optional

**Response:** `{"id": int, "name": string, "email": string, "phone": string | null, "created_at": datetime, "updated_at": datetime}`

| Method   | Endpoint                  | Status codes     |
|----------|---------------------------|------------------|
| `GET`    | `/api/customers/`         | 200              |
| `GET`    | `/api/customers/{id}`     | 200, 404         |
| `POST`   | `/api/customers/`         | 201, 400, 422    |
| `PUT`    | `/api/customers/{id}`     | 200, 400, 404    |
| `DELETE` | `/api/customers/{id}`     | 204, 404         |

### Orders

**POST request:** `{"customer_id": int, "items": [{"product_id": int, "quantity": int}]}`
**POST response:** `{"id": int, "customer_id": int, "total_amount": float, "items": [{"product_name": string, "quantity": int, "unit_price": float, "subtotal": float}]}`
**GET /api/orders/ response:** `[{"id": int, "customer_id": int, "customer_name": string, "total_amount": float, "created_at": datetime}]`
**GET /api/orders/{id} response:** same as POST response

| Method   | Endpoint              | Status codes        |
|----------|-----------------------|---------------------|
| `GET`    | `/api/orders/`        | 200                 |
| `GET`    | `/api/orders/{id}`    | 200, 404            |
| `POST`   | `/api/orders/`        | 201, 400, 404, 422  |

---

## Business rules

| Rule                           | Response                                           |
|--------------------------------|----------------------------------------------------|
| Duplicate SKU                  | 400 — `"SKU already exists"`                       |
| Duplicate email                | 400 — `"Email already exists"`                     |
| Insufficient stock             | 400 — `"Insufficient stock"`                       |
| Negative price or stock        | 400 — rejected                                     |
| Customer or product not found  | 404                                                |
| Order not found                | 404 — `"Order not found"`                          |

### Order creation flow

1. Validates customer exists
2. For each item: validates product exists, checks `quantity <= stock`
3. Snapshots `unit_price` from product (historical prices preserved)
4. Calculates subtotals and total
5. Uses `db.flush()` to get order ID, then inserts items
6. Deducts stock
7. Commits in one transaction

There is a race condition in the stock check — no `SELECT ... FOR UPDATE` or optimistic locking is used.

### Frontend validation

- **Product form:** name and SKU required (non-whitespace), price and stock >= 0
- **Customer form:** name required, email must match `^[^\s@]+@[^\s@]+\.[^\s@]+$`, phone optional
- **Order form:** customer required, at least one item, quantity >= 1, quantity cannot exceed stock

---

## Environment variables

### Backend

| Variable       | Required | Default                                                          |
|----------------|----------|------------------------------------------------------------------|
| `DATABASE_URL` | Yes      | `postgresql://postgres:postgres@db:5432/inventory_db`            |

### Frontend

| Variable       | Required | Default                   |
|----------------|----------|---------------------------|
| `VITE_API_URL` | Yes      | `http://localhost:8000`   |

---

## Docker

```bash
docker-compose up --build          # Build + start
docker-compose up --build -d       # Background
docker-compose logs -f             # Tail logs
docker-compose down                # Stop
docker-compose down -v             # Stop + wipe database
```

Backend waits for Postgres healthcheck (`pg_isready`) before starting. Frontend starts immediately — shows errors until backend is ready.

| Service  | Dockerfile              | Base Image           | Port  |
|----------|-------------------------|----------------------|-------|
| `db`     | official                | postgres:15-alpine   | 5432  |
| `backend`| `backend/Dockerfile`    | python:3.11-slim     | 8000  |
| `frontend`| `frontend/Dockerfile`  | node:18-alpine → nginx:alpine | 3000 → 80 |

---

## Seed data

Inserted automatically on first startup (when tables are empty).

### Products
| Name        | SKU    | Price  | Stock |
|-------------|--------|--------|-------|
| Keyboard    | KB-001 | $100   | 50    |
| Mouse       | MS-001 | $50    | 100   |
| Monitor     | MN-001 | $300   | 30    |
| Laptop      | LP-001 | $1000  | 20    |
| Headphones  | HP-001 | $80    | 75    |

### Customers
| Name        | Email              | Phone      |
|-------------|--------------------|------------|
| John Doe    | john@example.com   | 1234567890 |
| Jane Smith  | jane@example.com   | 9876543210 |

---

## Frontend design

- CSS custom property design system with full color palette (violet primary, status colors)
- Inter font from Google Fonts, 6-tier shadow scale
- Responsive: sidebar collapses on mobile, tables become card layouts via `data-label`
- Components: sidebar, dashboard, CRUD pages with search + modals, order creation form
- Toast notifications for errors and success

---

## Deployment

### Render (backend) + Vercel (frontend) + Neon (database)

**Database** — https://neon.tech → create project → copy connection string.

**Backend** — https://render.com → New Web Service:
- Root: `backend`, Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port 8000`
- Env: `DATABASE_URL` = Neon string

**Frontend** — https://vercel.com → New Project:
- Root: `frontend`, Framework: Vite
- Env: `VITE_API_URL` = Render backend URL

### Railway (all-in-one)

https://railway.app → New Project → Deploy from GitHub. Add PostgreSQL plugin. Add backend + frontend as services.

### Docker on any VM

```bash
git clone <repo>
cd inventory-order-system
export DATABASE_URL=postgresql://user:password@host:5432/dbname
docker-compose up --build -d
```

---

## Known issues

- **No auth** — API has no access controls
- **CORS wide open** — `allow_origins=["*"]`
- **No cascade deletes** — deleting a customer with orders causes a foreign key error
- **Alembic listed but no migrations** — uses `create_all()` directly
- **Order list shows `-` for item count** — backend doesn't return `item_count`
- **Inconsistent error shapes** — some errors return `{"detail": {"message": "..."}}`, others `{"detail": "..."}`
- **Race condition on stock check** — no locking between verification and deduction
- **`sku` has no max_length validation in Pydantic** — DB column is `String(100)`
- **Phone numbers stored as plain strings** — no formatting
- **CSS radius variables referenced but never defined** — `--radius`, `--radius-sm`, etc. are not in `:root`

---

*Built with Python, React, and coffee.*
