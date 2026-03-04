import re
from typing import Tuple, Literal

"""
unit conversion utilities for standardizing ingredient measurements
- liquids standardized to ml
- solids standardized to g
- single items standardized to pieces
"""

UnitType = Literal['volume', 'mass', 'count', 'special', 'unknown']

VOLUME_CONVERSIONS = {
    'ml': 1,
    'l': 1000,
    'cl': 10,
    'oz': 29.5735,
    'cup': 236.588,
    'tsp': 4.92892,
    'tbsp': 14.7868,
    'dash': 0.616,
    'dashes': 0.616,
    'splash': 7.5,
    'splashes': 7.5,
    'drop': 0.05,
    'drops': 0.05,
}

MASS_CONVERSIONS = {
    'g': 1,
    'kg': 1000,
    'oz(weight)': 28.3495,
    'lb': 453.592,
}

COUNT_CONVERSIONS = {
    'piece': 1,
    'pieces': 1,
    'cube': 1,
    'cubes': 1,
    'leaf': 1,
    'leaves': 1,
    'slice': 1,
    'slices': 1,
    'wedge': 1,
    'wedges': 1,
    'egg': 1,
    'eggs': 1,
    'bottle': 1,
    'bottles': 1,
    'can': 1,
    'cans': 1,
}

UNIT_TYPE_MAP = {
    'ml': 'volume',
    'l': 'volume',
    'cl': 'volume',
    'oz': 'volume',
    'cup': 'volume',
    'tsp': 'volume',
    'tbsp': 'volume',
    'dash': 'volume',
    'dashes': 'volume',
    'splash': 'volume',
    'splashes': 'volume',
    'drop': 'volume',
    'drops': 'volume',
    'g': 'mass',
    'kg': 'mass',
    'oz(weight)': 'mass',
    'lb': 'mass',
    'piece': 'count',
    'pieces': 'count',
    'cube': 'count',
    'cubes': 'count',
    'leaf': 'count',
    'leaves': 'count',
    'slice': 'count',
    'slices': 'count',
    'wedge': 'count',
    'wedges': 'count',
    'egg': 'count',
    'eggs': 'count',
    'bottle': 'count',
    'bottles': 'count',
    'can': 'count',
    'cans': 'count',
}

def parse_quantity(quantity_str: str) -> Tuple[float, str, UnitType]:
    if not quantity_str:
        return (0, '', 'unknown')
    quantity_str = quantity_str.strip().lower()
    special_cases = ['top with', 'fill', 'fill with', 'to taste', 'garnish', 'muddle']
    if any(case in quantity_str for case in special_cases):
        return (0, '', 'special')
    pattern = r'(\d+\.?\d*)\s*([a-z]+(?:\s+[a-z]+)?|\([a-z]+\))'
    match = re.search(pattern, quantity_str)
    if not match:
        return (0, '', 'unknown')
    amount = float(match.group(1))
    unit = match.group(2).strip()
    unit_mappings = {
        'ounce': 'oz',
        'ounces': 'oz',
        'milliliter': 'ml',
        'milliliters': 'ml',
        'liter': 'l',
        'liters': 'l',
        'centiliter': 'cl',
        'centiliters': 'cl',
        'teaspoon': 'tsp',
        'teaspoons': 'tsp',
        'tablespoon': 'tbsp',
        'tablespoons': 'tbsp',
        'gram': 'g',
        'grams': 'g',
        'kilogram': 'kg',
        'kilograms': 'kg',
        'pound': 'lb',
        'pounds': 'lb',
        'sugar cube': 'cubes',
        'sugar cubes': 'cubes',
        'mint leaf': 'leaves',
        'mint leaves': 'leaves',
        'egg white': 'egg',
        'egg whites': 'eggs',
        'egg yolk': 'egg',
        'egg yolks': 'eggs',
    }
    unit = unit_mappings.get(unit, unit)
    unit_type_value = UNIT_TYPE_MAP.get(unit, 'unknown')
    if unit_type_value in ('volume', 'mass', 'count', 'special', 'unknown'):
        unit_type: UnitType = unit_type_value  # type: ignore
    else:
        unit_type = 'unknown'
    return (amount, unit, unit_type)

def convert_to_base_unit(amount: float, unit: str, unit_type: UnitType) -> float:
    if unit_type == 'volume':
        return amount * VOLUME_CONVERSIONS.get(unit, 0)
    elif unit_type == 'mass':
        return amount * MASS_CONVERSIONS.get(unit, 0)
    elif unit_type == 'count':
        return amount * COUNT_CONVERSIONS.get(unit, 0)
    else:
        return 0

def standardize_quantity(quantity_str: str) -> Tuple[float, UnitType]:
    amount, unit, unit_type = parse_quantity(quantity_str)
    if unit_type == 'special':
        return (0, 'special')
    standardized = convert_to_base_unit(amount, unit, unit_type)
    return (standardized, unit_type)

def can_make_cocktail(cocktail_ingredients: list, user_inventory: dict) -> Tuple[bool, list]:
    missing = []
    for ingredient in cocktail_ingredients:
        ingredient_id = ingredient['ingredient_id']
        required_qty_str = ingredient.get('quantity', '')
        required_amount, required_type = standardize_quantity(required_qty_str)
        if required_type == 'special':
            continue
        if required_amount == 0 and required_type != 'special':
            required_amount = 1
        if ingredient_id not in user_inventory:
            missing.append(ingredient_id)
            continue
        available_amount, available_type = user_inventory[ingredient_id]
        if available_type != required_type:
            missing.append(ingredient_id)
            continue
        if available_amount < required_amount:
            missing.append(ingredient_id)

    return (len(missing) == 0, missing)

def convert_from_base_unit(amount: float, target_unit: str, unit_type: UnitType) -> float:
    if unit_type == 'volume':
        conversion_factor = VOLUME_CONVERSIONS.get(target_unit, 1)
    elif unit_type == 'mass':
        conversion_factor = MASS_CONVERSIONS.get(target_unit, 1)
    elif unit_type == 'count':
        conversion_factor = COUNT_CONVERSIONS.get(target_unit, 1)
    else:
        return amount
    return amount / conversion_factor if conversion_factor else amount
