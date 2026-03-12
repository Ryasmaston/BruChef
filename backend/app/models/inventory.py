from .db import db
from datetime import datetime

class Inventory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredient.id'), nullable=False)
    quantity = db.Column(db.Float, default=0.0)
    unit = db.Column(db.String(20), default='ml')
    notes = db.Column(db.String(200))
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('inventory_items', lazy='dynamic'))
    ingredient = db.relationship('Ingredient', backref=db.backref('inventory_items', lazy='dynamic'))

    __table_args__ = (
        db.UniqueConstraint('user_id', 'ingredient_id', name='_user_ingredient_uc'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'ingredient_id': self.ingredient_id,
            'ingredient': {
                'id': self.ingredient.id,
                'name': self.ingredient.name,
                'category': self.ingredient.category,
                'subcategory': self.ingredient.subcategory,
                'abv': self.ingredient.abv
            },
            'quantity': self.quantity,
            'unit': self.unit,
            'notes': self.notes,
            'added_at': self.added_at.isoformat() if self.added_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
