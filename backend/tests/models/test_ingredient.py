import pytest
from app.models import Ingredient

@pytest.mark.models
class TestIngredientModel:
    def test_create_ingredient(self, session):
        ingredient = Ingredient(
            name='Gin',
            category='Spirit',
            subcategory='Gin',
            abv=40.0,
            description='London Dry Gin'
        )
        session.add(ingredient)
        session.commit()
        assert ingredient.id is not None
        assert ingredient.name == 'Gin'
        assert ingredient.category == 'Spirit'
        assert ingredient.abv == 40.0
        assert ingredient.created_at is not None

    def test_create_user_ingredient(self, session, regular_user):
        ingredient = Ingredient(
            name='Custom Bitters',
            category='Bitters',
            subcategory='Aromatic',
            abv=45.0,
            user_id=regular_user.id
        )
        session.add(ingredient)
        session.commit()
        assert ingredient.user_id == regular_user.id
        assert ingredient.creator is not None
        assert ingredient.creator.username == 'user_test'

    def test_ingredient_to_dict(self, sample_ingredient):
        result = sample_ingredient.to_dict()
        assert result['id'] == sample_ingredient.id
        assert result['name'] == 'Test Vodka'
        assert result['category'] == 'Spirit'
        assert result['subcategory'] == 'Vodka'
        assert result['abv'] == 40.0
        assert result['description'] == 'Test vodka for testing'
        assert 'created_at' in result
        assert result['creator_name'] == 'BruChef'

    def test_user_ingredient_to_dict(self, user_ingredient):
        result = user_ingredient.to_dict()
        assert result['user_id'] is not None
        assert result['creator_name'] == 'user_test'

    def test_ingredient_unique_name(self, session, sample_ingredient):
        duplicate = Ingredient(
            name='Test Vodka',
            category='Spirit',
            subcategory='Vodka',
            abv=40.0
        )
        session.add(duplicate)
        with pytest.raises(Exception):
            session.commit()
        session.rollback()

    def test_ingredient_abv_zero(self, session):
        ingredient = Ingredient(
            name='Club Soda',
            category='Soda',
            subcategory='Club Soda',
            abv=0.0
        )
        session.add(ingredient)
        session.commit()
        assert ingredient.abv == 0.0

    def test_ingredient_optional_fields(self, session):
        ingredient = Ingredient(
            name='Mystery Ingredient',
            category='Other',
            abv=0,
            subcategory=None,
            description=None
        )
        session.add(ingredient)
        session.commit()
        assert ingredient.subcategory is None
        assert ingredient.description is None

    def test_ingredient_required_fields(self, session):
        ingredient = Ingredient(
            category='Spirit',
            abv=40.0
        )
        session.add(ingredient)
        with pytest.raises(Exception):
            session.commit()
        session.rollback()

    def test_ingredient_categories(self, session):
        categories = [
            ('Spirit', 'Vodka'),
            ('Liqueur', 'Orange'),
            ('Wine', 'Sparkling'),
            ('Bitters', 'Aromatic'),
            ('Juice', 'Citrus'),
            ('Syrup', 'Simple'),
            ('Soda', 'Tonic'),
            ('Dairy', 'Cream'),
            ('Egg', 'Egg White'),
            ('Fresh Ingredient', 'Herb'),
            ('Garnish', 'Citrus')
        ]
        for category, subcategory in categories:
            ingredient = Ingredient(
                name=f'Test {category}',
                category=category,
                subcategory=subcategory,
                abv=0.0
            )
            session.add(ingredient)
        session.commit()
        count = session.query(Ingredient).filter(
            Ingredient.name.like('Test %')
        ).count()
        assert count == len(categories)
