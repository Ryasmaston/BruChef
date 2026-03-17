from app.models import db, Inventory, Ingredient, User, Cocktail, cocktail_ingredients
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, and_
from typing import List, Optional, Dict, Any, Tuple
from app.utilities.unit_conversion import convert_to_base_unit, convert_from_base_unit, get_unit_type

class InventoryService:

    @staticmethod
    def _build_inventory_map(user_id: int) -> Tuple[dict, dict]:
        stmt = select(Inventory).where(Inventory.user_id == user_id)
        inventory_items = db.session.execute(stmt).scalars().all()
        direct_map: dict = {}
        for item in inventory_items:
            if not item.quantity or item.quantity <= 0:
                continue
            unit_type = get_unit_type(item.unit)
            if unit_type == 'unknown':
                continue
            standardized = convert_to_base_unit(item.quantity, item.unit, unit_type)
            direct_map[item.ingredient_id] = (standardized, unit_type)
        expanded_map = dict(direct_map)
        for ingredient_id in list(direct_map.keys()):
            ingredient = db.session.get(Ingredient, ingredient_id)
            if not ingredient:
                continue
            amounts = direct_map[ingredient_id]
            if ingredient.parent_id and ingredient.parent_id not in expanded_map:
                expanded_map[ingredient.parent_id] = amounts
            if ingredient.is_base:
                for child in ingredient.children.all():
                    if child.id not in expanded_map:
                        expanded_map[child.id] = amounts
        return expanded_map, direct_map

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
            expanded_map, _ = InventoryService._build_inventory_map(user_id)
            if not expanded_map:
                return []
            stmt = select(Cocktail).where(Cocktail.status == 'approved')
            cocktails = db.session.execute(stmt).scalars().all()
            available_cocktails = []
            for cocktail in cocktails:
                cocktail_ingredients_data = []
                for ingredient in cocktail.ingredients:
                    result = db.session.execute(
                        select(
                            cocktail_ingredients.c.quantity,
                            cocktail_ingredients.c.unit,
                            cocktail_ingredients.c.quantity_note
                        ).where(
                            db.and_(
                                cocktail_ingredients.c.cocktail_id == cocktail.id,
                                cocktail_ingredients.c.ingredient_id == ingredient.id
                            )
                        )
                    ).first()
                    if result and not result.quantity_note and result.quantity and result.unit:
                        unit_type = get_unit_type(result.unit)
                        if unit_type != 'unknown':
                            standardized = convert_to_base_unit(float(result.quantity), result.unit, unit_type)
                            cocktail_ingredients_data.append({
                                'ingredient_id': ingredient.id,
                                'amount': standardized,
                                'unit_type': unit_type
                            })
                can_make = all(
                    item['ingredient_id'] in expanded_map and
                    expanded_map[item['ingredient_id']][1] == item['unit_type'] and
                    expanded_map[item['ingredient_id']][0] >= item['amount']
                    for item in cocktail_ingredients_data
                ) if cocktail_ingredients_data else False
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
            expanded_map, _ = InventoryService._build_inventory_map(user_id)
            missing = []
            for ingredient in cocktail.ingredients:
                result = db.session.execute(
                    select(
                        cocktail_ingredients.c.quantity,
                        cocktail_ingredients.c.unit,
                        cocktail_ingredients.c.quantity_note
                    ).where(
                        db.and_(
                            cocktail_ingredients.c.cocktail_id == cocktail_id,
                            cocktail_ingredients.c.ingredient_id == ingredient.id
                        )
                    )
                ).first()
                if not result:
                    continue
                if result.quantity_note:
                    continue
                if result.quantity is None or result.unit is None:
                    continue
                unit_type = get_unit_type(result.unit)
                if unit_type == 'unknown':
                    continue
                required_amount = convert_to_base_unit(float(result.quantity), result.unit, unit_type)
                available_info = expanded_map.get(ingredient.id, (0, unit_type))
                available_amount, available_type = available_info
                if available_type != unit_type or available_amount < required_amount:
                    missing.append({
                        'id': ingredient.id,
                        'name': ingredient.name,
                        'category': ingredient.category,
                        'subcategory': ingredient.subcategory,
                        'abv': ingredient.abv,
                        'required': f"{result.quantity} {result.unit}",
                        'required_standardized': required_amount,
                        'available_standardized': available_amount if available_type == unit_type else 0,
                        'unit_type': unit_type,
                        'parent_id': ingredient.parent_id,
                        'parent_name': ingredient.parent.name if ingredient.parent else None
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
            expanded_map, direct_map = InventoryService._build_inventory_map(user_id)
            stmt = select(Inventory).where(Inventory.user_id == user_id)
            inventory_items = db.session.execute(stmt).scalars().all()
            inventory_item_map = {item.ingredient_id: item for item in inventory_items}
            missing = []
            insufficient = []
            for ingredient in cocktail.ingredients:
                result = db.session.execute(
                    select(
                        cocktail_ingredients.c.quantity,
                        cocktail_ingredients.c.unit,
                        cocktail_ingredients.c.quantity_note
                    ).where(
                        db.and_(
                            cocktail_ingredients.c.cocktail_id == cocktail_id,
                            cocktail_ingredients.c.ingredient_id == ingredient.id
                        )
                    )
                ).first()
                if not result or result.quantity_note:
                    continue
                if result.quantity is None or result.unit is None:
                    continue
                unit_type = get_unit_type(result.unit)
                if unit_type == 'unknown':
                    continue
                base_required = convert_to_base_unit(float(result.quantity), result.unit, unit_type)
                required_amount = base_required * servings
                covering_id = None
                if ingredient.id in direct_map:
                    covering_id = ingredient.id
                elif ingredient.parent_id and ingredient.parent_id in direct_map:
                    covering_id = ingredient.parent_id
                elif ingredient.is_base:
                    for child in ingredient.children.all():
                        if child.id in direct_map:
                            covering_id = child.id
                            break
                if covering_id is None:
                    missing.append(ingredient.name)
                    continue
                available_amount, available_type = direct_map[covering_id]
                if available_type != unit_type:
                    missing.append(ingredient.name)
                    continue
                if available_amount < required_amount:
                    insufficient.append({
                        'name': ingredient.name,
                        'required': round(required_amount, 1),
                        'available': round(available_amount, 1),
                        'unit_type': unit_type
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
                    select(
                        cocktail_ingredients.c.quantity,
                        cocktail_ingredients.c.unit,
                        cocktail_ingredients.c.quantity_note
                    ).where(
                        db.and_(
                            cocktail_ingredients.c.cocktail_id == cocktail_id,
                            cocktail_ingredients.c.ingredient_id == ingredient.id
                        )
                    )
                ).first()
                if not result or result.quantity_note:
                    continue
                if result.quantity is None or result.unit is None:
                    continue
                unit_type = get_unit_type(result.unit)
                if unit_type == 'unknown':
                    continue
                base_required = convert_to_base_unit(float(result.quantity), result.unit, unit_type)
                required_amount = base_required * servings
                covering_id = None
                if ingredient.id in direct_map:
                    covering_id = ingredient.id
                elif ingredient.parent_id and ingredient.parent_id in direct_map:
                    covering_id = ingredient.parent_id
                elif ingredient.is_base:
                    for child in ingredient.children.all():
                        if child.id in direct_map:
                            covering_id = child.id
                            break
                if covering_id is None:
                    continue
                inventory_item = inventory_item_map[covering_id]
                current_amount, current_type = direct_map[covering_id]
                remaining_amount = current_amount - required_amount
                try:
                    inventory_item.quantity = round(
                        convert_from_base_unit(remaining_amount, inventory_item.unit, current_type), 1
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
