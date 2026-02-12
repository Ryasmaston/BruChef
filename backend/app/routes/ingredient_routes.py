from flask import Blueprint, jsonify, request
from ..services.ingredient_service import IngredientService

ingredient_bp = Blueprint("ingredients", __name__, url_prefix="/api/ingredients")

@ingredient_bp.route("/", methods=["GET"])
def get_ingredients():
    try:
        ingredients = IngredientService.get_all_ingredients()
        return jsonify([ingredient.to_dict() for ingredient in ingredients]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ingredient_bp.route("/<int:ingredient_id>", methods=["GET"])
def get_ingredient(ingredient_id):
    try:
        ingredient = IngredientService.get_ingredient_by_id(ingredient_id)
        if not ingredient:
            return jsonify({"error": "Ingredient not found"}), 404
        return jsonify(ingredient.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ingredient_bp.route("/", methods=["POST"])
def create_ingredient():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data given"}), 400
        new_ingredient = IngredientService.create_ingredient(data)
        return jsonify(new_ingredient.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ingredient_bp.route("/<int:ingredient_id>", methods=["PUT"])
def update_ingredient(ingredient_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data given"}), 400
        updated_ingredient = IngredientService.update_ingredient(ingredient_id, data)
        if not updated_ingredient:
            return jsonify({"error": "Ingredient not found"}), 404
        return jsonify(updated_ingredient.to_dict()), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ingredient_bp.route("/<int:ingredient_id>", methods=["DELETE"])
def delete_ingredient(ingredient_id):
    try:
        deleted = IngredientService.delete_ingredient(ingredient_id)

        if not deleted:
            return jsonify({"error": "Ingredient not found"}), 404

        return jsonify({"message": "Ingredient deleted successfully"}), 200
    except Exception as e:
            return jsonify({"error": str(e)}), 500

@ingredient_bp.route("/categories", methods=["GET"])
def get_categories():
    try:
        categories = IngredientService.get_all_categories()
        return jsonify(categories), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ingredient_bp.route("/by-category/<string:category>", methods=["GET"])
def get_ingredients_by_category(category):
    try:
        ingredients = IngredientService.get_ingredients_by_category(category)
        return jsonify([ingredient.to_dict() for ingredient in ingredients]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ingredient_bp.route("/search", methods=["GET"])
def search_ingredients():
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({"error": "Search query is required"}), 400
        ingredients = IngredientService.search_ingredients(query)
        return jsonify([ingredient.to_dict() for ingredient in ingredients]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ingredient_bp.route("/<int:ingredient_id>/cocktails", methods=["GET"])
def get_cocktails_using_ingredient(ingredient_id):
    try:
        cocktails = IngredientService.get_cocktails_using_ingredient(ingredient_id)
        return jsonify([cocktail.to_dict() for cocktail in cocktails]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ingredient_bp.route("/alcoholic", methods=["GET"])
def get_alcoholic_ingredients():
    try:
        ingredients = IngredientService.get_alcoholic_ingredients()
        return jsonify([ingredient.to_dict() for ingredient in ingredients]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ingredient_bp.route("/non-alcoholic", methods=["GET"])
def get_non_alcoholic_ingredients():
    try:
        ingredients = IngredientService.get_non_alcoholic_ingredients()
        return jsonify([ingredient.to_dict() for ingredient in ingredients]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
