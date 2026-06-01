# Inventory & Order Management System

Full-stack CRUD app for products, customers, and orders. FastAPI + React + PostgreSQL. No auth.

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
│   │   ├── App.jsx            # Router
│   │   ├── App.css            # Full design system
│   │   └── main.jsx           # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile             # Multi-stage: Node build → Nginx
│   └── .env.example
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## API

### Products
| Method   | Endpoint                 | Description        |
|----------|--------------------------|--------------------|
| `GET`    | `/api/products/`         | List all           |
| `GET`    | `/api/products/{id}`     | Get by ID          |
| `POST`   | `/api/products/`         | Create             |
| `PUT`    | `/api/products/{id}`     | Update             |
| `DELETE` | `/api/products/{id}`     | Delete             |

### Customers
| Method   | Endpoint                  | Description         |
|----------|---------------------------|---------------------|
| `GET`    | `/api/customers/`         | List all            |
| `GET`    | `/api/customers/{id}`     | Get by ID           |
| `POST`   | `/api/customers/`         | Create              |
| `PUT`    | `/api/customers/{id}`     | Update              |
| `DELETE` | `/api/customers/{id}`     | Delete              |

### Orders
| Method   | Endpoint              | Description         |
|----------|-----------------------|---------------------|
| `GET`    | `/api/orders/`        | List all            |
| `GET`    | `/api/orders/{id}`    | Get details         |
| `POST`   | `/api/orders/`        | Create              |

### Create order request

```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 }
  ]
}
```

---

## Business rules

| Rule                           | Response                                           |
|--------------------------------|----------------------------------------------------|
| Duplicate SKU                  | 400 — `"SKU already exists"`                       |
| Duplicate email                | 400 — `"Email already exists"`                     |
| Insufficient stock             | 400 — `"Insufficient stock"`                       |
| Negative price/stock           | 400 — rejected                                     |
| Customer/product not found     | 404                                                |
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

## Docker commands

```bash
docker-compose up --build          # Build + start
docker-compose up --build -d       # Background
docker-compose logs -f             # Tail logs
docker-compose down                # Stop
docker-compose down -v             # Stop + wipe database
```

Backend waits for Postgres healthcheck before starting. Frontend starts immediately and shows errors until backend is ready.

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
