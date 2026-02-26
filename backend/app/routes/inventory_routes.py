from flask import Blueprint, jsonify, request, session
from app.services.inventory_service import InventoryService

inventory_bp = Blueprint('inventory', __name__, url_prefix='/api/inventory')

def require_auth():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return user_id

@inventory_bp.route('/', methods=['GET'])
def get_inventory():
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        inventory = InventoryService.get_user_inventory(user_id)
        return jsonify(inventory), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route('/', methods=['POST'])
def add_to_inventory():
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        item = InventoryService.add_to_inventory(user_id, data)
        return jsonify(item.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route('/<int:item_id>', methods=['PUT'])
def update_inventory_item(item_id):
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        item = InventoryService.update_inventory_item(user_id, item_id, data)
        if not item:
            return jsonify({"error": "Item not found"}), 404
        return jsonify(item.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route('/<int:item_id>', methods=['DELETE'])
def remove_from_inventory(item_id):
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        success = InventoryService.remove_from_inventory(user_id, item_id)
        if not success:
            return jsonify({"error": "Item not found"}), 404
        return jsonify({"message": "Item removed from inventory"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route('/available-cocktails', methods=['GET'])
def get_available_cocktails():
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        cocktails = InventoryService.get_available_cocktails(user_id)
        return jsonify(cocktails), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@inventory_bp.route('/missing/<int:cocktail_id>', methods=['GET'])
def get_missing_ingredients(cocktail_id):
    user_id = require_auth()
    if not user_id:
        return jsonify({"error": "Authentication required"}), 401
    try:
        missing = InventoryService.get_missing_ingredients(user_id, cocktail_id)
        return jsonify(missing), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
