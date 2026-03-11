import pytest
from app.models import Cocktail, Ingredient
from app.models.cocktail import cocktail_ingredients
from datetime import datetime


@pytest.mark.models
class TestCocktailModel:
    def test_create_cocktail(self, session, regular_user):
        cocktail = Cocktail(
            name='Mojito',
            description='A refreshing cocktail',
            instructions='Muddle mint, add rum, top with soda',
            difficulty='Easy',
            glass_type='Highball',
            garnish='Mint sprig',
            servings=1,
            user_id=regular_user.id,
            status='private'
        )
        session.add(cocktail)
        session.commit()

        assert cocktail.id is not None
        assert cocktail.name == 'Mojito'
        assert cocktail.status == 'private'
        assert cocktail.user_id == regular_user.id
        assert not cocktail.is_official
        assert cocktail.created_at is not None

    def test_create_official_cocktail(self, session):
        cocktail = Cocktail(
            name='Classic Martini',
            instructions='Stir with ice, strain',
            difficulty='Medium',
            servings=1,
            user_id=None,
            status='approved'
        )
        session.add(cocktail)
        session.commit()

        assert cocktail.is_official
        assert cocktail.user_id is None

    def test_cocktail_to_dict(self, sample_cocktail):
        result = sample_cocktail.to_dict()
        assert result['id'] == sample_cocktail.id
        assert result['name'] == 'Test Martini'
        assert result['description'] == 'A test martini'
        assert result['difficulty'] == 'Medium'
        assert result['status'] == 'private'
        assert result['servings'] == 1
        assert 'created_at' in result
        assert 'creator_name' in result

    def test_cocktail_to_dict_with_ingredients(self, sample_cocktail):
        result = sample_cocktail.to_dict(include_ingredients=True)
        assert 'ingredients' in result
        assert len(result['ingredients']) > 0
        assert result['ingredients'][0]['name'] == 'Test Vodka'
        assert result['ingredients'][0]['quantity'] == '2 oz'

    def test_cocktail_status_workflow(self, session, sample_cocktail, admin_user):
        assert sample_cocktail.status == 'private'
        sample_cocktail.status = 'pending'
        sample_cocktail.submitted_at = datetime.utcnow()
        session.commit()
        assert sample_cocktail.status == 'pending'
        assert sample_cocktail.submitted_at is not None
        sample_cocktail.status = 'approved'
        sample_cocktail.reviewed_at = datetime.utcnow()
        sample_cocktail.reviewed_by = admin_user.id
        session.commit()
        assert sample_cocktail.status == 'approved'
        assert sample_cocktail.reviewed_at is not None

    def test_cocktail_rejection(self, session, sample_cocktail, admin_user):
        sample_cocktail.status = 'pending'
        sample_cocktail.submitted_at = datetime.utcnow()
        session.commit()
        sample_cocktail.status = 'rejected'
        sample_cocktail.rejection_reason = 'Missing ingredient quantities'
        sample_cocktail.reviewed_at = datetime.utcnow()
        sample_cocktail.reviewed_by = admin_user.id
        session.commit()
        assert sample_cocktail.status == 'rejected'
        assert sample_cocktail.rejection_reason == 'Missing ingredient quantities'
        assert sample_cocktail.reviewed_at is not None

    def test_cocktail_ingredients_relationship(self, session, sample_cocktail, sample_ingredient):
        assert len(sample_cocktail.ingredients) > 0
        assert sample_ingredient in sample_cocktail.ingredients

    def test_cocktail_creator_relationship(self, sample_cocktail, regular_user):
        assert sample_cocktail.creator is not None
        assert sample_cocktail.creator.id == regular_user.id
        assert sample_cocktail.creator.username == 'user_test'

    def test_multiple_ingredients(self, session, sample_cocktail, sample_ingredient):
        ingredient2 = Ingredient(
            name='Test Vermouth',
            category='Wine',
            subcategory='Fortified',
            abv=18.0
        )
        session.add(ingredient2)
        session.flush()
        session.execute(
            cocktail_ingredients.insert().values(
                cocktail_id=sample_cocktail.id,
                ingredient_id=ingredient2.id,
                quantity='0.5 oz'
            )
        )
        session.commit()
        session.refresh(sample_cocktail)
        assert len(sample_cocktail.ingredients) == 2

    def test_cocktail_servings_scaling(self, sample_cocktail):
        assert sample_cocktail.servings == 1
        sample_cocktail.servings = 4
        assert sample_cocktail.servings == 4

    def test_cocktail_required_fields(self, session, regular_user):
        cocktail = Cocktail(
            instructions='Test instructions',
            user_id=regular_user.id
        )
        session.add(cocktail)
        with pytest.raises(Exception):
            session.commit()
        session.rollback()

    def test_cocktail_optional_fields(self, session, regular_user):
        cocktail = Cocktail(
            name='Minimal Cocktail',
            instructions='Just add everything',
            difficulty='Easy',
            user_id=regular_user.id,
            description=None,
            glass_type=None,
            garnish=None
        )
        session.add(cocktail)
        session.commit()
        assert cocktail.description is None
        assert cocktail.glass_type is None
        assert cocktail.garnish is None
