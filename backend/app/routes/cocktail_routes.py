from flask import Blueprint, jsonify, request
from ..services.cocktail_service import CocktailService


cocktail_bp = Blueprint("cocktails", __name__, url_prefix="/api/cocktails")

@cocktail_bp.route("/", methods=["GET"])
def get_cocktails():
    try:
        cocktails = CocktailService.get_all_cocktails()
        return jsonify([cocktail.to.dict() for cocktail in cocktails]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/<int:cocktail_id>", methods=["GET"])
def get_cocktail(cocktail_id):
    try:
        cocktail = CocktailService.get_cocktail_by_id(cocktail_id)
        if not cocktail:
            return jsonify({"error": "Cocktail not found"}), 404
        return jsonify(cocktail.to.dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)})

@cocktail_bp.route("/", methods=["POST"])
def create_cocktail():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data given"}), 400
        new_cocktail = CocktailService.create_cocktail(data)
        return jsonify(new_cocktail.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)})
    except Exception as e:
        return jsonify({"error": str(e)})


@cocktail_bp.route("/<int:cocktail_id>", methods=["PUT"])
def update_cocktail(cocktail_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data given"}), 400
        updated_cocktail = CocktailService.update_cocktail(cocktail_id, data)
        if not updated_cocktail:
            return jsonify({"error": "Cocktail not found"}), 404
        return jsonify(updated_cocktail.to_dict()), 200
    except ValueError as e:
        return jsonify({"error": str(e)}),  400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/<int:cocktail_id>", methods=["DELETE"])
def delete_cocktail(cocktail_id):
    try:
        deleted = CocktailService.delete_cocktail(cocktail_id)
        if not deleted:
            return jsonify({"error": "Cocktail not found"}), 404
        return jsonify({"message": "Cocktail deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/search", methods=["GET"])
def search_cocktails():
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({"error": "Search query is required"}), 400
        cocktails = CocktailService.search_cocktails(query)
        return jsonify([cocktail.to_dict() for cocktail in cocktails]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/by-ingredient/<int:ingredient_id>", methods=["GET"])
def get_cocktails_by_ingredient(ingredient_id):
    try:
        cocktails = CocktailService.get_cocktails_by_ingredient(ingredient_id)
        return jsonify([cocktail.to_dict() for cocktail in cocktails]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/by-difficulty/<string:difficulty>", methods=["GET"])
def get_cocktails_by_difficulty(difficulty):
    try:
        valid_difficulties = ['Easy', 'Medium', 'Advanced']
        if difficulty not in valid_difficulties:
            return jsonify({
                "error": f"Invalid difficulty. Must be one of: {', '.join(valid_difficulties)}"
            }), 400
        cocktails = CocktailService.get_cocktails_by_difficulty(difficulty)
        return jsonify([cocktail.to_dict() for cocktail in cocktails]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
