# Inventory & Order Management System

A full-stack CRUD app for managing products, customers, and orders. Backend is FastAPI, frontend is React, database is PostgreSQL. No auth, no nonsense — just the basics done reasonably well.

## Tech stack

| Layer       | What it uses                                                                       |
|-------------|------------------------------------------------------------------------------------|
| Backend     | Python 3.11, FastAPI, SQLAlchemy (ORM), Pydantic (validation), Uvicorn             |
| Frontend    | React 18, Vite, React Router 6, Axios, react-hot-toast                             |
| Database    | PostgreSQL 15                                                                      |
| Containers  | Docker Compose                                                                     |

---

## Quick start — Docker way

```bash
git clone https://github.com/yourusername/inventory-order-system.git
cd inventory-order-system
docker-compose up --build
```

Once it's all running:

| Service    | URL                      |
|------------|--------------------------|
| Frontend   | http://localhost:3000     |
| Backend    | http://localhost:8000     |
| Swagger    | http://localhost:8000/docs |

On first startup, the backend spawns a background thread that seeds the database with 5 products and 2 customers (but only if the tables are empty, so restarting won't duplicate stuff). The API is available immediately — seeding happens in parallel.

---

## Local development (no Docker)

### Backend

You'll need Python 3.11+ and PostgreSQL running locally with a database called `inventory_db`.

```bash
cd backend
python -m venv venv

# PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env — set DATABASE_URL to point at your local Postgres
uvicorn main:app --reload --port 8000
```

Seed data gets auto-inserted on first startup, but you can also run `python seed.py` manually if you want.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000
npm run dev
```

### Smoke test

1. Open http://localhost:3000 — dashboard shows 5 products, 2 customers, and any orders
2. **Products** — CRUD works, try adding/editing/deleting. Duplicate SKU? Blocked.
3. **Customers** — John Doe and Jane Smith are there. Emails must be unique.
4. **Orders** → **Create Order** — pick a customer, add items, place the order. Stock gets deducted automatically.
5. Try ordering more than available stock — you'll get an error.
6. Total is calculated server-side. The frontend shows a running total for preview, but the backend is the source of truth.

---

## Project structure

```
inventory-order-system/
├── backend/
│   ├── routes/
│   │   ├── products.py           # Product CRUD — SKU uniqueness, negative value checks
│   │   ├── customers.py          # Customer CRUD — email uniqueness
│   │   └── orders.py             # Order creation — stock checks, deduction, total calc
│   ├── main.py                   # FastAPI entry point + background seed thread
│   ├── models.py                 # SQLAlchemy: Product, Customer, Order, OrderItem
│   ├── schemas.py                # Pydantic: request/response models with from_attributes
│   ├── database.py               # SessionLocal, engine, get_db dependency
│   ├── seed.py                   # Seed script (also runs as background thread on startup)
│   ├── requirements.txt          # Includes alembic but no migrations exist (uses create_all)
│   ├── Dockerfile                # python:3.11-slim
│   ├── .env.example
│   └── .env                      (gitignored)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Sidebar.jsx       # Fixed sidebar, collapsible on mobile, nav links
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Stats cards + quick actions + recent orders
│   │   │   ├── Products.jsx      # Table + search + add/edit/delete modals
│   │   │   ├── Customers.jsx     # Table + search + add/edit/delete modals
│   │   │   ├── Orders.jsx        # Order list (item count shows '-' — known bug)
│   │   │   ├── OrderDetail.jsx   # Single order view with items table
│   │   │   └── CreateOrder.jsx   # Customer select + dynamic item rows + place order
│   │   ├── services/
│   │   │   └── api.js            # Axios client, all endpoints
│   │   ├── App.jsx               # Router setup with sidebar + content layout
│   │   ├── App.css               # Full design system — variables, responsive, animations
│   │   └── main.jsx              # BrowserRouter + Toaster wrapper
│   ├── Dockerfile                # Multi-stage: Node build → Nginx serve
│   ├── package.json
│   ├── vite.config.js            # Port 3000, host: true
│   └── index.html
├── docker-compose.yml            # db (Postgres 15 Alpine) + backend + frontend
├── .env.example
└── .gitignore
```

---

## API endpoints

### Products
| Method   | Endpoint                 | Description        |
|----------|--------------------------|--------------------|
| `GET`    | `/api/products/`         | List all products  |
| `GET`    | `/api/products/{id}`     | Get one            |
| `POST`   | `/api/products/`         | Create             |
| `PUT`    | `/api/products/{id}`     | Update             |
| `DELETE` | `/api/products/{id}`     | Delete             |

### Customers
| Method   | Endpoint                  | Description         |
|----------|---------------------------|---------------------|
| `GET`    | `/api/customers/`         | List all customers  |
| `GET`    | `/api/customers/{id}`     | Get one             |
| `POST`   | `/api/customers/`         | Create              |
| `PUT`    | `/api/customers/{id}`     | Update              |
| `DELETE` | `/api/customers/{id}`     | Delete              |

### Orders
| Method   | Endpoint              | Description         |
|----------|-----------------------|---------------------|
| `GET`    | `/api/orders/`        | List all orders     |
| `GET`    | `/api/orders/{id}`    | Get order details   |
| `POST`   | `/api/orders/`        | Create an order     |

### Creating an order

```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ]
}
```

---

## Environment variables

### Backend

| Variable       | Required | Default                                                          |
|----------------|----------|------------------------------------------------------------------|
| `DATABASE_URL` | Yes      | `postgresql://postgres:postgres@db:5432/inventory_db`            |

Connection string patterns:
- **Docker:** `postgresql://postgres:postgres@db:5432/inventory_db`
- **Local:**  `postgresql://postgres:postgres@localhost:5432/inventory_db`
- **Neon:**   `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
- **Render:** `postgresql://user:password@host:5432/dbname`

### Frontend

| Variable       | Required | Default                   |
|----------------|----------|---------------------------|
| `VITE_API_URL` | Yes      | `http://localhost:8000`   |

---

## How orders work (the interesting bit)

1. Validates the customer exists (404 if not)
2. For each item: checks the product exists, then verifies `quantity <= stock`
3. Snapshots the current `unit_price` from the product (so historical orders keep their prices even if prices change later)
4. Pre-calculates subtotals and the order total
5. Uses `db.flush()` to get the order ID before inserting items
6. Deducts stock for each item
7. Commits everything in one transaction

There's a subtle race condition here — between checking stock and deducting it, another request could read the same value. Fine for single-server use, but if you're running this at scale you'd want `SELECT ... FOR UPDATE` or optimistic locking.

Prices are captured at order time in the `order_items` table, not read live from the products table. This means if you change a product's price later, existing orders still show what was actually charged.

---

## Business rules enforced by the backend

| Rule                           | What happens                                      |
|--------------------------------|---------------------------------------------------|
| Duplicate SKU                  | 400 — `"SKU already exists"`                      |
| Duplicate email                | 400 — `"Email already exists"`                    |
| Overselling                    | 400 — `"Insufficient stock"`                      |
| Negative price or stock        | 400 — rejects it                                  |
| Missing customer or product    | 404 — tells you what's missing                    |
| Order not found                | 404 — `"Order not found"`                         |

---

## Seed data

Auto-inserted on first startup (when the products or customers tables are empty):

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

## CSS / design system notes

The frontend has a decent design system built with CSS custom properties. Violet (`#7c3aed`) is the primary color, with a full palette of status colors (emerald, amber, red, indigo, cyan). There's a 6-tier shadow scale, Inter font from Google Fonts, and responsive breakpoints at 768px and 640px.

Minor quirk: the CSS references `--radius`, `--radius-sm`, `--radius-lg`, `--radius-xl` variables that are used but never actually defined in `:root`. They fall through to `initial`, which in practice means `0` — so nothing is rounded except via hardcoded values. Easy fix if you care about rounded corners.

The sidebar is fixed at 240px on desktop, slides off-screen on mobile with a hamburger toggle. Tables transform into card-like layouts on small screens using `data-label` attributes.

---

## Docker commands

```bash
docker-compose up --build        # Build + start
docker-compose up --build -d     # Run in background
docker-compose logs -f           # Watch logs
docker-compose down              # Stop everything
docker-compose down -v           # Stop + wipe database volume
```

The backend waits for Postgres to be healthy before starting (healthcheck via `pg_isready`). Frontend doesn't wait for backend — it'll start immediately and just show errors until the backend is ready.

---

## Deployment

### Option 1: Render (backend) + Vercel (frontend) + Neon (database)

**Database** — Sign up at https://neon.tech, create a project, grab the connection string.

**Backend** — https://render.com → New Web Service:
- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port 8000`
- Env: `DATABASE_URL` = your Neon string

**Frontend** — https://vercel.com → New Project:
- Root directory: `frontend`
- Framework: Vite
- Env: `VITE_API_URL` = your Render backend URL

### Option 2: Railway (all-in-one)

https://railway.app → New Project → Deploy from GitHub. Add a PostgreSQL plugin (Railway auto-injects `DATABASE_URL`). Add backend and frontend as separate services.

### Option 3: Docker on any VM

```bash
git clone <repo>
cd inventory-order-system
export DATABASE_URL=postgresql://user:password@host:5432/dbname
docker-compose up --build -d
```

---

## Things to know / rough edges

- **No authentication** — the API is wide open. Don't put this on the public internet without adding auth.
- **CORS is wide open** (`allow_origins=["*"]`). Fine for dev, lock it down for production.
- **No cascade deletes** — deleting a customer who has orders will give you a foreign key error. Same for products referenced in orders.
- **Alembic is in requirements.txt but there are no migrations** — the project uses `Base.metadata.create_all()` directly. Schema changes mean dropping tables or running manual SQL.
- **`sku` has no max_length validation** in Pydantic — the DB column is `String(100)`, so anything over 100 characters will get truncated or error.
- **Order list shows `-` for item count** — the frontend tries to display `item_count` but the backend doesn't return it. Minor display bug.
- **Duplicate SKU/email and stock errors return nested JSON** (`{"detail": {"message": "..."}}`), but negative value and not-found errors return flat strings (`{"detail": "..."}`). The frontend handles both, but it's inconsistent.
- **Error responses** for duplicate SKU/email use `message` key while other errors use `detail` directly. No real standard here.
- **Phone numbers** are stored as plain strings with no formatting.

---

## What I'd add next

- Auth (JWT or session-based)
- Pagination on lists (the API returns everything right now)
- Proper Alembic migrations
- `SELECT ... FOR UPDATE` on stock checks for safety
- Cascade deletes or soft deletes
- Order status tracking (pending, shipped, etc.)
- File uploads for product images
- Unit tests (there are none right now)

---

*Built with Python, React, and probably too much coffee.*
