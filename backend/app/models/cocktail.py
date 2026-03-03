from datetime import datetime
from .db import db

cocktail_ingredients = db.Table('cocktail_ingredients',
    db.Column('cocktail_id', db.Integer, db.ForeignKey('cocktail.id'), primary_key=True),
    db.Column('ingredient_id', db.Integer, db.ForeignKey('ingredient.id'), primary_key=True),
    db.Column('quantity', db.String(50))
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
    ingredients = db.relationship('Ingredient', secondary=cocktail_ingredients,
                                 backref=db.backref('cocktails', lazy='dynamic'))
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
            'servings' : self.servings
        }
        if include_ingredients:
            ingredients_with_quantities = []
            for ingredient in self.ingredients:
                result = db.session.execute(
                    db.select(cocktail_ingredients.c.quantity).where(
                        db.and_(
                            cocktail_ingredients.c.cocktail_id == self.id,
                            cocktail_ingredients.c.ingredient_id == ingredient.id
                        )
                    )
                ).scalar()
                ingredients_with_quantities.append({
                    "id": ingredient.id,
                    "name": ingredient.name,
                    "category": ingredient.category,
                    "subcategory": ingredient.subcategory,
                    "abv": ingredient.abv,
                    "quantity": result or ""
                })
            data['ingredients'] = ingredients_with_quantities
        return data
