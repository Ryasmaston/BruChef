from app.models import db, User, Cocktail, Ingredient, cocktail_ingredients, favourites
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, or_
from typing import List, Optional, Dict, Any
from datetime import datetime

class CocktailService:
    @staticmethod
    def get_all_cocktails(user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        try:
            if user_id:
                stmt = select(Cocktail).where(
                    or_(
                        Cocktail.status == 'approved',
                        Cocktail.user_id == user_id
                    )
                )
                cocktails = db.session.execute(stmt).scalars().all()
            else:
                stmt = select(Cocktail).where(Cocktail.status == 'approved')
                cocktails = db.session.execute(stmt).scalars().all()
            return [c.to_dict(include_ingredients=True) for c in cocktails]
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching cocktails: {str(e)}")

    @staticmethod
    def get_cocktail_by_id(cocktail_id: int, user_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        try:
            cocktail = db.session.get(Cocktail, cocktail_id)
            if not cocktail:
                return None
            is_admin = False
            if user_id:
                user = db.session.get(User, user_id)
                is_admin = user and user.is_admin
            if cocktail.status == 'approved':
                return cocktail.to_dict(include_ingredients=True)
            if is_admin:
                return cocktail.to_dict(include_ingredients=True)
            if user_id and cocktail.user_id == user_id:
                return cocktail.to_dict(include_ingredients=True)
            return None
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching cocktail: {str(e)}")

    @staticmethod
    def create_cocktail(data: Dict[str, Any]) -> Cocktail:
        if not data.get('name'):
            raise ValueError("Cocktail name is required")
        if not data.get('instructions'):
            raise ValueError("Instructions are required")
        if not data.get('ingredients'):
            raise ValueError("At least one ingredient is required")
        try:
            new_cocktail = Cocktail(
                name=data['name'],
                description=data.get('description', ''),
                instructions=data['instructions'],
                glass_type=data.get('glass_type', ''),
                garnish=data.get('garnish', ''),
                difficulty=data.get('difficulty', 'Medium'),
                servings=data.get('servings', 1),
                user_id=data.get('user_id'),
                status='private'
            )
            db.session.add(new_cocktail)
            db.session.flush()
            for ing_data in data['ingredients']:
                ingredient_id = ing_data.get('ingredient_id')
                quantity = ing_data.get('quantity', '')
                ingredient = db.session.get(Ingredient, ingredient_id)
                if not ingredient:
                    raise ValueError(f"Ingredient with id {ingredient_id} not found")
                db.session.execute(
                    cocktail_ingredients.insert().values(
                        cocktail_id=new_cocktail.id,
                        ingredient_id=ingredient_id,
                        quantity=quantity
                    )
                )
            db.session.commit()
            return new_cocktail
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error creating cocktail: {str(e)}")

    @staticmethod
    def can_user_edit_cocktail(cocktail_id: int, user_id: int) -> bool:
        try:
            cocktail = db.session.get(Cocktail, cocktail_id)
            if not cocktail:
                return False
            user = db.session.get(User, user_id)
            if not user:
                return False
            if user.is_admin:
                return True
            if cocktail.user_id == user_id:
                return True
            return False
        except SQLAlchemyError:
            return False

    @staticmethod
    def update_cocktail(cocktail_id: int, data: Dict[str, Any], user_id: int) -> Optional[Cocktail]:
        try:
            if not CocktailService.can_user_edit_cocktail(cocktail_id, user_id):
                raise ValueError("You don't have permission to edit this cocktail")
            cocktail = db.session.get(Cocktail, cocktail_id)
            if not cocktail:
                return None
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
            if 'servings' in data:
                cocktail.servings = data['servings']
            if 'ingredients' in data:
                db.session.execute(
                    cocktail_ingredients.delete().where(
                        cocktail_ingredients.c.cocktail_id == cocktail_id
                    )
                )
                for ing_data in data['ingredients']:
                    ingredient_id = ing_data.get('ingredient_id')
                    quantity = ing_data.get('quantity', '')
                    ingredient = db.session.get(Ingredient, ingredient_id)
                    if not ingredient:
                        raise ValueError(f"Ingredient with id {ingredient_id} not found")
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
            raise Exception(f"Error updating cocktail: {str(e)}")

    @staticmethod
    def delete_cocktail(cocktail_id: int, user_id: int) -> bool:
        try:
            if not CocktailService.can_user_edit_cocktail(cocktail_id, user_id):
                raise ValueError("You don't have permission to delete this cocktail")
            cocktail = db.session.get(Cocktail, cocktail_id)
            if not cocktail:
                return False
            db.session.delete(cocktail)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error deleting cocktail: {str(e)}")

    @staticmethod
    def search_cocktails(query: str) -> List[Dict[str, Any]]:
        try:
            stmt = select(Cocktail).where(
                Cocktail.name.ilike(f"%{query}%"),
                Cocktail.status == 'approved'
            )
            cocktails = db.session.execute(stmt).scalars().all()
            return [c.to_dict() for c in cocktails]
        except SQLAlchemyError as e:
            raise Exception(f"Error searching cocktails: {str(e)}")

    @staticmethod
    def get_cocktails_by_ingredient(ingredient_id: int) -> List[Dict[str, Any]]:
        try:
            ingredient = db.session.get(Ingredient, ingredient_id)
            if not ingredient:
                return []
            cocktails = ingredient.cocktails.filter_by(status='approved').all()
            return [c.to_dict() for c in cocktails]
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching cocktails by ingredient: {str(e)}")

    @staticmethod
    def get_cocktails_by_difficulty(difficulty: str) -> List[Dict[str, Any]]:
        try:
            stmt = select(Cocktail).where(
                Cocktail.difficulty == difficulty,
                Cocktail.status == 'approved'
            )
            cocktails = db.session.execute(stmt).scalars().all()
            return [c.to_dict() for c in cocktails]
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching cocktails by difficulty: {str(e)}")

    @staticmethod
    def get_pending_cocktails() -> List[Dict[str, Any]]:
        try:
            stmt = select(Cocktail).where(
                Cocktail.status == 'pending'
            ).order_by(Cocktail.submitted_at.desc())
            cocktails = db.session.execute(stmt).scalars().all()
            return [c.to_dict(include_ingredients=True) for c in cocktails]
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching pending cocktails: {str(e)}")

    @staticmethod
    def submit_for_review(cocktail_id: int, user_id: int) -> Dict[str, Any]:
        try:
            cocktail = db.session.get(Cocktail, cocktail_id)
            if not cocktail:
                raise ValueError("Cocktail not found")
            if cocktail.user_id != user_id:
                raise ValueError("You can only submit your own cocktails")
            if cocktail.status not in ['private', 'rejected']:
                raise ValueError(f"Cannot submit cocktail with status '{cocktail.status}'")
            cocktail.status = 'pending'
            cocktail.submitted_at = datetime.utcnow()
            cocktail.rejection_reason = None
            db.session.commit()
            return cocktail.to_dict(include_ingredients=True)
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error submitting cocktail: {str(e)}")

    @staticmethod
    def approve_cocktail(cocktail_id: int, admin_id: int) -> Dict[str, Any]:
        try:
            cocktail = db.session.get(Cocktail, cocktail_id)
            if not cocktail:
                raise ValueError("Cocktail not found")
            if cocktail.status != 'pending':
                raise ValueError("Cocktail is not pending review")
            cocktail.status = 'approved'
            cocktail.reviewed_at = datetime.utcnow()
            cocktail.reviewed_by = admin_id
            db.session.commit()
            return cocktail.to_dict(include_ingredients=True)
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error approving cocktail: {str(e)}")

    @staticmethod
    def reject_cocktail(cocktail_id: int, admin_id: int, reason: str) -> Dict[str, Any]:
        try:
            cocktail = db.session.get(Cocktail, cocktail_id)
            if not cocktail:
                raise ValueError("Cocktail not found")
            if cocktail.status != 'pending':
                raise ValueError("Cocktail is not pending review")
            cocktail.status = 'rejected'
            cocktail.reviewed_at = datetime.utcnow()
            cocktail.reviewed_by = admin_id
            cocktail.rejection_reason = reason
            db.session.commit()
            return cocktail.to_dict(include_ingredients=True)
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error rejecting cocktail: {str(e)}")

    @staticmethod
    def get_user_cocktails(user_id: int) -> Dict[str, Any]:
        try:
            stmt = select(Cocktail).where(Cocktail.user_id == user_id)
            all_cocktails = db.session.execute(stmt).scalars().all()
            return {
                'private': [c.to_dict(include_ingredients=True) for c in all_cocktails if c.status == 'private'],
                'pending': [c.to_dict(include_ingredients=True) for c in all_cocktails if c.status == 'pending'],
                'approved': [c.to_dict(include_ingredients=True) for c in all_cocktails if c.status == 'approved'],
                'rejected': [c.to_dict(include_ingredients=True) for c in all_cocktails if c.status == 'rejected']
            }
        except SQLAlchemyError as e:
            raise Exception(f"Error fetching user cocktails: {str(e)}")

    @staticmethod
    def add_cocktail_to_favourites(user_id: int, cocktail_id: int) -> Dict[str, Any]:
        try:
            cocktail = db.Session.get(Cocktail, cocktail_id)
            if not cocktail:
                raise ValueError('Cocktail not found')
            existing = db.Session.execute(
                select(favourites).where(
                    favourites.c.user_id == user_id,
                    favourites.c.cocktail_id == cocktail_id
                )
            ).first()
            if existing:
                raise ValueError('Cocktial already in favourites')
            stmt = db.session.execute(
                favourites.insert().values(
                    user_id = user_id,
                    cocktail_id = cocktail_id
                )
            )
            db.session.commit()
            return cocktail.to_dict(include_ingredients=True)
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f'Error adding to favourites: {str(e)}')

    @staticmethod
    def remove_cocktail_from_favourites(user_id: int, cocktail_id: int) -> Dict[str, Any]:
        try:
            cocktail = db.Session.get(Cocktail, cocktail_id)
            if not cocktail:
                raise ValueError('Cocktail not found')
            result = db.session.execute(
                favourites.delete().where(
                    favourites.c.user_id == user_id,
                    favourites.c.cocktail_id == cocktail_id
                )
            )
            db.session.commit()
            return result.rowcount > 0
        except SQLAlchemyError as e:
            raise Exception(f'Error removing cocktail from favourites: {str(e)}')


    @staticmethod
    def get_user_favourite_cocktails(user_id: int) -> List[Dict[str, Any]]:
        try:
            stmt = (
                select(Cocktail)
                .join(favourites, favourites.c.cocktail_id == Cocktail.id)
                .where(favourites.c.user_id == user_id)
                .order_by(Cocktail.created_at.desc())
            )
            cocktails = db.session.execute(stmt).scalars().all()
            return [c.to_dict(include_ingredients=True) for c in cocktails]
        except SQLAlchemyError as e:
            raise Exception(f'Error fetching favourite cocktails: {str(e)}')
