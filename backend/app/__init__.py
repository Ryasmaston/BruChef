from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from .models import db
import os
from dotenv import load_dotenv
from datetime import timedelta
from .routes import register_routes

load_dotenv()
migrate = Migrate()
def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True, origins=['http://localhost:5173', 'http://127.0.0.1:5001'])
    database_url = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
    db.init_app(app)
    migrate.init_app(app, db)
    register_routes(app)
    return app
