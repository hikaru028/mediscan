from flask import current_app
# from twilio.rest import Client
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.app import db
from datetime import datetime, timedelta
from utils.status import handle_error, handle_success
from utils.validation import get_customer_by_contact, is_valid_email
from flask_bcrypt import Bcrypt
import random
import ssl

bcrypt = Bcrypt()
def get_pepper():
    return current_app.config['SECRET_KEY']

# Create an OTP
def create_temp_password():
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

# Send an OTP via email
def send_email(email, message):
    message = Mail(
        from_email=current_app.config['MAIL_FROM'],
        to_emails=email,
        subject='Your OTP Code',
        html_content=message
    )
    ssl._create_default_https_context = ssl._create_unverified_context
    sg = SendGridAPIClient(current_app.config['SENDGRID_API_KEY'])
    response = sg.send(message)
    return response.status_code

# Request OTP
RATE_LIMIT_TIME_FRAME = timedelta(minutes=1)

def request_temp_password(contact):
    customer = get_customer_by_contact(contact)
    if not customer:
        return handle_error('Customer not found', 404)

    if customer.last_otp_request and datetime.now() - customer.last_otp_request < RATE_LIMIT_TIME_FRAME:
        return handle_error('Please wait before requesting another OTP', 429)

    temp_password = create_temp_password()
    temp_password_expiry = datetime.now() + timedelta(minutes=5)

    pepper = get_pepper()
    temp_password_with_pepper = (temp_password + pepper).encode('utf-8')
    hashed_temp_password = bcrypt.generate_password_hash(temp_password_with_pepper).decode('utf-8')

    customer.temporary_password = hashed_temp_password
    customer.password_expiry = temp_password_expiry
    customer.last_otp_request = datetime.now()
    db.session.commit()

    message = f"Your verification code is {temp_password}. It will expire in 5 minutes."
    if is_valid_email(contact):
        send_email(customer.email, message)

    return handle_success('Temporary password sent')