from flask import request, current_app
from app.models import Customers, Employees
import jwt
import re

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def is_valid_phone(phone):
    standard_phone_pattern = r"^(09|\(02[1-9]\)|02[1-9])\d{1,3}[-\s]?\d{3}[-\s]?\d{3,4}$"
    emergency_phone_pattern = r"^\d{3}$|^\d{4}$"

    return re.match(standard_phone_pattern, phone) or re.match(emergency_phone_pattern, phone)

def confirm_customer(contact):
    if is_valid_email(contact):
        return Customers.query.filter_by(email=contact).first()
    else:
        return None
    
def get_customer_by_contact(contact):
    if is_valid_email(contact):
        return Customers.query.filter_by(email=contact).first()
    else:
        return None

def get_employee_by_id(employee_id):
    return Employees.query.filter_by(employee_id=employee_id).first()

def get_current_customer():
    auth_header = request.headers.get('Authorization')
    if auth_header:
        token = auth_header.split(" ")[1]
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            return data.get('customer_id')
        except jwt.ExpiredSignatureError:
            return None  # Token has expired
        except jwt.InvalidTokenError:
            return None  # Invalid token
        except Exception as e:
            print(f"An error occurred: {str(e)}")
            return None
    else:
        temp_user_id = request.headers.get('Temporary-UserId')
        return temp_user_id if temp_user_id else None
