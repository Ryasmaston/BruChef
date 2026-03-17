from datetime import datetime
from .db import db

cocktail_ingredients = db.Table('cocktail_ingredients',
    db.Column('cocktail_id', db.Integer, db.ForeignKey('cocktail.id'), primary_key=True),
    db.Column('ingredient_id', db.Integer, db.ForeignKey('ingredient.id'), primary_key=True),
    db.Column('quantity', db.String(50)),
    db.Column('unit', db.String(20), nullable=True),
    db.Column('quantity_note', db.String(100), nullable=True)
)

favourites=db.Table(
    'favourites',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('cocktail_id', db.Integer, db.ForeignKey('cocktail.id'), primary_key=True),
    db.Column('created_at', db.DateTime, default=datetime.utcnow)
)

class Cocktail(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    instructions = db.Column(db.Text, nullable=False)
    glass_type = db.Column(db.String(50))
    garnish = db.Column(db.String(100))
    difficulty = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    servings = db.Column(db.Integer, default=1)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    status = db.Column(db.String(20), default='private')
    submitted_at = db.Column(db.DateTime, nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    reviewed_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    rejection_reason = db.Column(db.Text, nullable=True)
    ingredients = db.relationship('Ingredient', secondary=cocktail_ingredients, backref=db.backref('cocktails', lazy='dynamic'))
    creator = db.relationship('User', foreign_keys=[user_id], backref=db.backref('created_cocktails', lazy='dynamic'))
    reviewer = db.relationship('User', foreign_keys=[reviewed_by])
    favourited_by = db.relationship('User', secondary=favourites, backref=db.backref('favourite_cocktails', lazy='dynamic'), lazy='dynamic')

    @property
    def is_official(self):
        return self.user_id is None

    def to_dict(self, include_ingredients=False):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'instructions': self.instructions,
            'glass_type': self.glass_type,
            'garnish': self.garnish,
            'difficulty': self.difficulty,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'servings' : self.servings,
            'status': self.status,
            'creator_name': self.creator.username if self.creator else 'BruChef',
            'is_official': self.user_id is None,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'reviewed_by': self.reviewed_by,
            'rejection_reason': self.rejection_reason,
            'user_id': self.user_id,
            'favourited_by': [u.id for u in self.favourited_by]
        }

        if include_ingredients:
            ingredients_with_quantities = []
            for ingredient in self.ingredients:
                result = db.session.execute(
                    db.select(
                        cocktail_ingredients.c.quantity,
                        cocktail_ingredients.c.unit,
                        cocktail_ingredients.c.quantity_note
                    ).where(
                        db.and_(
                            cocktail_ingredients.c.cocktail_id == self.id,
                            cocktail_ingredients.c.ingredient_id == ingredient.id
                        )
                    )
                ).first()
                ingredients_with_quantities.append({
                    'id': ingredient.id,
                    'name': ingredient.name,
                    'category': ingredient.category,
                    'subcategory': ingredient.subcategory,
                    'abv': ingredient.abv,
                    'quantity': result.quantity if result else None,
                    'unit': result.unit if result else None,
                    'quantity_note': result.quantity_note if result else None,
                    'preferred_unit': ingredient.preferred_unit,
                    'preferred_mode': ingredient.preferred_mode
                })
            data['ingredients'] = ingredients_with_quantities
        return data
