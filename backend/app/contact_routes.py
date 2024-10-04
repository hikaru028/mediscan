from flask import Blueprint, request, jsonify
from app.app import db
from app.models import Contacts, Customers
from utils.validation import get_current_customer, is_valid_phone
from utils.contact import create_default_contacts
from utils.status import handle_error, handle_success

bp = Blueprint('contact', __name__)

@bp.route('/api/contacts', methods=['GET'])
def get_contacts():
    customer_id = get_current_customer()
    if not customer_id:
        return handle_error('Customer not found', 404)

    create_default_contacts(customer_id)

    contacts = Contacts.query.filter_by(customer_id=customer_id).all()
    return jsonify([contact.to_json() for contact in contacts]), 200

@bp.route('/api/contacts/save/<int:id>', methods=['POST'])
def save_contact(id):
    data = request.get_json()
    name = data.get('name')
    address = data.get('address')
    phone = data.get('phone')

    if not is_valid_phone(phone) and phone != 'XXX-XXX-XXXX':
        return handle_error('Invalid phone number format', 400)

    try:
        customer_id = get_current_customer()
        contact = Contacts.query.filter_by(id=id, customer_id=customer_id).first()
        if contact:
            # Update contact
            contact.name = name
            contact.address = address
            contact.phone = phone
            db.session.commit()
            return handle_success('Updated successfully')
        else:
            return handle_error('Contact not found', 404)
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500