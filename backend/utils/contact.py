from app.models import Contacts, Customers, db

default_contacts = [
    {"name": "Pharmacy", "address": "123 Main St, Auckland", "phone": "XXX-XXX-XXXX"},
    {"name": "Ambulance", "address": "123 Main St, Auckland", "phone": "XXX-XXX-XXXX"},
    {"name": "Hospital", "address": "123 Main St, Auckland", "phone": "XXX-XXX-XXXX"},
    {"name": "General Practitioner", "address": "123 Main St, Auckland", "phone": "XXX-XXX-XXXX"}
]

def create_default_contacts(customer_id):
    existing_contacts = Contacts.query.filter_by(customer_id=customer_id).all()
    if not existing_contacts:
        for contact in default_contacts:
            new_contact = Contacts(
                customer_id=customer_id,
                name=contact['name'],
                address=contact['address'],
                phone=contact['phone']
            )
            db.session.add(new_contact)
        db.session.commit()