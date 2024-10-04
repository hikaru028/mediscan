from flask import Blueprint, request, jsonify, current_app, make_response
from app.app import db
from app.models import Customers, Employees, Order
from utils.otp import request_temp_password
from utils.jwt import generate_jwt, blacklist_jwt
from utils.validation import is_valid_email, is_valid_phone, get_customer_by_contact, get_employee_by_id
from utils.status import handle_error, handle_success
from datetime import datetime, timedelta
from flask_bcrypt import Bcrypt
import jwt
import random

bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()
blacklist = set()

def get_pepper():
    return current_app.config['SECRET_KEY']

# Customer Routes
@bp.route('/api/customers/requestotp', methods=['POST'])
def request_otp():
    data = request.get_json()
    contact = data.get('contact')

    if not contact:
        return handle_error('Email is required', 400)
    
    customer = get_customer_by_contact(contact)
    
    if not customer:
        new_customer = Customers(
            email=contact if is_valid_email(contact) else None,
            phone=contact if is_valid_phone(contact) else None,
        )
        db.session.add(new_customer)
        db.session.commit()
        customer = new_customer
    
    if customer.password_expiry is None or datetime.now() > customer.password_expiry:
        # Generate a new OTP if the previous one has expired
        return request_temp_password(contact)
    
    return handle_error('OTP is still valid. Please use the existing OTP.', 400)

@bp.route('/api/customers/verifyotp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    contact = data.get('contact')
    otp = data.get('otp')
    
    customer = get_customer_by_contact(contact)
    if not customer:
        return handle_error('Customer not found', 404)
    
    pepper = get_pepper()
    otp_with_pepper = otp + pepper
    
    if not bcrypt.check_password_hash(customer.temporary_password, otp_with_pepper):
        return handle_error('Invalid OTP', 400)

    if datetime.now() > customer.password_expiry:
        return handle_error('OTP expired', 400)

    customer.temporary_password = None
    customer.password_expiry = None
    db.session.commit()

    token = generate_jwt({'customer_id': customer.id})
    return jsonify({'message': 'OTP verified', 'token': token}), 200

@bp.route('/api/customers/create', methods=['POST'])
def register_customer():
    try:
        data = request.get_json()
        email = data.get('email')
        phone = data.get('phone')
        full_name = data.get('fullName')
        address = data.get('address')
        otp = str(random.randint(100000, 999999))
        password_expiry = datetime.now() + timedelta(minutes=5)
        
        if not email and not phone:
            return handle_error('Email or Phone is required', 400)
        
        existing_customer = Customers.query.filter(
            (Customers.email == email) | (Customers.phone == phone)
        ).first()
        if existing_customer:
            token = generate_jwt({'customer_id': existing_customer.id})
            return jsonify({
                'message': 'Customer already exists',
                'token': token
            }), 201

        pepper = get_pepper()
        otp_with_pepper = otp + pepper
        hashed_otp = bcrypt.generate_password_hash(otp_with_pepper).decode('utf-8')

        # Create new customer
        new_customer = Customers(
            email=email,
            phone=phone,
            full_name=full_name,
            address=address,
            temporary_password=hashed_otp,
            password_expiry=password_expiry,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        db.session.add(new_customer)
        db.session.commit()

        # Generate JWT token for the new customer
        token = generate_jwt({'customer_id': new_customer.id})
        return jsonify({'message': 'Customer registered successfully', 'token': token}), 201

    except Exception as e:
        print(f"Error: {str(e)}")
        return handle_error('Failed to register customer', 500)

@bp.route('/api/customers/update', methods=['PUT'])
def update_customer():
    try:
        request_data = request.get_json()
        customer_id = request_data.get('id')
        dob = request_data.get('dob')
        
        customer = Customers.query.get(customer_id)
        if not customer:
            return handle_error('Customer not found', 404)
        
        # Directly assign dob if it's in the correct format
        if dob:
            customer.dob = datetime.strptime(dob, '%Y-%m-%d').date()

        # Other fields update logic
        customer.full_name = request_data.get('fullName', customer.full_name)
        customer.ethnicity = request_data.get('ethnicity', customer.ethnicity)
        customer.gender = request_data.get('gender', customer.gender)
        customer.phone = request_data.get('phone', customer.phone)
        customer.address = request_data.get('address', customer.address)

        db.session.commit()
        return handle_success('Customer updated successfully')

    except Exception as e:
        return handle_error(f"An error occurred: {str(e)}", 500)

@bp.route('/api/customers/me', methods=['GET'])
def get_customer():   
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return handle_error('No authorization token provided', 401)

    token = auth_header.split(" ")[1]  # Extract token from "Bearer <token>"
    
    try:
        if blacklist_jwt(token):
            return handle_error('Token has been revoked', 401)
        
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        customer_id = data.get('customer_id')
        
        if not customer_id:
            return handle_error('Invalid token', 401)

        customer = Customers.query.get(customer_id)
        if not customer:
            return handle_error('Customer not found', 404)

        return jsonify({
            'id': customer.id,
            'fullName': customer.full_name,
            'email': customer.email,
            'phone': customer.phone,
            'dob': customer.dob,
            'ethnicity': customer.ethnicity,
            'gender': customer.gender,
            'address': customer.address,
        }), 200
        

    except jwt.ExpiredSignatureError:
        return handle_error('Token has expired', 401)
    except jwt.InvalidTokenError:
        return handle_error('Invalid token', 401)
    except Exception as e:
        return handle_error(f"An error occurred: {str(e)}", 500)

@bp.route('/api/customers/logout', methods=['POST'])
def logout_customer():
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return handle_error('No authorization token provided', 401)

    token = auth_header.split(" ")[1]

    if blacklist_jwt(token):
        return handle_error('Token has already been revoked', 401)

    blacklist.add(token)
    response = make_response(handle_success('Logout successful'))
    response.delete_cookie('token', path='/', domain=None)
    
    return response

@bp.route('/api/customers/delete/<int:id>', methods=['DELETE'])
def delete_customer(id):
    try:
        customer = Customers.query.get(id)
        if not customer:
            return handle_error('Customer not found', 404)

        # Delete related orders manually
        orders = Order.query.filter_by(customer_id=id).all()
        for order in orders:
            db.session.delete(order)

        # Now delete the customer
        db.session.delete(customer)
        db.session.commit()

        return handle_success('Customer account and related orders deleted successfully')
    except Exception as e:
        return handle_error(f"An error occurred: {str(e)}", 500)

# Employee Routes
@bp.route('/api/employees/signup', methods=['POST'])
def create_employee():
    data = request.get_json()
    employee_id = data.get('employee_id')
    full_name = data.get('full_name')
    password = data.get('password')
    pepper = get_pepper()

    if not employee_id:
        return jsonify({'error': 'Employee ID is required'}), 400
    if not full_name:
        return jsonify({'error': 'Full name is required'}), 400
    if not password:
        return jsonify({'error': 'Password is required'}), 400
    
    if get_employee_by_id(employee_id):
        return jsonify({'error': 'Employee already exists'}), 409
    
    password_with_pepper = (password + pepper).encode('utf-8')
    hashed_password = bcrypt.generate_password_hash(password_with_pepper).decode('utf-8')

    new_employee = Employees(
        employee_id=employee_id,
        full_name=full_name,
        password=hashed_password,
        img_url=data.get('imgUrl', None)
    )
    db.session.add(new_employee)
    db.session.commit()

    token = generate_jwt({'employee_id': new_employee.employee_id})
    response = make_response(jsonify({'message': 'Employee created successfully'}), 201)
    response.set_cookie('token', token, httponly=True, samesite='Strict', secure=True)
    
    return response

@bp.route('/api/employees/login', methods=['POST'])
def login_employee():
    data = request.get_json()
    employee_id = data.get('employee_id')
    password = data.get('password')
    employee = get_employee_by_id(employee_id)
    
    if not employee_id:
        return handle_error('Employee ID is required', 400)
    if not password:
        return handle_error('Password is required', 400)
    if not employee:
        return handle_error('Employee not found', 404)

    pepper = get_pepper() 
    password_with_pepper = (password + pepper).encode('utf-8')
    
    if bcrypt.check_password_hash(employee.password, password_with_pepper):
        token = generate_jwt({'employee_id': employee.employee_id})
        response = make_response(jsonify({'message': 'Login successful'}), 200)
        response.set_cookie('token', token, httponly=True, samesite='Strict', secure=True)
        
        return response
    else:
        return handle_error('Invalid credentials', 400)

@bp.route('/api/employees/me', methods=['GET'])
def get_employee():
    token = request.cookies.get('token')
    if not token:
        return handle_error('No authorization token provided', 401)
    
    try:
        if blacklist_jwt(token):
            return handle_error('Token has been revoked', 401)
        
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        employee_id = data.get('employee_id')
        
        if not employee_id:
            return handle_error('Invalid token', 401)

        employee = Employees.query.filter_by(employee_id=employee_id).first()
        if not employee:
            return handle_error('Employee not found', 404)

        return jsonify({
            'id': employee.id,
            'employee_id': employee.employee_id,
            'full_name': employee.full_name,
            'email': employee.email,
            'imgUrl': employee.img_url,
        }), 200

    except jwt.ExpiredSignatureError:
        return handle_error('Token has expired', 401)
    except jwt.InvalidTokenError:
        return handle_error('Invalid token', 401)
    except Exception as e:
        return handle_error(f"An error occurred: {str(e)}", 500)

@bp.route('/api/employees/logout', methods=['POST'])
def logout_employee():
    token = request.cookies.get('token')
    if token:
        blacklist.add(token)

    response = make_response(handle_success('Logout successful'))
    response.delete_cookie('token', path='/', domain=None)  # delete the JWT token cookie
    return response

@bp.route('/api/employees/update', methods=['PUT'])
def update_employee():
    token = request.cookies.get('token')
    if not token:
        return handle_error('No authorization token provided', 401)

    try:
        if blacklist_jwt(token):
            return handle_error('Token has been revoked', 401)

        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        employee_id = data.get('employee_id')

        if not employee_id:
            return handle_error('Invalid token', 401)

        employee = Employees.query.filter_by(employee_id=employee_id).first()
        if not employee:
            return handle_error('Employee not found', 404)

        # Get the request data
        request_data = request.get_json()
        new_full_name = request_data.get('full_name')
        new_email = request_data.get('email')
        new_password = request_data.get('password')
        new_img_url = request_data.get('img_url')
        current_password = request_data.get('old_password')

        if not current_password or not bcrypt.check_password_hash(employee.password, (current_password + get_pepper()).encode('utf-8')):
            return handle_error('Current password is incorrect', 400)

        if new_full_name:
            employee.full_name = new_full_name
            
        if new_email:
            employee.email = new_email

        if new_password:
            password_with_pepper = (new_password + get_pepper()).encode('utf-8')
            hashed_password = bcrypt.generate_password_hash(password_with_pepper).decode('utf-8')
            employee.password = hashed_password

        if new_img_url:
            employee.img_url = new_img_url

        db.session.commit()
        return handle_success('Employee profile updated successfully')

    except jwt.ExpiredSignatureError:
        return handle_error('Token has expired', 401)
    except jwt.InvalidTokenError:
        return handle_error('Invalid token', 401)
    except Exception as e:
        return handle_error(f"An error occurred: {str(e)}", 500)

@bp.route('/api/employees/delete/<int:id>', methods=['DELETE'])
def delete_employee(id):
    token = request.cookies.get('token')
    if not token:
        return handle_error('No authorization token provided', 401)

    try:
        if blacklist_jwt(token):
            return handle_error('Token has been revoked', 401)

        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        employee_id = data.get('employee_id')

        if str(employee_id) != str(id):
            return handle_error('Unauthorized action', 403)

        request_data = request.get_json()
        password = request_data.get('password')

        if not password:
            return handle_error('Password is required', 400)

        employee = Employees.query.filter_by(employee_id=id).first()
        if not employee:
            return handle_error('Employee not found', 404)

        pepper = get_pepper()
        if not bcrypt.check_password_hash(employee.password, (password + pepper).encode('utf-8')):
            return handle_error('Incorrect password', 400)

        db.session.delete(employee)
        db.session.commit()

        blacklist.add(token)

        response = make_response(handle_success('Employee account deleted successfully'))
        response.delete_cookie('token', path='/', domain=None)  # delete the JWT token cookie
        return response

    except jwt.ExpiredSignatureError:
        return handle_error('Token has expired', 401)
    except jwt.InvalidTokenError:
        return handle_error('Invalid token', 401)
    except Exception as e:
        return handle_error(f"An error occurred: {str(e)}", 500)