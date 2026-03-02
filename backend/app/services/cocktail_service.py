from app.models import db, Cocktail, Ingredient, cocktail_ingredients
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional, Dict, Any

class CocktailService:
    @staticmethod
    def get_all_cocktails() -> List[Cocktail]:
        try:
            cocktails = Cocktail.query.all()
            return [cocktail.to_dict() for cocktail in cocktails]
        except SQLAlchemyError as e:
            raise Exception(f'Error fetching cocktails: {str(e)}')

    @staticmethod
    def get_cocktail_by_id(cocktail_id: int) -> Optional[Cocktail]:
        try:
            cocktail = Cocktail.query.get(cocktail_id)
            if cocktail:
                return cocktail.to_dict(include_ingredients=True)
            return None
        except SQLAlchemyError as e:
            raise Exception(f'Error fetching cocktail: {str(e)}')

    @staticmethod
    def create_cocktail(data: Dict[str, Any]) -> Cocktail:
        if not data.get('name'):
            raise ValueError("Cocktail name is required")
        if not data.get('instructions'):
            raise ValueError("Instructions are required")
        try:
            new_cocktail = Cocktail(
                name = data['name'],
                description = data.get('description', ''),
                instructions = data['instructions'],
                glass_type = data.get('glass_type', ''),
                garnish = data.get('garnish', ''),
                difficulty = data.get('difficulty', 'Medium'),
                servings = data.get('servings', 1)
            )
            db.session.add(new_cocktail)
            db.session.flush()
            ingredient_quantities = data.get('ingredient_quantities', [])
            for item in ingredient_quantities:
                ingredient_id = item.get('id')
                quantity = item.get('quantity', '').strip()
                if ingredient_id:
                    db.session.execute(
                        cocktail_ingredients.insert().values(
                            cocktail_id = new_cocktail.id,
                            ingredient_id = ingredient_id,
                            quantity = quantity
                        )
                    )
            db.session.commit()
            return new_cocktail
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f'Error creating cocktail: {str(e)}')

    @staticmethod
    def update_cocktail(cocktail_id: int, data: Dict[str, Any]) -> Optional[Cocktail]:
        cocktail = Cocktail.query.get(cocktail_id)
        if not cocktail:
            return None
        try:
            if 'name' in data:
                cocktail.name = data['name']
            if 'description' in data:
                cocktail.description = data['description']
            if 'instructions' in data:
                cocktail.instructions = data['instructions']
            if 'glass_type' in data:
                cocktail.glass_type = data['glass_type']
            if 'garnish' in data:
                cocktail.garnish = data['garnish']
            if 'difficulty' in data:
                cocktail.difficulty = data['difficulty']
            if 'ingredient_quantities' in data:
                db.session.execute(
                    cocktail_ingredients.delete().where(
                        cocktail_ingredients.c.cocktail_id == cocktail_id
                    )
                )
                for item in data['ingredient_quantities']:
                    ingredient_id = item.get('id')
                    quantity = item.get('quantity', '').strip()
                    if ingredient_id:
                        db.session.execute(
                            cocktail_ingredients.insert().values(
                                cocktail_id=cocktail_id,
                                ingredient_id=ingredient_id,
                                quantity=quantity
                            )
                        )
            db.session.commit()
            return cocktail
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f'Error updating cocktail: {str(e)}')

    @staticmethod
    def delete_cocktail(cocktail_id: int) -> Optional[Cocktail]:
        cocktail = Cocktail.query.get(cocktail_id)
        if not cocktail:
            return None
        try:
            db.session.delete(cocktail)
            db.session.commit()
            return cocktail
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f'Error deleting cocktail: {str(e)}')

    @staticmethod
    def search_cocktails(query: str) -> List[Cocktail]:
        try:
            return Cocktail.query.filter(
                Cocktail.name.ilike(f'%{query}%')
            ).all()
        except SQLAlchemyError as e:
            raise Exception(f'Error searching cocktails: {str(e)}')

    @staticmethod
    def get_cocktails_by_ingredient(ingredient_id: int) -> List[Cocktail]:
        try:
            ingredient = Ingredient.query.get(ingredient_id)
            if not ingredient:
                return []
            return ingredient.cocktails.all()
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching cocktails by ingredient: {str(e)}")

    @staticmethod
    def get_cocktails_by_difficulty(difficulty: str) -> List[Cocktail]:
        try:
            return Cocktail.query.filter_by(difficulty = difficulty).all()
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching cocktails by difficulty: {str(e)}")
