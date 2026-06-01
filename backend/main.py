from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes.products import router as products_router
from routes.customers import router as customers_router
from routes.orders import router as orders_router
from seed import seed
import threading

app = FastAPI(title="Inventory & Order Management System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router)
app.include_router(customers_router)
app.include_router(orders_router)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    thread = threading.Thread(target=seed)
    thread.start()


@app.get("/")
def root():
    return {"message": "Inventory & Order Management System API"}
