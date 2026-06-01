from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Order, OrderItem, Customer, Product
from schemas import OrderCreate, OrderResponse, OrderListItem

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("/", response_model=List[OrderListItem])
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "customer_id": order.customer_id,
            "customer_name": order.customer.name,
            "total_amount": order.total_amount,
            "created_at": order.created_at,
        })
    return result


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    items = []
    for item in order.items:
        items.append({
            "product_name": item.product.name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "subtotal": item.subtotal,
        })
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "total_amount": order.total_amount,
        "items": items,
    }


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    order_items_data = []
    total_amount = 0.0

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with id {item.product_id} not found")
        if item.quantity > product.stock_quantity:
            raise HTTPException(status_code=400, detail={"message": "Insufficient stock"})

        unit_price = product.price
        subtotal = item.quantity * unit_price
        total_amount += subtotal

        order_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": unit_price,
            "subtotal": subtotal,
        })

    db_order = Order(customer_id=order_data.customer_id, total_amount=total_amount)
    db.add(db_order)
    db.flush()

    for item_data in order_items_data:
        product = item_data["product"]
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            subtotal=item_data["subtotal"],
        )
        db.add(db_item)
        product.stock_quantity -= item_data["quantity"]

    db.commit()
    db.refresh(db_order)

    items = []
    for item in db_order.items:
        items.append({
            "product_name": item.product.name,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "subtotal": item.subtotal,
        })

    return {
        "id": db_order.id,
        "customer_id": db_order.customer_id,
        "total_amount": db_order.total_amount,
        "items": items,
    }
