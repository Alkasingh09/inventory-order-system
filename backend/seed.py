from database import SessionLocal, engine, Base
from models import Product, Customer
import time


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(Product).count() == 0:
        products = [
            Product(name="Keyboard", sku="KB-001", price=100.0, stock_quantity=50),
            Product(name="Mouse", sku="MS-001", price=50.0, stock_quantity=100),
            Product(name="Monitor", sku="MN-001", price=300.0, stock_quantity=30),
            Product(name="Laptop", sku="LP-001", price=1000.0, stock_quantity=20),
            Product(name="Headphones", sku="HP-001", price=80.0, stock_quantity=75),
        ]
        db.add_all(products)
        db.commit()
        print("Seed data inserted: 5 products")

    if db.query(Customer).count() == 0:
        customers = [
            Customer(name="John Doe", email="john@example.com", phone="1234567890"),
            Customer(name="Jane Smith", email="jane@example.com", phone="9876543210"),
        ]
        db.add_all(customers)
        db.commit()
        print("Seed data inserted: 2 customers")

    db.close()


if __name__ == "__main__":
    time.sleep(3)
    seed()
