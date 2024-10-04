from flask import current_app
import jwt

blacklist = set()

def generate_jwt(data):
    token = jwt.encode(data, current_app.config['SECRET_KEY'], algorithm='HS256')
    return token

def blacklist_jwt(token):
    return token in blacklist