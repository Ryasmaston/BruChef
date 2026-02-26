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
    'splash': 7.5,
    'drops': 0.05,
}

def parse_quantity(quantity_str: str) -> tuple[float, str]:
    if not quantity_str:
        return (0, 'unknown')
    quantity_str = quantity_str.strip().lower()
    special_cases = ['top with', 'fill', 'fill with', 'to taste', 'garnish', 'muddle']
    if any(case in quantity_str for case in special_cases):
        return (0, 'unknown')
    pattern = r'(\d+\.?\d*)\s*([a-z]+)'
    match = re.search(pattern, quantity_str)
    if not match:
        return (0, 'unknown')
    amount = float(match.group(1))
    unit = match.group(2)

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
        'dashes': 'dash',
        'splashes': 'splash',
        'drop': 'drops',
    }
    unit = unit_mappings.get(unit, unit)
    return (amount, unit)

def convert_to_ml(amount: float, unit: str) -> float:
    if unit not in CONVERSIONS:
        return 0  # Unknown unit, can't convert
    return amount * CONVERSIONS[unit]

def standardize_quantity(quantity_str: str) -> float:
    amount, unit = parse_quantity(quantity_str)
    return convert_to_ml(amount, unit)

def can_make_cocktail(cocktail_ingredients: list, user_inventory: dict) -> tuple[bool, list]:
    missing = []
    for i in cocktail_ingredients:
        ingredient_id = i['ingredient_id']
        required_ml = standardize_quantity(i.get('quantity', ''))
        if required_ml == 0:
            required_ml = 1
        available_ml = user_inventory.get(ingredient_id, 0)
        if available_ml < required_ml:
            missing.append(ingredient_id)
    return (len(missing) == 0, missing)
