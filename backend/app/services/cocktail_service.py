from app.models import db, Cocktail, Ingredient
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional, Dict, Any

class CocktailService:
    @staticmethod
    def get_all_cocktails() -> List[Cocktail]:
        try:
            return Cocktail.query.all()
        except SQLAlchemyError as e:
            raise Exception(f'Error fetching cocktails: {str(e)}')

    @staticmethod
    def get_cocktail_by_id(cocktail_id: int) -> Optional[Cocktail]:
        try:
            return Cocktail.query.get(cocktail_id)
        except SQLAlchemyError as e:
            raise Exception(f'Error fetching cocktail: {str(e)}')
