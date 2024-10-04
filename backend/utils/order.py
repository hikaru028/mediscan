from flask import current_app
from app.app import db
from datetime import datetime
from app.models import Order, OrderItem
import ssl
import os

def create_order_from_cart(customer_id, cart, order_number, total_price):
    try:
        # Create a new order
        order = Order(
            order_number=order_number,
            customer_id=customer_id,
            total_price=total_price,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        db.session.add(order)
        db.session.commit()

        # Create order items
        order_items = []
        for item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                product_name=item.product_name,
                quantity=item.quantity,
                price_at_purchase=item.price_at_purchase,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            db.session.add(order_item)
            order_items.append(order_item)

        db.session.commit()

        # Clear the cart
        for item in cart.items:
            db.session.delete(item)
        db.session.delete(cart)
        db.session.commit()

        # Convert to JSON
        order_data = {
            'order': order.to_json(),
            'items': [item.to_json() for item in order_items]
        }

        return order_data
    except Exception as e:
        db.session.rollback()
        raise e

