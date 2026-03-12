from app.models import db, Inventory, Ingredient, User, Cocktail, cocktail_ingredients
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, and_
from typing import List, Optional, Dict, Any
from app.utilities.unit_conversion import standardize_quantity, can_make_cocktail


class InventoryService:

    @staticmethod
    def get_user_inventory(user_id: int) -> List[Dict[str, Any]]:
        try:
            stmt = select(Inventory).where(Inventory.user_id == user_id)
            items = db.session.execute(stmt).scalars().all()
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
        ingredient = db.session.get(Ingredient, ingredient_id)
        if not ingredient:
            raise ValueError("Ingredient not found")
        try:
            stmt = select(Inventory).where(
                and_(
                    Inventory.user_id == user_id,
                    Inventory.ingredient_id == ingredient_id
                )
            )
            existing = db.session.execute(stmt).scalar_one_or_none()
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
            stmt = select(Inventory).where(
                and_(
                    Inventory.id == item_id,
                    Inventory.user_id == user_id
                )
            )
            item = db.session.execute(stmt).scalar_one_or_none()
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
            stmt = select(Inventory).where(
                and_(
                    Inventory.id == item_id,
                    Inventory.user_id == user_id
                )
            )
            item = db.session.execute(stmt).scalar_one_or_none()
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
            stmt = select(Inventory).where(Inventory.user_id == user_id)
            inventory_items = db.session.execute(stmt).scalars().all()
            user_inventory = {}
            for item in inventory_items:
                standardized_amount, unit_type = standardize_quantity(f"{item.quantity} {item.unit}")
                if standardized_amount > 0:
                    user_inventory[item.ingredient_id] = (standardized_amount, unit_type)
            if not user_inventory:
                return []
            stmt = select(Cocktail)
            cocktails = db.session.execute(stmt).scalars().all()
            available_cocktails = []
            for cocktail in cocktails:
                cocktail_ingredients_data = []
                for ingredient in cocktail.ingredients:
                    result = db.session.execute(
                        select(cocktail_ingredients.c.quantity).where(
                            and_(
                                cocktail_ingredients.c.cocktail_id == cocktail.id,
                                cocktail_ingredients.c.ingredient_id == ingredient.id
                            )
                        )
                    ).scalar()
                    cocktail_ingredients_data.append({
                        'ingredient_id': ingredient.id,
                        'quantity': result or ''
                    })
                can_make, missing = can_make_cocktail(cocktail_ingredients_data, user_inventory)
                if can_make:
                    available_cocktails.append(cocktail.to_dict())
            return available_cocktails
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching available cocktails: {str(e)}")

    @staticmethod
    def get_missing_ingredients(user_id: int, cocktail_id: int) -> List[Dict[str, Any]]:
        try:
            cocktail = db.session.get(Cocktail, cocktail_id)
            if not cocktail:
                return []
            stmt = select(Inventory).where(Inventory.user_id == user_id)
            inventory_items = db.session.execute(stmt).scalars().all()
            user_inventory = {}
            for item in inventory_items:
                standardized_amount, unit_type = standardize_quantity(f"{item.quantity} {item.unit}")
                if standardized_amount > 0:
                    user_inventory[item.ingredient_id] = (standardized_amount, unit_type)
            missing = []
            for ingredient in cocktail.ingredients:
                result = db.session.execute(
                    select(cocktail_ingredients.c.quantity).where(
                        and_(
                            cocktail_ingredients.c.cocktail_id == cocktail_id,
                            cocktail_ingredients.c.ingredient_id == ingredient.id
                        )
                    )
                ).scalar()
                required_amount, required_type = standardize_quantity(result or '')
                if required_type == 'special':
                    continue
                available_info = user_inventory.get(ingredient.id, (0, required_type))
                available_amount, available_type = available_info
                if available_type != required_type or available_amount < required_amount:
                    missing.append({
                        'id': ingredient.id,
                        'name': ingredient.name,
                        'category': ingredient.category,
                        'subcategory': ingredient.subcategory,
                        'abv': ingredient.abv,
                        'required': result,
                        'required_standardized': required_amount,
                        'available_standardized': available_amount if available_type == required_type else 0,
                        'unit_type': required_type
                    })
            return missing
        except SQLAlchemyError as e:
            raise Exception(f"Error checking missing ingredients: {str(e)}")

    @staticmethod
    def make_cocktail(user_id: int, cocktail_id: int, servings: int = 1) -> Dict[str, Any]:
        try:
            cocktail = db.session.get(Cocktail, cocktail_id)
            if not cocktail:
                return {'error': 'Cocktail not found'}
            stmt = select(Inventory).where(Inventory.user_id == user_id)
            inventory_items = db.session.execute(stmt).scalars().all()
            user_inventory = {}
            inventory_map = {}
            for item in inventory_items:
                standardized_amount, unit_type = standardize_quantity(f"{item.quantity} {item.unit}")
                if standardized_amount > 0:
                    user_inventory[item.ingredient_id] = (standardized_amount, unit_type)
                    inventory_map[item.ingredient_id] = item
            missing = []
            insufficient = []
            for ingredient in cocktail.ingredients:
                result = db.session.execute(
                    select(cocktail_ingredients.c.quantity).where(
                        and_(
                            cocktail_ingredients.c.cocktail_id == cocktail_id,
                            cocktail_ingredients.c.ingredient_id == ingredient.id
                        )
                    )
                ).scalar()
                base_required_amount, required_type = standardize_quantity(result or '0 ml')
                if required_type == 'special':
                    continue
                required_amount = base_required_amount * servings
                if ingredient.id not in user_inventory:
                    missing.append(ingredient.name)
                    continue
                available_amount, available_type = user_inventory[ingredient.id]
                if available_type != required_type:
                    missing.append(ingredient.name)
                    continue
                if available_amount < required_amount:
                    insufficient.append({
                        'name': ingredient.name,
                        'required': round(required_amount, 1),
                        'available': round(available_amount, 1),
                        'unit_type': required_type
                    })
            if missing:
                return {'error': f'Missing ingredients: {", ".join(missing)}'}
            if insufficient:
                details = "; ".join([
                    f"{item['name']} (need {item['required']} {item['unit_type']}, have {item['available']} {item['unit_type']})"
                    for item in insufficient
                ])
                return {'error': f'Insufficient quantities: {details}'}

            for ingredient in cocktail.ingredients:
                result = db.session.execute(
                    select(cocktail_ingredients.c.quantity).where(
                        and_(
                            cocktail_ingredients.c.cocktail_id == cocktail_id,
                            cocktail_ingredients.c.ingredient_id == ingredient.id
                        )
                    )
                ).scalar()
                base_required_amount, required_type = standardize_quantity(result or '0 ml')
                if required_type == 'special':
                    continue
                required_amount = base_required_amount * servings
                inventory_item = inventory_map[ingredient.id]
                current_amount, current_type = user_inventory[ingredient.id]
                remaining_amount = current_amount - required_amount
                from app.utilities.unit_conversion import convert_from_base_unit
                try:
                    inventory_item.quantity = round(
                        convert_from_base_unit(remaining_amount, inventory_item.unit, current_type),
                        1
                    )
                except:
                    inventory_item.quantity = round(remaining_amount, 1)
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
