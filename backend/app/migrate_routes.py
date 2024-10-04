from flask import Blueprint, jsonify
from sqlalchemy.exc import SQLAlchemyError
from app.models import Products
from faker import Faker
from datetime import datetime
import random

bp = Blueprint('migrate', __name__)
fake = Faker()

def reformat_date(date_str):
    try:
        return datetime.strptime(date_str, '%d/%m/%Y').strftime('%Y-%m-%d')
    except ValueError:
        return date_str

# insert data from CSV
def process_data(session, data):
    data = data.fillna('-')
    for index, row in data.iterrows():
        try:
            existing_product = session.query(Products).filter_by(product_id=row['product_id']).first()
            if existing_product:
                print(f"Product with ID {row['product_id']} already exists, skipping...")
                continue
        
            product_name = row['product_name'][:80]
            manufacturer = row['manufacturer'][:80]
            approval_date = reformat_date(row['approval_date'])
            expiry_date = reformat_date(row['expiry_date'])

            new_product = Products(
                product_id=row['product_id'],
                product_name=product_name,
                brand_name=row['brand_name'],
                generic_name=row['generic_name'],
                manufacturer=manufacturer,
                price=row['price'],
                stock=random.randint(10, 200),
                since=fake.date_this_decade(),
                updated=fake.date_this_decade(),
                active_ingredients=row['active_ingredients'],
                inactive_ingredients=fake.text(),
                therapeutic_class=row['therapeutic_class'],
                formulation=row['formulation'],
                systemic_category=row['systemic_category'],
                usage_duration=row['usage_duration'],
                target_population=row['target_population'],
                drug_class=row['drug_class'],
                strength=row['strength'],
                dosage=row['dosage'],
                route_of_administration=row['route_of_administration'],
                indications=row['indications'],
                contraindications=fake.text(),
                side_effects=row['side_effects'],
                interactions=row['interactions'],
                warnings=row['warnings'],
                storage_conditions=row['storage_conditions'],
                approval_date=approval_date,
                expiry_date=expiry_date,
                batch_number=row['batch_number'],
                description=row['description'],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )

            session.add(new_product)
        except SQLAlchemyError as e:
            print(f"Error adding product {row['product_name']}: {e}")
            session.rollback()
