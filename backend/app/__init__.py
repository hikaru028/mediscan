from flask import Flask
from flask_cors import CORS
from flask_session import Session
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from app.models import db
from app.config import Config
import pymysql
import os
import pandas as pd
from app.recognition_routes import bp as recognition_bp
from app.migrate_routes import process_data

pymysql.install_as_MySQLdb()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialise extensions
    db.init_app(app)
    bcrypt = Bcrypt(app)
    
    # Configure CORS
    CORS(app, supports_credentials=True, origins=[
        'http://localhost:3000',         # For web app running on the same machine
        'http://192.168.1.5:3000',       # For web app accessed via local IP
        'http://192.168.1.5',            # For mobile app accessing the backend via IP
        'http://130.216.13.0',
        'http://localhost:8081'
    ])

    app.config['SESSION_SQLALCHEMY'] = db
    Session(app)

    Migrate(app, db)

    with app.app_context():
        db.create_all()
        # import csv file
        csv_file_path = 'data/mediscan.csv'
        if os.path.exists(csv_file_path):
            try:
                excel_data = pd.read_csv(csv_file_path, encoding='ISO-8859-1', usecols=[
                    'product_id', 
                    'product_name',
                    'brand_name', 
                    'generic_name',
                    'manufacturer', 
                    'price', 
                    'description',
                    'warnings',
                    'dosage',
                    'active_ingredients',
                    'therapeutic_class',    
                    'formulation',    
                    'systemic_category',
                    'usage_duration',
                    'target_population',
                    'drug_class',
                    'strength',
                    'route_of_administration',
                    'indications',    
                    'side_effects',
                    'interactions',
                    'storage_conditions',
                    'approval_date',
                    'expiry_date',
                    'batch_number',
                ])
                
                session = db.session
                process_data(session, excel_data)
                session.commit()
            except Exception as e:
                print(f"Error importing CSV data: {e}")
        else:
            print(f"CSV file not found at {csv_file_path}")

    # Import and register blueprints
    from app.auth_routes import bp as auth_bp
    app.register_blueprint(auth_bp)

    from app.contact_routes import bp as contact_bp
    app.register_blueprint(contact_bp)

    from app.product_routes import bp as product_bp
    app.register_blueprint(product_bp)
    
    from app.cart_routes import bp as cart_bp
    app.register_blueprint(cart_bp)
    
    from app.email_routes import bp as email_bp
    app.register_blueprint(email_bp)
    
    from app.order_routes import bp as order_bp
    app.register_blueprint(order_bp)
    
    from app.migrate_routes import bp as migrate_bp
    app.register_blueprint(migrate_bp)

    app.register_blueprint(recognition_bp) 

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)