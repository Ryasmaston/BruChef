from flask import Blueprint, jsonify, request
from ..models import db, Ingredient

ingredient_bp = Blueprint("ingredients", __name__, url_prefix="/api/ingredients")

@ingredient_bp.route("/", methods=["GET"])
def get_ingredients():
    """Get all ingredients"""
    ingredients = Ingredient.query.all()
    return jsonify([ingredient.to_dict() for ingredient in ingredients])

@ingredient_bp.route("/<int:ingredient_id>", methods=["GET"])
def get_ingredient(ingredient_id):
    """Get a specific ingredient by ID"""
    ingredient = Ingredient.query.get_or_404(ingredient_id)
    return jsonify(ingredient.to_dict())

@ingredient_bp.route("/", methods=["POST"])
def create_ingredient():
    """Create a new ingredient"""
    data = request.get_json()

    new_ingredient = Ingredient(
        name=data.get('name'),
        category=data.get('category'),
        description=data.get('description'),
        abv=data.get('abv')
    )

    db.session.add(new_ingredient)
    db.session.commit()

    return jsonify(new_ingredient.to_dict()), 201

@ingredient_bp.route("/categories", methods=["GET"])
def get_categories():
    """Get all unique ingredient categories"""
    categories = db.session.query(Ingredient.category).distinct().all()
    return jsonify([cat[0] for cat in categories if cat[0]])
