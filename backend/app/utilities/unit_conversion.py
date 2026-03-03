"""
unit conversion utilities for standardizing ingredient measurements, all volumes are standardized to ml
"""
import re

CONVERSIONS = {
    'ml': 1,
    'oz': 29.5735,
    'l': 1000,
    'cl': 10,
    'tsp': 4.92892,
    'tbsp': 14.7868,
    'cup': 236.588,
    'dash': 0.616,
    'dashes': 0.616,
    'splash': 7.5,
    'splashes': 7.5,
    'drop': 0.05,
    'drops': 0.05,
    'piece': 1000,
    'pieces': 1000,
    'cube': 1000,
    'cubes': 1000,
    'leaf': 1000,
    'leaves': 1000,
    'slice': 1000,
    'slices': 1000,
    'wedge': 1000,
    'wedges': 1000,
    'bottle': 750,
    'bottles': 750,
    'can': 355,
    'cans': 355,
}

def parse_quantity(quantity_str: str) -> tuple[float, str]:
    """Parse a quantity string into amount and unit"""
    if not quantity_str:
        return (0, 'unknown')
    quantity_str = quantity_str.strip().lower()
    special_cases = ['top with', 'fill', 'fill with', 'to taste', 'garnish', 'muddle']
    if any(case in quantity_str for case in special_cases):
        return (0, 'special')
    pattern = r'(\d+\.?\d*)\s*([a-z]+(?:\s+[a-z]+)?)'
    match = re.search(pattern, quantity_str)
    if not match:
        return (0, 'unknown')
    amount = float(match.group(1))
    unit = match.group(2).strip()
    unit_mappings = {
        'ounce': 'oz',
        'milliliter': 'ml',
        'liter': 'l',
        'centiliter': 'cl',
        'teaspoon': 'tsp',
        'tablespoon': 'tbsp',
        'ounces': 'oz',
        'milliliters': 'ml',
        'liters': 'l',
        'centiliters': 'cl',
        'teaspoons': 'tsp',
        'tablespoons': 'tbsp',
        'dash': 'dash',
        'dashes': 'dashes',
        'splash': 'splash',
        'splashes': 'splashes',
        'drop': 'drop',
        'drops': 'drops',
        'piece': 'pieces',
        'pieces': 'pieces',
        'cube': 'cubes',
        'cubes': 'cubes',
        'sugar cube': 'cubes',
        'sugar cubes': 'cubes',
        'leaf': 'leaves',
        'leaves': 'leaves',
        'slice': 'slices',
        'slices': 'slices',
        'wedge': 'wedges',
        'wedges': 'wedges',
        'bottle': 'bottles',
        'bottles': 'bottles',
        'can': 'cans',
        'cans': 'cans',
    }
    unit = unit_mappings.get(unit, unit)
    return (amount, unit)

def convert_to_ml(amount: float, unit: str) -> float:
    """Convert amount in given unit to ml"""
    if unit not in CONVERSIONS:
        return 0
    return amount * CONVERSIONS[unit]

def standardize_quantity(quantity_str: str) -> float:
    amount, unit = parse_quantity(quantity_str)
    if unit == 'special':
        return 0
    return convert_to_ml(amount, unit)

def can_make_cocktail(cocktail_ingredients: list, user_inventory: dict) -> tuple[bool, list]:
    missing = []
    for ingredient in cocktail_ingredients:
        ingredient_id = ingredient['ingredient_id']
        required_qty_str = ingredient.get('quantity', '')
        amount, unit = parse_quantity(required_qty_str)
        if unit == 'special':
            continue
        required_ml = standardize_quantity(required_qty_str)
        if required_ml == 0 and unit != 'special':
            required_ml = 1
        available_ml = user_inventory.get(ingredient_id, 0)
        if available_ml < required_ml:
            missing.append(ingredient_id)
    return (len(missing) == 0, missing)
