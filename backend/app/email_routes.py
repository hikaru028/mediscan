from flask import Blueprint, request, jsonify
from app.app import db
from app.models import Order, OrderItem, Cart, CartItem, Customers
from utils.validation import is_valid_email
from utils.status import handle_error, handle_success
from utils.email import send_payment_success_email
from flask import Blueprint, request, jsonify
from app.app import db
from app.models import Order, OrderItem
from utils.email import send_payment_success_email
from datetime import datetime, timedelta

from utils.reminder import send_me_reminder_email


bp = Blueprint('email', __name__)

@bp.route('/api/payment-success', methods=['POST'])
def send_payment_email():
    try:
        data = request.json
        username = data['username']
        email = data['email']
        address = data['address']
        order_number = data['orderNumber']
        items = data['items']
        subtotal_price = data['subtotalPrice']
        shipping_fee = data['shippingFee']
        total_price = data['totalPrice']
        image_urls = data['imageUrls']
        
        send_payment_success_email(    
            username,
            email, 
            address,
            order_number, 
            items, 
            subtotal_price,
            shipping_fee,
            total_price,
            image_urls
        )

        return handle_success('Email sent successfully')
    except Exception as e:
        print(f"Error: {str(e)}")
        return handle_error('Failed to send email', 500)


# @bp.route('/api/reminder', methods=['POST'])
# def get_recent_purchases():
#     try:
#         data = request.json
#         order_number = data['orderNumber']
#         print(order_number)

#         order = Order.query.filter_by(order_number=order_number).first()
#         print(order)
#         if not order:
#             return jsonify({'error': 'Order not found'}), 404
        
#         customer_id = order.customer_id
#         print(customer_id)

#         recent_purchases = OrderItem.query.filter_by(customer_id=customer_id)\
#             .order_by(OrderItem.purchase_date.desc())\
#             .limit(5)\
#             .all()
#         purchases_list = [
#             {
#                 'item_id': item.product_id,
#                 'product_name': item.product_name,
#                 'quantity': item.quantity,
#                 'price': item.price_at_purchase,
#                 'purchase_date': item.created_at
#             }
#             for item in recent_purchases
#         ]

#         return jsonify('hello'), 200

#     except Exception as e:
#         print(f"Error: {str(e)}")
#         return jsonify({'error': 'Failed to retrieve recent purchases'}), 500