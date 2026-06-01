# Inventory & Order Management System

A full-stack web application for managing products, customers, and orders. Built with FastAPI, React, and PostgreSQL.

## Tech Stack

| Layer       | Technology                                                    |
|-------------|---------------------------------------------------------------|
| Backend     | Python 3.11, FastAPI, SQLAlchemy, Pydantic, Alembic, Uvicorn |
| Frontend    | React 18, Vite, React Router 6, Axios, react-hot-toast       |
| Database    | PostgreSQL 15                                                 |
| Containers  | Docker, Docker Compose                                        |

---

## Quick Start (Docker)

```bash
# Clone the repo
git clone https://github.com/yourusername/inventory-order-system.git
cd inventory-order-system

# Run everything with one command
docker-compose up --build
```

| Service    | URL                     |
|------------|-------------------------|
| Frontend   | http://localhost:3000    |
| Backend    | http://localhost:8000    |
| Swagger    | http://localhost:8000/docs |

Seed data (5 products, 2 customers) is inserted automatically on first startup.

---

## Local Development (without Docker)

### Backend

**Prerequisites:** Python 3.11+, PostgreSQL running locally with database `inventory_db` created.

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL for your local PostgreSQL

# Seed data (optional - runs automatically on first startup)
python seed.py

# Start the server
uvicorn main:app --reload --port 8000
```

### Frontend

**Prerequisites:** Node.js 18+

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

### Verify It Works

1. Open http://localhost:3000 — Dashboard shows 5 products, 2 customers
2. Navigate to **Products** — seed data visible, try Add/Edit/Delete
3. Navigate to **Customers** — John Doe and Jane Smith visible
4. Navigate to **Orders** → **Create Order** — select customer, add items, place order
5. Check **Orders** list — order appears with correct total
6. Try duplicate SKU → *"SKU already exists"*
7. Try ordering > available stock → *"Insufficient stock"*

---

## Project Structure

```
inventory-order-system/
├── backend/
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── products.py        # Product CRUD endpoints
│   │   ├── customers.py       # Customer CRUD endpoints
│   │   └── orders.py          # Order endpoints with business logic
│   ├── main.py                # FastAPI app entry point
│   ├── models.py              # SQLAlchemy database models
│   ├── schemas.py             # Pydantic request/response schemas
│   ├── database.py            # Database connection & session
│   ├── seed.py                # Seed data script
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Multi-stage build (optional)
│   ├── .env.example           # Environment template
│   └── .env                   # Local environment (gitignored)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Responsive navigation bar
│   │   │   └── Navbar.css
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # Stats overview cards
│   │   │   ├── Products.jsx   # Product management (CRUD)
│   │   │   ├── Customers.jsx  # Customer management (CRUD)
│   │   │   ├── Orders.jsx     # Order list with search
│   │   │   ├── OrderDetail.jsx # Single order view
│   │   │   └── CreateOrder.jsx # Order creation form
│   │   ├── services/
│   │   │   └── api.js         # Axios API client
│   │   ├── App.jsx            # Router setup
│   │   ├── App.css            # Design system & responsive styles
│   │   └── main.jsx           # App entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile             # Nginx production build
│   ├── .env.example           # Environment template
│   └── .env                   # Local environment (gitignored)
├── docker-compose.yml         # Orchestrates all 3 services
├── .env.example               # All environment variables reference
├── .gitignore
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env` or docker-compose)

| Variable       | Required | Default                                                          | Description                     |
|----------------|----------|------------------------------------------------------------------|---------------------------------|
| `DATABASE_URL` | Yes      | `postgresql://postgres:postgres@db:5432/inventory_db`            | PostgreSQL connection string    |

Connection string examples:
- **Local Docker:** `postgresql://postgres:postgres@db:5432/inventory_db`
- **Local manual:**  `postgresql://postgres:postgres@localhost:5432/inventory_db`
- **Neon:**          `postgresql://neondb_owner:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
- **Render:**        `postgresql://user:password@host:5432/dbname`

### Frontend (`frontend/.env` or build env)

| Variable       | Required | Default                   | Description                 |
|----------------|----------|---------------------------|-----------------------------|
| `VITE_API_URL` | Yes      | `http://localhost:8000`   | Backend API base URL        |

Examples:
- **Local:** `http://localhost:8000`
- **Render:** `https://your-app.onrender.com`
- **Railway:** `https://your-app.up.railway.app`

---

## API Endpoints

### Products
| Method   | Endpoint                 | Description        |
|----------|--------------------------|--------------------|
| `GET`    | `/api/products/`         | List all products  |
| `GET`    | `/api/products/{id}`     | Get product by ID  |
| `POST`   | `/api/products/`         | Create a product   |
| `PUT`    | `/api/products/{id}`     | Update a product   |
| `DELETE` | `/api/products/{id}`     | Delete a product   |

### Customers
| Method   | Endpoint                  | Description         |
|----------|---------------------------|---------------------|
| `GET`    | `/api/customers/`         | List all customers  |
| `GET`    | `/api/customers/{id}`     | Get customer by ID  |
| `POST`   | `/api/customers/`         | Create a customer   |
| `PUT`    | `/api/customers/{id}`     | Update a customer   |
| `DELETE` | `/api/customers/{id}`     | Delete a customer   |

### Orders
| Method   | Endpoint              | Description         |
|----------|-----------------------|---------------------|
| `GET`    | `/api/orders/`        | List all orders     |
| `GET`    | `/api/orders/{id}`    | Get order details   |
| `POST`   | `/api/orders/`        | Create an order     |

### Order Creation Request
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

## Business Rules

These rules are enforced by the backend:

1. **Unique SKU** — Product SKU must be unique. Returns `{"message": "SKU already exists"}` (HTTP 400).
2. **Unique Email** — Customer email must be unique. Returns `{"message": "Email already exists"}` (HTTP 400).
3. **Stock Validation** — Before creating an order, the backend checks `quantity <= stock`. Returns `{"message": "Insufficient stock"}` (HTTP 400).
4. **Automatic Stock Deduction** — When an order is created, `stock = stock - quantity` is applied automatically.
5. **Total Calculation** — Subtotal = `quantity × unit_price`. Order total = sum of all subtotals. The frontend never calculates totals.

---

## Docker Instructions

### Build & Run

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and delete volumes (reset database)
docker-compose down -v
```

### Service Details

| Service  | Dockerfile          | Base Image         | Port  |
|----------|---------------------|--------------------|-------|
| `db`     | (official image)    | postgres:15-alpine | 5432  |
| `backend`| `backend/Dockerfile`| python:3.11-slim   | 8000  |
| `frontend`| `frontend/Dockerfile`| node:18-alpine → nginx:alpine | 3000 → 80 |

The frontend Dockerfile uses a multi-stage build:
1. **Build stage** — Compiles React app with Vite
2. **Production stage** — Serves static files via Nginx on port 80 (mapped to host 3000)

---

## Deployment Guides

### Option 1: Deploy to Render (Backend) + Vercel (Frontend) + Neon (Database)

#### Database — Neon PostgreSQL (Free)

1. Go to https://neon.tech and sign up
2. Create a new project, copy the connection string
3. It looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

#### Backend — Render

1. Push your code to GitHub
2. Go to https://render.com → **New** → **Web Service**
3. Connect your repo, set:
   - **Name:** `inventory-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 8000`
4. Add environment variable:
   - `DATABASE_URL` = your Neon connection string
5. Deploy
6. Note your backend URL: `https://inventory-backend.onrender.com`

#### Frontend — Vercel

1. Install Vercel CLI or use the GitHub integration
2. Go to https://vercel.com → **Add New** → **Project**
3. Connect your repo, set:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://inventory-backend.onrender.com`)
5. Deploy
6. Your frontend is live at `https://your-app.vercel.app`

---

### Option 2: Deploy to Railway (All-in-One)

1. Push your code to GitHub
2. Go to https://railway.app → **New Project** → **Deploy from GitHub**
3. Select your repo
4. Click **New** → **Database** → **Add PostgreSQL** (Railway provisions a DB automatically)
5. Click **New** → **Deploy** for the backend service:
   - **Root Directory:** `backend`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Railway auto-injects `DATABASE_URL` from the PostgreSQL plugin
6. Click **New** → **Deploy** for the frontend service:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npx serve dist -l $PORT`
   - Add `VITE_API_URL` pointing to your backend URL
7. All services are connected and deployed

---

### Option 3: Deploy to Netlify (Frontend) + Railway (Backend)

#### Backend on Railway
Follow steps in Option 2 for the backend only.

#### Frontend on Netlify

1. Push your code to GitHub
2. Go to https://netlify.com → **Add new site** → **Import from Git**
3. Connect your repo, set:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add environment variable:
   - `VITE_API_URL` = your Railway backend URL
5. Deploy

---

### Docker Deployment (Any Cloud VM)

For DigitalOcean, AWS EC2, Linode, etc.:

```bash
# SSH into your VM
git clone https://github.com/yourusername/inventory-order-system.git
cd inventory-order-system

# Set production database URL (e.g., Neon PostgreSQL)
export DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Run with Docker
docker-compose up --build -d
```

Your app is now accessible at `http://your-vm-ip:3000`.

---

## Seed Data

The application automatically inserts sample data on first startup (when the products/customers tables are empty):

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

## API Error Responses

| Scenario                 | Status Code | Response                          |
|--------------------------|-------------|-----------------------------------|
| Duplicate SKU            | 400         | `{"message": "SKU already exists"}` |
| Duplicate Email          | 400         | `{"message": "Email already exists"}` |
| Insufficient Stock       | 400         | `{"message": "Insufficient stock"}` |
| Product Not Found        | 404         | `{"detail": "Product not found"}` |
| Customer Not Found       | 404         | `{"detail": "Customer not found"}` |
| Negative Price/Stock     | 400         | `{"detail": "Price cannot be negative"}` |

---

## Troubleshooting

| Problem                          | Solution                                                       |
|----------------------------------|----------------------------------------------------------------|
| `port already allocated`         | Change ports in `docker-compose.yml` (e.g., `8001:8000`)       |
| Backend can't connect to DB      | Wait for PostgreSQL to fully start (healthcheck ensures this)  |
| Frontend shows blank page        | Check browser console for CORS or API URL issues               |
| `VITE_API_URL` not working       | Ensure it's set **before** building (`npm run build`)          |
| Seed data not appearing          | Stop containers with `docker-compose down -v` to reset volume  |
| Docker build fails               | Run `docker-compose build --no-cache` to clear cache           |
