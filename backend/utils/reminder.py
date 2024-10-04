from flask import current_app
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import ssl
import os
from datetime import datetime, timedelta, timezone 
from app.models import Order, OrderItem
from celery import Celery

celery = Celery(
    'tasks',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0',
)

def send_me_reminder_email(username, email, order_number, items):
    template_path = os.path.join(os.path.dirname(__file__), '..', 'email', 'reminder.html')
    with open(template_path, 'r') as file:
        html_content = file.read()

    # Generate the HTML for the items list
    items_html = ""
    for i, item in enumerate(items):
        image_url = f"https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/{item['product_id']}.jpg"
        items_html += f'''
            <div
            style="width: 100%; background-color: #FFF; display: flex; flex-direction: row; justify-content: space-evenly; align-items: flex-start; padding: 10px; border-radius: 10px; box-sizing: border-box; margin-bottom: 10px">
            <div style="width: 100%;  display: flex; flex-direction: row; align-items: center;">
                <img src="{image_url}" alt="product"
                    style="width: 90px; height: 70px; object-fit: cover; background-color: #e8e8e8; border-radius: 10px;" />
                <div
                    style="height: 70px; display: flex; flex-direction: column; align-items: flex-start; margin-left: 20px;">
                    <h4
                        style="margin: 0; font-size: 14px; color: #002020; word-wrap: break-word; overflow-wrap: break-word;">
                        {item['product_name']}
                    </h4>
                </div>
            </div>
            <h4
                style="width: 80px; height: 70px; margin: 0; font-size: 14px; color: #002020; text-align: right; word-wrap: break-word; overflow-wrap: break-word;">
                ${item['price']:.2f}
            </h4>
        </div>
        '''
    
    html_content = html_content.format(
        order_number=order_number,
        username=username,
        items_html=items_html,
    )

    # Escape curly braces in CSS and HTML
    html_content = html_content.replace("{", "{{").replace("}", "}}")

    message = Mail(
        from_email=current_app.config['MAIL_FROM'],
        to_emails=email,
        subject='Reminder: It\'s time to buy items again!',
        html_content=html_content
    )

    try:
        ssl._create_default_https_context = ssl._create_unverified_context
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        
        
@celery.task
def send_reminder_email_task():
    # one_month_ago = datetime.now(timezone.utc) - timedelta(days=30)
    # Test *****************************************************
    one_month_ago = datetime.now(timezone.utc) - timedelta(minutes=1) 
    # **********************************************************
    
    orders = Order.query.filter(Order.created_at <= one_month_ago).all()

    for order in orders:
        # Retrieve order items to send in the reminder email
        items = [
            {
                'product_id': item.product_id,
                'product_name': item.product_name,
                'price': item.price_at_purchase,
            }
            for item in order.items
        ]

        # Send reminder email
        send_me_reminder_email(
            username=order.customer.full_name,
            email=order.customer.email,
            order_number=order.order_number,
            items=items
        )

    return "Reminder emails sent."