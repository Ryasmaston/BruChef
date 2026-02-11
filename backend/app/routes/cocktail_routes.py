from flask import Blueprint, jsonify, request
from ..models import db, Cocktail

cocktail_bp = Blueprint("cocktails", __name__, url_prefix="/api/cocktails")

@cocktail_bp.route("/", methods=["GET"])
def get_cocktails():
    """Get all cocktails"""
    cocktails = Cocktail.query.all()
    return jsonify([cocktail.to_dict() for cocktail in cocktails])

@cocktail_bp.route("/<int:cocktail_id>", methods=["GET"])
def get_cocktail(cocktail_id):
    """Get a specific cocktail by ID"""
    cocktail = Cocktail.query.get_or_404(cocktail_id)
    return jsonify(cocktail.to_dict())

@cocktail_bp.route("/", methods=["POST"])
def create_cocktail():
    """Create a new cocktail"""
    data = request.get_json()

    new_cocktail = Cocktail(
        name=data.get('name'),
        description=data.get('description'),
        instructions=data.get('instructions'),
        glass_type=data.get('glass_type'),
        garnish=data.get('garnish'),
        difficulty=data.get('difficulty', 'Medium')
    )

    db.session.add(new_cocktail)
    db.session.commit()

    return jsonify(new_cocktail.to_dict()), 201

@cocktail_bp.route("/<int:cocktail_id>", methods=["PUT"])
def update_cocktail(cocktail_id):
    """Update an existing cocktail"""
    cocktail = Cocktail.query.get_or_404(cocktail_id)
    data = request.get_json()

    cocktail.name = data.get('name', cocktail.name)
    cocktail.description = data.get('description', cocktail.description)
    cocktail.instructions = data.get('instructions', cocktail.instructions)
    cocktail.glass_type = data.get('glass_type', cocktail.glass_type)
    cocktail.garnish = data.get('garnish', cocktail.garnish)
    cocktail.difficulty = data.get('difficulty', cocktail.difficulty)

    db.session.commit()

    return jsonify(cocktail.to_dict())

@cocktail_bp.route("/<int:cocktail_id>", methods=["DELETE"])
def delete_cocktail(cocktail_id):
    """Delete a cocktail"""
    cocktail = Cocktail.query.get_or_404(cocktail_id)
    db.session.delete(cocktail)
    db.session.commit()

    return jsonify({"message": "Cocktail deleted successfully"}), 200

@cocktail_bp.route("/search", methods=["GET"])
def search_cocktails():
    """Search cocktails by name"""
    query = request.args.get('q', '')
    cocktails = Cocktail.query.filter(Cocktail.name.ilike(f'%{query}%')).all()
    return jsonify([cocktail.to_dict() for cocktail in cocktails])
