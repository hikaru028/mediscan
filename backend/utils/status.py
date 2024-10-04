from flask import jsonify

def handle_success(message):
    return jsonify({"message": message}), 200

def handle_error(message, status_code):
    return jsonify({"error": str(message)}), status_code