from app.models import db, Ingredient, Cocktail
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from typing import List, Optional, Dict, Any

class IngredientService:
    @staticmethod
    def get_all_ingredients() -> List[Ingredient]:
        try:
            return Ingredient.query.all()
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching ingredients: {str(e)}")

    @staticmethod
    def get_ingredient_by_id(ingredient_id: int) -> Optional[Ingredient]:
        try:
            return Ingredient.query.get(ingredient_id)
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching ingredient: {str(e)}")

    @staticmethod
    def get_ingredient_by_name(name: str) -> Optional[Ingredient]
        try:
            return Ingredient.query.filter(Ingredient.name.ilike(name)).first()
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching ingredient: {str(e)}")

    @staticmethod
    def create_ingredient(data: Dict[str, Any]) -> Ingredient:
        if not data.get('name'):
            raise ValueError("Ingredient name is required")
        if IngredientService.get_ingredient_by_name(data['name']):
            raise ValueError(f"Ingredient '{data['name']}' already exists")
        try:
            new_ingredient = Ingredient(
                name = data['name'],
                category = data.get('category', ''),
                description = data.get('description', ''),
                abv = data.get('abv', 0.0)
            )
            db.session.add(new_ingredient)
            db.session.commit()
            return new_ingredient
        except IntegrityError:
            db.session.rollback()
            raise ValueError(f"Ingredient '{data['name']}' already exists")
        except SQLAlchemyError as e:
            raise Exception(f"Error creating ingredient: {str(e)}")

    @staticmethod
    def update_ingredient(ingredient_id: int, data: Dict[str, Any]) -> Optional[Ingredient]:
        ingredient = Ingredient.query.get(ingredient_id)
        if not ingredient:
            return None
        try:
            if 'name' in data and data['name'] != ingredient.name:
                if IngredientService.get_ingredient_by_name(data['name']):
                    raise ValueError(f"Ingredient '{data['name']}' already exists")
                ingredient.name = data['name']

            if 'category' in data:
                ingredient.category = data['category']
            if 'description' in data:
                ingredient.description = data['description']
            if 'abv' in data:
                ingredient.abv = data['abv']
            db.session.commit()
            return ingredient
        except IntegrityError:
            db.session.rollback()
            raise ValueError(f"Ingredient '{data.get('name')}' already exists")
        except SQLAlchemyError as e:
            raise Exception (f"Error updating ingredient: {str(e)}")


    @staticmethod
    def delete_ingredient(ingredient_id: int) -> bool:
        ingredient = Ingredient.query.get(ingredient_id)
        if not ingredient:
            return False
        try:
            db.session.delete(ingredient)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error deleting ingredient: {str(e)}")

    @staticmethod
    def get_ingredients_by_category(category: str) -> List[Ingredient]:
        try:
            return Ingredient.query.filter_by(category = category).all()
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching ingredients by category: {str(e)}")

    @staticmethod
    def get_all_categories() -> List[str]:
        try:
            categories = db.session.query(Ingredient.category).distinct().all()
            return [category[0] for category in categories if category[0]]
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching categories: {str(e)}")

    @staticmethod
    def search_ingredients(query: str) -> List[Ingredient]:
        try:
            return Ingredient.query.filter(
                Ingredient.name.ilike(f"%{query}%")
            ).all()
        except SQLAlchemyError as e:
            raise Exception(f"Error searching ingredients: {str(e)}")

    @staticmethod
    def get_cocktails_using_ingredient(ingredient_id: int) -> List[Cocktail]:
        try:
            ingredient = Ingredient.query.get(ingredient_id)
            if not ingredient:
                return []
            return ingredient.cocktails.all()
        except SQLAlchemyError as e:
            raise Exception (f"Error fetching cocktails for ingredient: {str(e)}")

    @staticmethod
    def get_alcoholic_ingredients() -> List[Ingredient]:
        try:
            return Ingredient.query.filter(Ingredient.abv > 0).all()
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching alcoholic ingredients: {str(e)}")

    @staticmethod
    def get_non_alcoholic_ingredients() -> List[Ingredient]:
        try:
            return Ingredient.query.filter(Ingredient.abv == 0).all()
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching non-alcoholic ingredients: {str(e)}")
