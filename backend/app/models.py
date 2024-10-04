from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

db = SQLAlchemy()

class Customers(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(80), nullable=True)
    email = db.Column(db.String(345), unique=True, nullable=True)
    phone = db.Column(db.String(20), unique=True, nullable=True)
    dob = db.Column(db.Date, nullable=True)
    ethnicity = db.Column(db.String(20), nullable=True)
    gender = db.Column(db.String(10), nullable=True)
    address = db.Column(db.String(120), nullable=True)
    temporary_password = db.Column(db.String(255), nullable=True)
    password_expiry = db.Column(db.DateTime, nullable=True)
    last_otp_request = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)

    def to_json(self):
        return {
            'id': self.id,
            'fullName': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'dob': self.dob,
            'ethnicity': self.ethnicity,
            'gender': self.gender,
            'address': self.address,
            'temporaryPassword': self.temporary_password,
            'passwordExpiry': self.password_expiry,
            'lastOtpRequest': self.last_otp_request,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at
        }

class Employees(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_id = db.Column(db.String(10), unique=True, nullable=False)
    full_name = db.Column(db.String(80), nullable=False)
    img_url = db.Column(db.String(200), nullable=True)
    email = db.Column(db.String(345), unique=True, nullable=True)
    password = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)

    def to_json(self):
        return {
            'id': self.id,
            'employeeId': self.employee_id,
            'fullName': self.full_name,
            'imgUrl': self.img_url,
            'email': self.email,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
        }

class Contacts(db.Model):
    __tablename__ = 'contacts'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(80), nullable=True)
    address = db.Column(db.String(200), nullable=True)
    phone = db.Column(db.String(120), nullable=True)

    def to_json(self):
        return {
            'id': self.id,
            'customerId': self.customer_id,
            'name': self.name,
            'address': self.address,
            'phone': self.phone,
        }

class Products(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()), unique=True, nullable=False)
    product_id = db.Column(db.String(36), unique=True, nullable=False)
    product_name = db.Column(db.String(80), nullable=False)
    brand_name = db.Column(db.String(80), nullable=False)
    generic_name = db.Column(db.String(80), nullable=True)
    manufacturer = db.Column(db.String(80), nullable=True)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    since = db.Column(db.DateTime, nullable=True)
    updated = db.Column(db.DateTime, nullable=True)
    active_ingredients = db.Column(db.Text, nullable=True)
    inactive_ingredients = db.Column(db.Text, nullable=True)
    therapeutic_class = db.Column(db.String(80), nullable=True)
    formulation = db.Column(db.String(80), nullable=True)
    systemic_category = db.Column(db.String(80), nullable=True)
    usage_duration = db.Column(db.String(80), nullable=True)
    target_population = db.Column(db.String(80), nullable=True)
    drug_class = db.Column(db.String(80), nullable=True)
    strength = db.Column(db.String(80), nullable=True)
    dosage = db.Column(db.Text, nullable=True)
    route_of_administration = db.Column(db.String(80), nullable=True)
    indications = db.Column(db.Text, nullable=True)
    contraindications = db.Column(db.Text, nullable=True)
    side_effects = db.Column(db.Text, nullable=True)
    interactions = db.Column(db.Text, nullable=True)
    warnings = db.Column(db.Text, nullable=True)
    storage_conditions = db.Column(db.Text, nullable=True)
    approval_date = db.Column(db.DateTime, nullable=True)
    expiry_date = db.Column(db.DateTime, nullable=False)
    batch_number = db.Column(db.String(80), nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)

    images = db.relationship('ProductImage', backref='product', lazy=True)

    def to_json(self):
        return {
            'id': self.id,
            'productId': self.product_id,
            'productName': self.product_name,
            'brandName': self.brand_name,
            'genericName': self.generic_name,
            'manufacturer': self.manufacturer,
            'price': self.price,
            'stock': self.stock,
            'since': self.since,
            'updated': self.updated,
            'activeIngredients': self.active_ingredients,
            'inactiveIngredients': self.inactive_ingredients,
            'therapeuticClass': self.therapeutic_class,
            'formulation': self.formulation,
            'systemicCategory': self.systemic_category,
            'usageDuration': self.usage_duration,
            'targetPopulation': self.target_population,
            'drugClass': self.drug_class,
            'strength': self.strength,
            'dosage': self.dosage,
            'routeOfAdministration': self.route_of_administration,
            'indications': self.indications,
            'contraindications': self.contraindications,
            'sideEffects': self.side_effects,
            'interactions': self.interactions,
            'warnings': self.warnings,
            'storageConditions': self.storage_conditions,
            'approvalDate': self.approval_date,
            'expiryDate': self.expiry_date,
            'batchNumber': self.batch_number,
            'description': self.description,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
            'images': [image.to_json() for image in self.images]
        }
    
    def to_short_json(self):
        image_url = self.images[0].to_json1() if self.images else None
        return {
            'image': image_url ,
            'productId': self.product_id,
            'productName': self.product_name,
            'brandName': self.brand_name,
            'genericName': self.generic_name,
            'manufacturer': self.manufacturer,
            'price': self.price,
            'stock': self.stock,
            'since': self.since.strftime('%Y-%m-%d') if isinstance(self.since, datetime) else self.since,
            'updated': self.updated.strftime('%Y-%m-%d') if isinstance(self.updated, datetime) else self.updated
        }

    def to_long_json(self):
        return {
            'productId': self.product_id,
            'activeIngredients': self.active_ingredients,
            'inactiveIngredients': self.inactive_ingredients,
            'therapeuticClass': self.therapeutic_class,
            'formulation': self.formulation,
            'systemicCategory': self.systemic_category,
            'usageDuration': self.usage_duration,
            'targetPopulation': self.target_population,
            'drugClass': self.drug_class,
            'strength': self.strength,
            'dosage': self.dosage,
            'routeOfAdministration': self.route_of_administration,
            'indications': self.indications,
            'contraindications': self.contraindications,
            'sideEffects': self.side_effects,
            'interactions': self.interactions,
            'warnings': self.warnings,
            'storageConditions': self.storage_conditions,
            'approvalDate': self.approval_date,
            'expiryDate': self.expiry_date,
            'batchNumber': self.batch_number,
            'description': self.description,
        }

class ProductImage(db.Model):
    __tablename__ = 'product_images'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    img_url = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)

    def to_json(self):
        return {
            'productId': self.product_id,
            'imgUrl': self.img_url,
            'createdAt': self.created_at,
        }
        
class Cart(db.Model):
    __tablename__ = 'carts'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    cart_id = db.Column(db.String(36), unique=True, nullable=False, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)

    customer = db.relationship('Customers', backref='cart', lazy=True)
    items = db.relationship('CartItem', backref='cart', lazy=True, cascade="all, delete-orphan")

    def to_json(self):
        return {
            'id': self.id,
            'cartId': self.cart_id,
            'customerId': self.customer_id,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
            'items': [item.to_json() for item in self.items]
        }

cart_item_images = db.Table('cart_item_images',
    db.Column('cart_item_id', db.Integer, db.ForeignKey('cart_items.id'), primary_key=True),
    db.Column('image_id', db.Integer, db.ForeignKey('product_images.id'), primary_key=True)
)

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    product_name = db.Column(db.String(80), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase = db.Column(db.Float, nullable=False)
    brand_name = db.Column(db.String(80), nullable=False)
    generic_name = db.Column(db.String(80), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)

    product = db.relationship('Products', backref='cart_items', lazy=True)
    images = db.relationship('ProductImage', secondary=cart_item_images, lazy='subquery',
                             backref=db.backref('cart_items', lazy=True))

    def to_json(self):
        return {
            'id': self.id,
            'cartId': self.cart_id,
            'productId': self.product.product_id,
            'productName': self.product_name,
            'quantity': self.quantity,
            'priceAtPurchase': self.price_at_purchase,
            'brandName': self.brand_name,
            'genericName': self.generic_name,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
            'images': [image.to_json() for image in self.images]
        }

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_number = db.Column(db.String(36), unique=True, nullable=False, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)

    customer = db.relationship('Customers', backref='orders', lazy=True)
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")

    def to_json(self):
        return {
            'id': self.id,
            'orderNumber': self.order_number,
            'customerId': self.customer_id,
            'totalPrice': self.total_price,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
            'items': [item.to_json() for item in self.items]
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    product_name = db.Column(db.String(80), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)

    product = db.relationship('Products', backref='order_items', lazy=True)

    def to_json(self):
        return {
            'id': self.id,
            'orderId': self.order_id,
            'productId': self.product.product_id,
            'productName': self.product_name,
            'quantity': self.quantity,
            'priceAtPurchase': self.price_at_purchase,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at
        }