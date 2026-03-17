from typing import Tuple, Literal, cast

UnitType = Literal['volume', 'mass', 'count', 'special', 'unknown']

VOLUME_CONVERSIONS = {
    'ml': 1, 'l': 1000, 'cl': 10, 'oz': 29.5735,
    'cup': 236.588, 'tsp': 4.92892, 'tbsp': 14.7868,
    'dash': 0.616, 'dashes': 0.616,
    'splash': 7.5, 'splashes': 7.5,
    'drop': 0.05, 'drops': 0.05,
}

MASS_CONVERSIONS = {
    'g': 1, 'kg': 1000,
    'oz(weight)': 28.3495, 'lb': 453.592,
}

COUNT_CONVERSIONS = {
    'piece': 1, 'pieces': 1,
    'cube': 1, 'cubes': 1,
    'leaf': 1, 'leaves': 1,
    'slice': 1, 'slices': 1,
    'wedge': 1, 'wedges': 1,
    'egg': 1, 'eggs': 1,
    'bottle': 1, 'bottles': 1,
    'can': 1, 'cans': 1,
}

UNIT_TYPE_MAP: dict[str, UnitType] = {
    'ml': 'volume', 'l': 'volume', 'cl': 'volume', 'oz': 'volume',
    'cup': 'volume', 'tsp': 'volume', 'tbsp': 'volume',
    'dash': 'volume', 'dashes': 'volume',
    'splash': 'volume', 'splashes': 'volume',
    'drop': 'volume', 'drops': 'volume',
    'g': 'mass', 'kg': 'mass', 'oz(weight)': 'mass', 'lb': 'mass',
    'piece': 'count', 'pieces': 'count',
    'cube': 'count', 'cubes': 'count',
    'leaf': 'count', 'leaves': 'count',
    'slice': 'count', 'slices': 'count',
    'wedge': 'count', 'wedges': 'count',
    'egg': 'count', 'eggs': 'count',
    'bottle': 'count', 'bottles': 'count',
    'can': 'count', 'cans': 'count',
}

def get_unit_type(unit: str) -> UnitType:
    return UNIT_TYPE_MAP.get(unit, 'unknown')

def convert_to_base_unit(amount: float, unit: str, unit_type: UnitType) -> float:
    if unit_type == 'volume':
        return amount * VOLUME_CONVERSIONS.get(unit, 0)
    elif unit_type == 'mass':
        return amount * MASS_CONVERSIONS.get(unit, 0)
    elif unit_type == 'count':
        return amount * COUNT_CONVERSIONS.get(unit, 0)
    return 0

def convert_from_base_unit(amount: float, target_unit: str, unit_type: UnitType) -> float:
    if unit_type == 'volume':
        factor = VOLUME_CONVERSIONS.get(target_unit, 1)
    elif unit_type == 'mass':
        factor = MASS_CONVERSIONS.get(target_unit, 1)
    elif unit_type == 'count':
        factor = COUNT_CONVERSIONS.get(target_unit, 1)
    else:
        return amount
    return amount / factor if factor else amount

def can_make_cocktail(cocktail_ingredients: list, user_inventory: dict) -> Tuple[bool, list]:
    missing = []
    for ingredient in cocktail_ingredients:
        ingredient_id = ingredient['ingredient_id']
        amount = ingredient.get('amount', 0)
        unit_type = ingredient.get('unit_type', 'unknown')
        if unit_type == 'unknown':
            continue
        if amount == 0:
            continue
        if ingredient_id not in user_inventory:
            missing.append(ingredient_id)
            continue
        available_amount, available_type = user_inventory[ingredient_id]
        if available_type != unit_type:
            missing.append(ingredient_id)
            continue
        if available_amount < amount:
            missing.append(ingredient_id)

    return (len(missing) == 0, missing)
