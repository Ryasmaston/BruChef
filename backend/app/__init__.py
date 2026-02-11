from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from .models import db
import os
from dotenv import load_dotenv

load_dotenv()

migrate = Migrate()

def create_app():
    app = Flask(__name__)
    CORS(app)
    database_url = os.getenv('DATABASE_URL')

    if not database_url:
        basedir = os.path.abspath(os.path.dirname(__file__))
        database_url = f'sqlite:///{os.path.join(basedir, "..", "..", "db", "bruchef.db")}'
        print("⚠️  Using SQLite - Set DATABASE_URL in .env for PostgreSQL")
    else:
        print("Using PostgreSQL database")
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

    db.init_app(app)
    migrate.init_app(app, db)
    from .routes import register_routes
    register_routes(app)
    with app.app_context():
        db.create_all()

    return app
