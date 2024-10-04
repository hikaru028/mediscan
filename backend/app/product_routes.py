from flask import Blueprint, request, jsonify
from sqlalchemy import func
from app.app import db
from app.models import Products, ProductImage
from utils.status import handle_error, handle_success
from datetime import datetime
from fuzzywuzzy import process

bp = Blueprint('product', __name__)

@bp.route('/api/products/create', methods=['POST'])
def create_product():
    data = request.get_json()

    existing_product = Products.query.filter_by(product_id=data.get('productId')).first()
    if existing_product:
        return jsonify({"error": "Product with the same ID already exists."}), 400

    try:
        new_product = Products(
            product_id=data.get('productId'),
            product_name=data.get('productName'),
            brand_name=data.get('brandName'),
            generic_name=data.get('genericName'),
            manufacturer=data.get('manufacturer'),
            price=data.get('price'),
            stock=data.get('stock'),
            since=datetime.strptime(data.get('since'), '%Y-%m-%d') if data.get('since') else None,
            updated=datetime.strptime(data.get('updated'), '%Y-%m-%d') if data.get('updated') else None,
            active_ingredients=data.get('activeIngredients'),
            inactive_ingredients=data.get('inactiveIngredients'),
            therapeutic_class=data.get('therapeuticClass'),
            formulation=data.get('formulation'),
            systemic_category=data.get('systemicCategory'),
            usage_duration=data.get('usageDuration'),
            target_population=data.get('targetPopulation'),
            drug_class=data.get('drugClass'),
            strength=data.get('strength'),
            dosage=data.get('dosage'),
            route_of_administration=data.get('routeOfAdministration'),
            indications=data.get('indications'),
            contraindications=data.get('contraindications'),
            side_effects=data.get('sideEffects'),
            interactions=data.get('interactions'),
            warnings=data.get('warnings'),
            storage_conditions=data.get('storageConditions'),
            approval_date=datetime.strptime(data.get('approvalDate'), '%Y-%m-%d') if data.get('approvalDate') else None,
            expiry_date=datetime.strptime(data.get('expiryDate'), '%Y-%m-%d'),
            batch_number=data.get('batchNumber'),
            description=data.get('description')
        )

        db.session.add(new_product)
        db.session.commit()

        # Handle product images if provided
        img_urls = data.get('img_urls', [])
        for url in img_urls:
            new_image = ProductImage(product_id=new_product.id, img_url=url)
            db.session.add(new_image)
        db.session.commit()

        return jsonify(new_product.to_json()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
@bp.route('/api/products/update/<string:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.get_json()
    product = Products.query.filter_by(product_id=product_id).first()
    
    if not product:
        return handle_error('Product not found.', 404)
    
    product.product_name = data.get('productName', product.product_name)
    product.brand_name = data.get('brandName', product.brand_name)
    product.generic_name = data.get('genericName', product.generic_name)
    product.manufacturer = data.get('manufacturer', product.manufacturer)
    product.price = data.get('price', product.price)
    product.stock = data.get('stock', product.stock)
    product.since = datetime.strptime(data.get('since'), '%Y-%m-%d') if data.get('since') else product.since
    product.updated = datetime.strptime(data.get('updated'), '%Y-%m-%d') if data.get('updated') else product.updated
    product.active_ingredients = data.get('activeIngredients', product.active_ingredients)
    product.inactive_ingredients = data.get('inactiveIngredients', product.inactive_ingredients)
    product.therapeutic_class = data.get('therapeuticClass', product.therapeutic_class)
    product.formulation = data.get('formulation', product.formulation)
    product.systemic_category = data.get('systemicCategory', product.systemic_category)
    product.usage_duration = data.get('usageDuration', product.usage_duration)
    product.target_population = data.get('targetPopulation', product.target_population)
    product.drug_class = data.get('drugClass', product.drug_class)
    product.strength = data.get('strength', product.strength)
    product.dosage = data.get('dosage', product.dosage)
    product.route_of_administration = data.get('routeOfAdministration', product.route_of_administration)
    product.indications = data.get('indications', product.indications)
    product.contraindications = data.get('contraindications', product.contraindications)
    product.side_effects = data.get('sideEffects', product.side_effects)
    product.interactions = data.get('interactions', product.interactions)
    product.warnings = data.get('warnings', product.warnings)
    product.storage_conditions = data.get('storageConditions', product.storage_conditions)
    product.approval_date = datetime.strptime(data.get('approvalDate'), '%Y-%m-%d') if data.get('approvalDate') else product.approval_date
    product.expiry_date = datetime.strptime(data.get('expiryDate'), '%Y-%m-%d')
    product.batch_number = data.get('batchNumber', product.batch_number)
    product.description = data.get('description', product.description)
    db.session.commit()
    
    return jsonify(product.to_json()), 200
    
@bp.route('/api/products/all', methods=['GET'])
def get_products():
    try:
        products = Products.query.all()
        products_json = [product.to_short_json() for product in products]

        return jsonify(products_json), 200

    except Exception as e:
        return jsonify({"error": f"Failed to query the database: {e}"}), 500


@bp.route('/api/products/detail', methods=['GET'])
def get_detail():
    try:
        products = Products.query.all()
        product_details = [product.to_long_json() for product in products]

        # Print the first product's details for debugging
        if product_details:
            first_product = product_details[0]

        return jsonify(product_details), 200

    except Exception as e:
        return jsonify({"error": f"Failed to query the database: {e}"}), 500


@bp.route('/api/products/name/<string:product_name>', methods=['GET'])
def get_product_by_name(product_name):
    products = Products.query.all()
    product_names = [product.product_name for product in products]
    best_match, score = process.extractOne(product_name, product_names)

    if score > 70:
        product = Products.query.filter_by(product_name=best_match).first()
        if product:
            return jsonify(product.to_json()), 200
    
@bp.route('/api/products/<string:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Products.query.filter_by(product_id=product_id).first()
    
    if not product:
        return handle_error('Product not found.', 404)
    
    db.session.delete(product)
    db.session.commit()
    
    return handle_success('Product deleted successfully.')

@bp.route('/api/products', methods=['GET'])
def get_paginated_products():
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('pageSize', 12, type=int)
        offset = (page - 1) * page_size

        products = Products.query.limit(page_size).offset(offset).all()  # Fixed query syntax

        product_list = [product.to_json() for product in products]  # Ensure to_dict() method is used

        return jsonify(product_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/api/products/mobile', methods=['GET'])
def get_mobile_product_images():
    try:
        products = Products.query.limit(5).all()
        products_json = {}
        for product in products:
            product_name = product.product_name
            product_id = product.product_id
            
            product_image = ProductImage.query.filter_by(product_id=product_id).first()
            image_url = product_image.img_url if product_image else None
            
            if image_url:
                products_json[product_name] = image_url
        
        return jsonify(products_json), 200
    except Exception as e:
        return jsonify({"error": f"Failed to query the database: {e}"}), 500
