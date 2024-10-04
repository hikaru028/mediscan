from flask import Blueprint, request, jsonify
from app.app import db
from app.models import Order, OrderItem, Cart, CartItem
from utils.validation import get_current_customer
from utils.status import handle_error, handle_success
from utils.order import create_order_from_cart
from datetime import datetime

bp = Blueprint('orders', __name__)

@bp.route('/api/orders/create', methods=['POST'])
def create_order():
    try:
        data = request.json
        customer_id = data['customerId']
        cart_id = data['cartId']
        order_number = data['orderNumber']
        total_price = data['totalPrice']
        cart = Cart.query.filter_by(cart_id=cart_id).first()

        if not cart:
            return handle_error('Cart not found', 404)

        # create the order history
        order_data = create_order_from_cart(customer_id, cart, order_number, total_price)

        return jsonify(order_data), 201
    except Exception as e:
        print(f"Error: {str(e)}")
        return handle_error('Failed to create order', 500)

# Route to view orders for a customer
@bp.route('/api/orders', methods=['GET'])
def view_orders():
    try:
        customer_id = get_current_customer()

        if not customer_id:
            return handle_error('Customer ID is required', 400)

        orders = Order.query.filter_by(customer_id=customer_id).all()
        
        if not orders:
            return handle_error('No orders found for this customer', 404)
        
        orders_data = {
            'orders': [order.to_json() for order in orders]
        }
        
        return jsonify(orders_data), 200
    except Exception as e:
        return handle_error(f"An error occurred: {str(e)}", 500)