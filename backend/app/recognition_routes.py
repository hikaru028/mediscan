from flask import Flask, Blueprint, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
import numpy as np
import io
from PIL import Image
import requests
from flask_sqlalchemy import SQLAlchemy
import logging
from datetime import datetime
import os
from fuzzywuzzy import process
import re
from app.models import Products


# Initialize Blueprint and CORS
bp = Blueprint('recognition', __name__)
CORS(bp)

try:
    resnet_model = load_model('recognition_model/package_model.h5')
except Exception as e:
    resnet_model = None

keywords = {
    'Dosage': [
        'mg', 'microgram', 'g', 'gram', 'ml', 'cc', 'unit', 'liter', 'ounce', 'tbsp', 'tsp', 'drop',
        'IU', 'international unit', 'mcg', 'nanogram', 'picogram', 'dosis', 'caps', 'capsule',
        'dose', 'milligram', 'microgram', 'mEq', 'units'
    ],
    'Drug Type': [
        'tablet', 'capsule', 'syrup', 'liquid', 'ointment', 'cream', 'injection', 'solution',
        'suspension', 'gel', 'patch', 'spray', 'drop', 'lozenge', 'powder', 'emulsion', 'sublingual',
        'suppository', 'vaccine', 'dressing', 'inhaler', 'gargle', 'elixir', 'tab', 'Tab', 'sachet',
        'oral', 'topical', 'intraocular', 'intrauterine'
    ]
}

def extract_keywords(text_lines):
    results = []

    # Define patterns to match dosage and drug types
    dosage_pattern = re.compile('|'.join([re.escape(keyword) for keyword in keywords['Dosage']]), re.IGNORECASE)
    drug_type_pattern = re.compile('|'.join([re.escape(keyword) for keyword in keywords['Drug Type']]), re.IGNORECASE)
    for line in text_lines:
        # Find all matches in the current line
        dosage_matches = dosage_pattern.findall(line)
        drug_type_matches = drug_type_pattern.findall(line)
        # Check if both dosage and drug type keywords are found
        if dosage_matches and drug_type_matches:
            results.append(line)
    return results

def ocr_space_api(image_file, api_key='K86940160688957'):
    url = 'https://api.ocr.space/parse/image'
    headers = {'apikey': api_key}
    payload = {'scale': 'true', 'isOverlayRequired': 'true'}

    files = {'file': ('image.jpg', image_file, 'image/jpeg')}
    response = requests.post(url, headers=headers, data=payload, files=files)
    return response.json()


@bp.route('/api/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'message': 'No image file provided'}), 400

        image = request.files['image']

        if image:
            ocr_result = ocr_space_api(image)
            lines = ocr_result['ParsedResults'][0]['TextOverlay']['Lines']
            lines_with_height = [(line['LineText'], line['MaxHeight']) for line in lines]
            sorted_lines = sorted(lines_with_height, key=lambda x: x[1], reverse=True)

            search_string = ' '.join(line[0] for line in sorted_lines[:5])
            print(f"Search string: {search_string}")

            # Get all product names
            products = Products.query.all()
            product_names = [product.product_name for product in products]

            # Find the best match
            best_match, score = process.extractOne(search_string, product_names)

            if score > 70:  # Confidence threshold
                product = Products.query.filter_by(product_name=best_match).first()
                if product:
                    response_json = {
                        'image': f'https://datawithimages.s3.ap-southeast-2.amazonaws.com/images/{product.product_id}.jpg',
                        'id': product.id,
                        'productName': product.product_name,
                        'brandName': product.brand_name,
                        'genericName': product.generic_name,
                        'manufacturer': product.manufacturer,
                        'price': product.price,
                        'stock': product.stock,
                        'since': product.since.strftime('%Y-%m-%d') if isinstance(product.since, datetime) else product.since,
                        'updated': product.updated.strftime('%Y-%m-%d') if isinstance(product.updated, datetime) else product.updated,
                        'productId': product.product_id  # Add productId field
                    }
                    print(response_json)
                    return jsonify(response_json), 200
            return jsonify({'message': 'Product not found'}), 404
        else:
            return jsonify({'message': 'Failed to receive image'}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred'}), 500
    
@bp.route('/api/predict/mobile', methods=['POST'])
def predict_mobile():
    if resnet_model is None:
        return jsonify({'message': 'Model not loaded, cannot perform prediction'}), 500
    try:
        # Check if image file is in the request
        if 'image' not in request.files:
            print("No image in request.files")
            return jsonify({'message': 'No image file provided'}), 400

        image = request.files['image']
        
        if image:
            ocr_result = ocr_space_api(image)
            lines = ocr_result['ParsedResults'][0]['TextOverlay']['Lines']
            lines_with_height = [(line['LineText'], line['MaxHeight']) for line in lines]
            sorted_lines = sorted(lines_with_height, key=lambda x: x[1], reverse=True)
            search_string = ' '.join(line[0] for line in sorted_lines[:5])
            print(f"Search string: {search_string}")
            return jsonify({'predicted_class': search_string}), 200
        else:
            return jsonify({'message': 'Failed to receive image'}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'message': 'An error occurred'}), 500
    

@bp.route('/api/prescribe', methods=['POST'])
def upload_image():
    image = request.files['image']
    if image:
        ocr_result = ocr_space_api(image)
        lines = ocr_result['ParsedResults'][0]['TextOverlay']['Lines']
        text_lines = [line['LineText'] for line in lines]
        # Print all detected lines
        print("Detected Text Lines:")
        for line in text_lines:
            print(line)
        # Extract text lines that contain both dosage and drug type
        filtered_lines = extract_keywords(text_lines)
        # Return only the first result if there are any
        if filtered_lines:
            first_matching_line = filtered_lines[0]
            return jsonify({
                'predicted_class': first_matching_line
            }), 200