from .test_routes import test_bp
from .cocktail_routes import cocktail_bp
from .ingredient_routes import ingredient_bp

def register_routes(app):
    app.register_blueprint(test_bp)
    app.register_blueprint(cocktail_bp)
    app.register_blueprint(ingredient_bp)
