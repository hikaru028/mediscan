from flask import Blueprint, request, jsonify, session
from app.app import db
from app.models import Cart, CartItem, Products
from utils.status import handle_error, handle_success
from datetime import datetime
import uuid

bp = Blueprint('cart', __name__)

# Add item to cart
@bp.route('/api/carts/add', methods=['POST'])
def add_to_cart():
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        cart_id = data.get('cart_id')
        quantity = data.get('quantity')
        
        if not product_id:
            return handle_error('Product ID is required', 400)

        if (cart_id is None) or (cart_id == ''):
            cart_id = str(uuid.uuid4())
            session['cart_id'] = cart_id
            
        product = Products.query.filter_by(product_id=product_id).first()
        
        if not product:
            return handle_error('Product not found', 404) 
        if not product.price:
            return handle_error('Product price is invalid', 400)
        
        cart = Cart.query.filter_by(cart_id=cart_id).first()
        if not cart:
            cart = Cart(cart_id=cart_id)
            db.session.add(cart)
            db.session.commit()
            
        cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product.id).first()
        if cart_item:
            cart_item.quantity += quantity
            cart_item.price_at_purchase = product.price
            cart_item.updated_at = datetime.now()
        else:
            new_cart_item = CartItem(
                cart_id=cart.id,
                product_id=product.id,
                product_name=product.product_name,
                quantity=quantity,
                price_at_purchase=product.price,
                brand_name=product.brand_name,
                generic_name=product.generic_name,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )

            new_cart_item.images = product.images
            db.session.add(new_cart_item)
        
        db.session.commit()
        return cart_id
    except Exception as e:
        return handle_error(f"An error occurred: {str(e)}", 500)

# View cart
@bp.route('/api/carts/view', methods=['GET'])
def view_cart():
    try:
        cart_id = request.args.get('cart_id')
        
        if not cart_id:
            return handle_error('Cart ID is required', 400)

        cart = Cart.query.filter_by(cart_id=cart_id).first()
        if not cart:
            return handle_error('Cart not found', 404)

        cart_items = CartItem.query.filter_by(cart_id=cart.id).all()
        
        if not cart_items:
            return handle_error('No items found in cart', 404)
        
        cart_data = {
            'cart_id': cart_id,
            'items': [item.to_json() for item in cart_items]
        }
        
        return jsonify(cart_data), 200
    except Exception as e:
        return handle_error(f"An error occurred: {str(e)}", 500)



# Update cart item quantity
@bp.route('/api/carts/update', methods=['PUT'])
def update_cart_item():
    try:
        data = request.get_json()
        cart_id_str = data.get('cart_id')
        product_id = data.get('product_id')
        quantity = data.get('quantity')

        if not cart_id_str:
            return handle_error('Cart not found', 404)

        if not product_id or quantity is None:
            return handle_error('Product ID and Quantity are required', 400)

        if quantity <= 0:
            return handle_error('Quantity must be a positive integer', 400)

        cart = Cart.query.filter_by(cart_id=cart_id_str).first()
        
        if not cart:
            return handle_error('Cart not found', 404)

        # Now use the cart.id (primary key) to find the CartItem
        cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
        
        if not cart_item:
            return handle_error('Cart item not found', 404)

        if quantity <= 0:
            db.session.delete(cart_item)
        else:
            cart_item.quantity = quantity
            cart_item.updated_at = datetime.now()

        db.session.commit()
        return handle_success('Cart item updated successfully')
    except Exception as e:
        return handle_error(f'An error occurred: {str(e)}', 500)

# Remove item from cart
@bp.route('/api/carts/remove', methods=['DELETE'])
def remove_from_cart():
    try:
        data = request.get_json()
        cart_id = data.get('cart_id')
        product_id = data.get('product_id')
        
        
        if not product_id:
            return handle_error('Product ID is required', 400)

        if not cart_id:
            return handle_error('Cart not found', 404)

        cart = Cart.query.filter_by(cart_id=cart_id).first()
        if not cart:
            return handle_error('Cart not found', 404)

        cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()

        if not cart_item:
            return handle_error('Cart item not found', 404)

        db.session.delete(cart_item)
        db.session.commit()

        return handle_success('Item removed from cart successfully')
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return handle_error(f"An error occurred: {str(e)}", 500)
    
# Delete a cart from database
@bp.route('/api/carts/delete/<string:cart_id>', methods=['DELETE'])
def delete_cart(cart_id):
    try:
        cart = Cart.query.filter_by(cart_id=cart_id).first()
        
        if not cart:
            return handle_error('Cart not found', 404)
        
        CartItem.query.filter_by(cart_id=cart.id).delete()
        
        db.session.delete(cart)
        db.session.commit()

        print(f"Cart {cart_id} deleted successfully")
        return handle_success('Cart deleted successfully')
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return handle_error(f"An error occurred: {str(e)}", 500)
