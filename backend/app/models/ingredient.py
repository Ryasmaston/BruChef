from .db import db

class Ingredient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    category = db.Column(db.String(50), nullable=False)
    subcategory = db.Column(db.String(50))
    description = db.Column(db.Text)
    abv = db.Column(db.Float)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'subcategory': self.subcategory,
            'description': self.description,
            'abv': self.abv
        }
