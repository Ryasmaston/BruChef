from flask import Blueprint, jsonify, request, session
from ..services.cocktail_service import CocktailService
from app.models import User


cocktail_bp = Blueprint("cocktails", __name__, url_prefix="/api/cocktails")

def require_auth():
    return session.get('user_id')

def require_admin():
    user_id = session.get('user_id')
    if not user_id:
        return None
    user = User.query.get(user_id)
    return user if user and user.is_admin else None

@cocktail_bp.route("/", methods=["GET"])
def get_cocktails():
    try:
        user_id = require_auth()
        cocktails = CocktailService.get_all_cocktails(user_id=user_id)
        return jsonify(cocktails), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/<int:cocktail_id>", methods=["GET"])
def get_cocktail(cocktail_id):
    try:
        user_id = require_auth()
        # print(f"User ID: {user_id}, Cocktail ID: {cocktail_id}")
        cocktail = CocktailService.get_cocktail_by_id(cocktail_id, user_id=user_id)
        if not cocktail:
            # print("Cocktail not found or access denied")
            return jsonify({"error": "Cocktail not found"}), 404
        return jsonify(cocktail), 200
    except Exception as e:
        # print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/", methods=["POST"])
def create_cocktail():
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data given"}), 400
        data['user_id'] = user_id
        new_cocktail = CocktailService.create_cocktail(data)
        return jsonify(new_cocktail.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@cocktail_bp.route("/<int:cocktail_id>", methods=["PUT"])
def update_cocktail(cocktail_id):
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        updated_cocktail = CocktailService.update_cocktail(cocktail_id, data, user_id)
        if not updated_cocktail:
            return jsonify({"error": "Cocktail not found"}), 404
        return jsonify(updated_cocktail.to_dict(include_ingredients=True)), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/<int:cocktail_id>", methods=["DELETE"])
def delete_cocktail(cocktail_id):
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        deleted = CocktailService.delete_cocktail(cocktail_id, user_id)
        if not deleted:
            return jsonify({"error": "Cocktail not found"}), 404
        return jsonify({"message": "Cocktail deleted successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/search", methods=["GET"])
def search_cocktails():
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({"error": "Search query is required"}), 400
        user_id = require_auth()
        cocktails = CocktailService.search_cocktails(query, user_id=user_id)
        return jsonify(cocktails), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/by-ingredient/<int:ingredient_id>", methods=["GET"])
def get_cocktails_by_ingredient(ingredient_id):
    try:
        cocktails = CocktailService.get_cocktails_by_ingredient(ingredient_id)
        return jsonify(cocktails), 200
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
        return jsonify(cocktails), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/submit/<int:cocktail_id>", methods=["POST"])
def submit_cocktail(cocktail_id):
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        cocktail = CocktailService.submit_for_review(cocktail_id, user_id)
        return jsonify(cocktail), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/pending", methods=["GET"])
def get_pending_cocktails():
    admin = require_admin()
    if not admin:
        return jsonify({"error": "Admin access required"}), 403
    try:
        cocktails = CocktailService.get_pending_cocktails()
        return jsonify(cocktails), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/approve/<int:cocktail_id>", methods=["POST"])
def approve_cocktail(cocktail_id):
    admin = require_admin()
    if not admin:
        return jsonify({"error": "Admin access required"}), 403
    try:
        cocktail = CocktailService.approve_cocktail(cocktail_id, admin.id)
        return jsonify(cocktail), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/reject/<int:cocktail_id>", methods=["POST"])
def reject_cocktail(cocktail_id):
    admin = require_admin()
    if not admin:
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    reason = data.get('reason', 'No reason provided')
    try:
        cocktail = CocktailService.reject_cocktail(cocktail_id, admin.id, reason)
        return jsonify(cocktail), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/my-cocktails", methods=["GET"])
def get_my_cocktails():
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        cocktails = CocktailService.get_user_cocktails(user_id)
        return jsonify(cocktails), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/<int:cocktail_id>/favourite", methods=['POST'])
def add_cocktail_to_favourites(cocktail_id):
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        added = CocktailService.add_cocktail_to_favourites(user_id, cocktail_id)
        return jsonify(added), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/<int:cocktail_id>/favourite", methods=['DELETE'])
def remove_cocktail_from_favourites(cocktail_id):
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        removed = CocktailService.remove_cocktail_from_favourites(user_id, cocktail_id)
        return jsonify(removed), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cocktail_bp.route("/favourite-cocktails", methods=["GET"])
def get_favourite_cocktails():
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        cocktails = CocktailService.get_user_favourite_cocktails(user_id)
        return jsonify(cocktails), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
