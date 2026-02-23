from datetime import datetime
from .db import db

cocktail_ingredients = db.Table('cocktail_ingredients',
    db.Column('cocktail_id', db.Integer, db.ForeignKey('cocktail.id'), primary_key=True),
    db.Column('ingredient_id', db.Integer, db.ForeignKey('ingredient.id'), primary_key=True),
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
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_ingredients:
            data['ingredients'] = [
                {
                    "id": ingredient.id,
                    "name": ingredient.name,
                    "category": ingredient.category,
                    "abv": ingredient.abv
                }
                for ingredient in self.ingredients
            ]
        return data
