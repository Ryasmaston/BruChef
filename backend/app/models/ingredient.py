from .db import db
from datetime import datetime

class Ingredient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    category = db.Column(db.String(50), nullable=False)
    subcategory = db.Column(db.String(50))
    description = db.Column(db.Text)
    abv = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('ingredient.id'), nullable=True)
    preferred_unit = db.Column(db.String(20), nullable=True)

    creator = db.relationship('User', backref=db.backref('created_ingredients', lazy='dynamic'))
    children = db.relationship(
        'Ingredient',
        backref=db.backref('parent', remote_side=[id]),
        lazy='dynamic'
    )

    @property
    def is_base(self):
        return self.user_id is None and self.parent_id is None

    @property
    def preferred_mode(self):
        return 'instructional' if self.preferred_unit is None else 'measured'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'subcategory': self.subcategory,
            'description': self.description,
            'abv': self.abv,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user_id': self.user_id,
            'creator_name': self.creator.username if self.creator else 'BruChef',
            'parent_id': self.parent_id,
            'parent_name': self.parent.name if self.parent else None,
            'is_base': self.is_base,
            'children_count': len(self.children.all()) if self.children else 0,
            'preferred_unit': self.preferred_unit,
            'preferred_mode': self.preferred_mode,
        }
