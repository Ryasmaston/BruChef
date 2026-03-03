from app.models import db, Inventory, Ingredient, User, Cocktail, cocktail_ingredients
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional, Dict, Any
from app.utilities.unit_conversion import standardize_quantity, can_make_cocktail

class InventoryService:

    @staticmethod
    def get_user_inventory(user_id: int) -> List[Dict[str, Any]]:
        try:
            items = Inventory.query.filter_by(user_id=user_id).all()
            return [item.to_dict() for item in items]
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching inventory: {str(e)}")

    @staticmethod
    def add_to_inventory(user_id: int, data: Dict[str, Any]) -> Inventory:
        ingredient_id = data.get('ingredient_id')
        quantity = data.get('quantity', 0.0)
        unit = data.get('unit', 'ml')
        notes = data.get('notes', '')
        if not ingredient_id:
            raise ValueError("Ingredient ID is required")
        ingredient = Ingredient.query.get(ingredient_id)
        if not ingredient:
            raise ValueError("Ingredient not found")
        try:
            existing = Inventory.query.filter_by(
                user_id=user_id,
                ingredient_id=ingredient_id
            ).first()
            if existing:
                existing.quantity = quantity
                existing.unit = unit
                existing.notes = notes
                db.session.commit()
                return existing
            else:
                new_item = Inventory(
                    user_id=user_id,
                    ingredient_id=ingredient_id,
                    quantity=quantity,
                    unit=unit,
                    notes=notes
                )
                db.session.add(new_item)
                db.session.commit()
                return new_item
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error adding to inventory: {str(e)}")

    @staticmethod
    def update_inventory_item(user_id: int, item_id: int, data: Dict[str, Any]) -> Optional[Inventory]:
        try:
            item = Inventory.query.filter_by(id=item_id, user_id=user_id).first()
            if not item:
                return None
            if 'quantity' in data:
                item.quantity = data['quantity']
            if 'unit' in data:
                item.unit = data['unit']
            if 'notes' in data:
                item.notes = data['notes']
            db.session.commit()
            return item
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error updating inventory: {str(e)}")

    @staticmethod
    def remove_from_inventory(user_id: int, item_id: int) -> bool:
        try:
            item = Inventory.query.filter_by(id=item_id, user_id=user_id).first()
            if not item:
                return False
            db.session.delete(item)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error removing from inventory: {str(e)}")

    @staticmethod
    def get_available_cocktails(user_id: int) -> List[Dict[str, Any]]:
            try:
                inventory_items = Inventory.query.filter_by(user_id=user_id).all()
                user_inventory_ml = {}
                for item in inventory_items:
                    quantity_ml = standardize_quantity(f"{item.quantity} {item.unit}")
                    if quantity_ml > 0:
                        user_inventory_ml[item.ingredient_id] = quantity_ml
                if not user_inventory_ml:
                    return []
                cocktails = Cocktail.query.all()
                available_cocktails = []
                for cocktail in cocktails:
                    cocktail_ingredients_data = []
                    for ingredient in cocktail.ingredients:
                        result = db.session.execute(
                            db.select(cocktail_ingredients.c.quantity).where(
                                db.and_(
                                    cocktail_ingredients.c.cocktail_id == cocktail.id,
                                    cocktail_ingredients.c.ingredient_id == ingredient.id
                                )
                            )
                        ).scalar()
                        cocktail_ingredients_data.append({
                            'ingredient_id': ingredient.id,
                            'quantity': result or ''
                        })
                    can_make, missing = can_make_cocktail(cocktail_ingredients_data, user_inventory_ml)
                    if can_make:
                        available_cocktails.append(cocktail.to_dict())
                return available_cocktails
            except SQLAlchemyError as e:
                raise Exception(f"Error fetching available cocktails: {str(e)}")

    @staticmethod
    def get_missing_ingredients(user_id: int, cocktail_id: int) -> List[Dict[str, Any]]:
            try:
                cocktail = Cocktail.query.get(cocktail_id)
                if not cocktail:
                    return []
                inventory_items = Inventory.query.filter_by(user_id=user_id).all()
                user_inventory_ml = {}
                for item in inventory_items:
                    quantity_ml = standardize_quantity(f"{item.quantity} {item.unit}")
                    if quantity_ml > 0:
                        user_inventory_ml[item.ingredient_id] = quantity_ml
                missing = []
                for ingredient in cocktail.ingredients:
                    result = db.session.execute(
                        db.select(cocktail_ingredients.c.quantity).where(
                            db.and_(
                                cocktail_ingredients.c.cocktail_id == cocktail_id,
                                cocktail_ingredients.c.ingredient_id == ingredient.id
                            )
                        )
                    ).scalar()
                    required_ml = standardize_quantity(result or '')
                    available_ml = user_inventory_ml.get(ingredient.id, 0)
                    if available_ml < required_ml:
                        missing.append({
                            'id': ingredient.id,
                            'name': ingredient.name,
                            'category': ingredient.category,
                            'subcategory': ingredient.subcategory,
                            'abv': ingredient.abv,
                            'required': result,
                            'required_ml': required_ml,
                            'available_ml': available_ml,
                            'shortage_ml': required_ml - available_ml
                        })
                return missing
            except SQLAlchemyError as e:
                raise Exception(f"Error checking missing ingredients: {str(e)}")

    @staticmethod
    def make_cocktail(user_id: int, cocktail_id: int, servings: int = 1) -> Dict[str, Any]:
        try:
            cocktail = Cocktail.query.get(cocktail_id)
            if not cocktail:
                return {'error': 'Cocktail not found'}
            inventory_items = Inventory.query.filter_by(user_id=user_id).all()
            user_inventory_ml = {}
            inventory_map = {}
            for item in inventory_items:
                quantity_ml = standardize_quantity(f"{item.quantity} {item.unit}")
                if quantity_ml > 0:
                    user_inventory_ml[item.ingredient_id] = quantity_ml
                    inventory_map[item.ingredient_id] = item
            missing = []
            insufficient = []
            for ingredient in cocktail.ingredients:
                result = db.session.execute(
                    db.select(cocktail_ingredients.c.quantity).where(
                        db.and_(
                            cocktail_ingredients.c.cocktail_id == cocktail_id,
                            cocktail_ingredients.c.ingredient_id == ingredient.id
                        )
                    )
                ).scalar()
                base_required_ml = standardize_quantity(result or '0 ml')
                required_ml = base_required_ml * servings
                if ingredient.id not in user_inventory_ml:
                    missing.append(ingredient.name)
                    continue
                available_ml = user_inventory_ml[ingredient.id]
                if available_ml < required_ml:
                    insufficient.append({
                        'name': ingredient.name,
                        'required_ml': round(required_ml, 1),
                        'available_ml': round(available_ml, 1),
                        'shortage_ml': round(required_ml - available_ml, 1)
                    })
            if missing:
                return {
                    'error': f'Missing ingredients: {", ".join(missing)}'
                }
            if insufficient:
                details = "; ".join([
                    f"{item['name']} (need {item['required_ml']} ml, have {item['available_ml']} ml)"
                    for item in insufficient
                ])
                return {
                    'error': f'Insufficient quantities: {details}'
                }
            for ingredient in cocktail.ingredients:
                # Get quantity needed
                result = db.session.execute(
                    db.select(cocktail_ingredients.c.quantity).where(
                        db.and_(
                            cocktail_ingredients.c.cocktail_id == cocktail_id,
                            cocktail_ingredients.c.ingredient_id == ingredient.id
                        )
                    )
                ).scalar()

                base_required_ml = standardize_quantity(result or '0 ml')
                required_ml = base_required_ml * servings

                # Get the inventory item
                inventory_item = inventory_map[ingredient.id]

                # Get current quantity in ml
                current_ml = user_inventory_ml[ingredient.id]

                # Calculate remaining
                remaining_ml = current_ml - required_ml

                # Convert back to user's preferred unit
                if inventory_item.unit == 'ml':
                    inventory_item.quantity = remaining_ml
                elif inventory_item.unit == 'oz':
                    inventory_item.quantity = remaining_ml / 29.5735
                elif inventory_item.unit == 'L':
                    inventory_item.quantity = remaining_ml / 1000
                elif inventory_item.unit == 'cup':
                    inventory_item.quantity = remaining_ml / 236.588
                elif inventory_item.unit == 'cl':
                    inventory_item.quantity = remaining_ml / 10
                elif inventory_item.unit == 'tsp':
                    inventory_item.quantity = remaining_ml / 4.92892
                elif inventory_item.unit == 'tbsp':
                    inventory_item.quantity = remaining_ml / 14.7868
                else:
                    # Unknown unit, keep as ml
                    inventory_item.quantity = remaining_ml
                    inventory_item.unit = 'ml'

                # If quantity is very low, remove from inventory
                if inventory_item.quantity <= 0.1:
                    db.session.delete(inventory_item)
            db.session.commit()
            return {
                'message': f'Made {cocktail.name}! Ingredients deducted from inventory.',
                'servings': servings,
                'cocktail': cocktail.name
            }
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error making cocktail: {str(e)}")
