import pytest
from app.services.ingredient_service import IngredientService
from app.models import Ingredient


@pytest.mark.services
class TestIngredientService:
    def test_get_all_ingredients(self, session, sample_ingredient, second_ingredient):
        ingredients = IngredientService.get_all_ingredients()
        assert len(ingredients) >= 2
        ingredient_names = [i.name for i in ingredients]
        assert 'Test Vodka' in ingredient_names
        assert 'Test Rum' in ingredient_names

    def test_get_ingredient_by_id(self, session, sample_ingredient):
        ingredient = IngredientService.get_ingredient_by_id(sample_ingredient.id)
        assert ingredient is not None
        assert ingredient.name == 'Test Vodka'
        assert ingredient.category == 'Spirit'

    def test_get_ingredient_by_id_not_found(self, session):
        ingredient = IngredientService.get_ingredient_by_id(99999)
        assert ingredient is None

    def test_get_ingredient_by_name(self, session, sample_ingredient):
        ingredient = IngredientService.get_ingredient_by_name('Test Vodka')
        assert ingredient is not None
        assert ingredient.name == 'Test Vodka'

    def test_get_ingredient_by_name_case_insensitive(self, session, sample_ingredient):
        ingredient = IngredientService.get_ingredient_by_name('test vodka')
        assert ingredient is not None
        assert ingredient.name == 'Test Vodka'

    def test_get_ingredient_by_name_not_found(self, session):
        ingredient = IngredientService.get_ingredient_by_name('Nonexistent')
        assert ingredient is None

    def test_create_ingredient(self, session, regular_user):
        data = {
            'name': 'Tequila Blanco',
            'category': 'Spirit',
            'subcategory': 'Tequila',
            'description': 'A clear tequila',
            'abv': 40.0,
            'user_id': regular_user.id
        }
        ingredient = IngredientService.create_ingredient(data)
        assert ingredient.id is not None
        assert ingredient.name == 'Tequila Blanco'
        assert ingredient.category == 'Spirit'
        assert ingredient.subcategory == 'Tequila'
        assert ingredient.abv == 40.0
        assert ingredient.user_id == regular_user.id

    def test_create_ingredient_missing_name(self, session):
        data = {
            'category': 'Spirit',
            'abv': 40.0
        }
        with pytest.raises(ValueError, match="Ingredient name is required"):
            IngredientService.create_ingredient(data)

    def test_create_ingredient_duplicate_name(self, session, sample_ingredient):
        data = {
            'name': 'Test Vodka',
            'category': 'Spirit',
            'abv': 40.0
        }
        with pytest.raises(ValueError, match="already exists"):
            IngredientService.create_ingredient(data)

    def test_create_ingredient_defaults(self, session):
        data = {
            'name': 'Simple Ingredient'
        }

        ingredient = IngredientService.create_ingredient(data)
        assert ingredient.category == ''
        assert ingredient.subcategory == ''
        assert ingredient.description == ''
        assert ingredient.abv == 0.0

    def test_can_user_edit_ingredient_creator(self, session, user_ingredient, regular_user):
        can_edit = IngredientService.can_user_edit_ingredient(
            user_ingredient.id,
            regular_user.id
        )
        assert can_edit

    def test_can_user_edit_ingredient_admin(self, session, user_ingredient, admin_user):
        can_edit = IngredientService.can_user_edit_ingredient(
            user_ingredient.id,
            admin_user.id
        )
        assert can_edit

    def test_can_user_edit_ingredient_other_user(self, session, user_ingredient, second_user):
        can_edit = IngredientService.can_user_edit_ingredient(
            user_ingredient.id,
            second_user.id
        )
        assert not can_edit

    def test_can_user_edit_ingredient_official(self, session, sample_ingredient, regular_user):
        can_edit = IngredientService.can_user_edit_ingredient(
            sample_ingredient.id,
            regular_user.id
        )
        assert not can_edit

    def test_can_user_edit_ingredient_official_admin(self, session, sample_ingredient, admin_user):
        can_edit = IngredientService.can_user_edit_ingredient(
            sample_ingredient.id,
            admin_user.id
        )
        assert can_edit

    def test_can_user_edit_ingredient_not_found(self, session, regular_user):
        can_edit = IngredientService.can_user_edit_ingredient(99999, regular_user.id)
        assert not can_edit

    def test_update_ingredient(self, session, user_ingredient, regular_user):
        data = {
            'name': 'Updated Gin',
            'description': 'Updated description',
            'abv': 42.0
        }
        updated = IngredientService.update_ingredient(
            user_ingredient.id,
            data,
            regular_user.id
        )
        assert updated.name == 'Updated Gin'
        assert updated.description == 'Updated description'
        assert updated.abv == 42.0

    def test_update_ingredient_unauthorized(self, session, user_ingredient, second_user):
        """Test cannot update other user's ingredient"""
        data = {'name': 'Hacked Name'}
        with pytest.raises(ValueError, match="permission"):
            IngredientService.update_ingredient(
                user_ingredient.id,
                data,
                second_user.id
            )

    def test_update_ingredient_duplicate_name(self, session, user_ingredient, sample_ingredient, regular_user):
        data = {'name': 'Test Vodka'}  # Already exists
        with pytest.raises(ValueError, match="already exists"):
            IngredientService.update_ingredient(
                user_ingredient.id,
                data,
                regular_user.id
            )

    def test_update_ingredient_not_found(self, session, regular_user):
        data = {'name': 'New Name'}
        result = IngredientService.update_ingredient(99999, data, regular_user.id)
        assert result is None

    def test_delete_ingredient(self, session, regular_user):
        data = {
            'name': 'To Delete',
            'category': 'Spirit',
            'user_id': regular_user.id
        }
        ingredient = IngredientService.create_ingredient(data)
        ingredient_id = ingredient.id
        result = IngredientService.delete_ingredient(ingredient_id, regular_user.id)
        assert result
        deleted = IngredientService.get_ingredient_by_id(ingredient_id)
        assert deleted is None

    def test_delete_ingredient_unauthorized(self, session, user_ingredient, second_user):
        with pytest.raises(ValueError, match="permission"):
            IngredientService.delete_ingredient(user_ingredient.id, second_user.id)

    def test_delete_ingredient_in_use_cocktail(self, session, sample_cocktail, sample_ingredient, admin_user):
        with pytest.raises(ValueError, match="used in"):
            IngredientService.delete_ingredient(sample_ingredient.id, admin_user.id)

    def test_delete_ingredient_in_inventory(self, session, inventory_item, sample_ingredient, admin_user):
        with pytest.raises(ValueError, match="inventory"):
            IngredientService.delete_ingredient(sample_ingredient.id, admin_user.id)

    def test_delete_ingredient_not_found(self, session, regular_user):
        result = IngredientService.delete_ingredient(99999, regular_user.id)
        assert not result

    def test_get_ingredients_by_category(self, session, sample_ingredient, second_ingredient):
        ingredients = IngredientService.get_ingredients_by_category('Spirit')
        assert len(ingredients) >= 2
        for ingredient in ingredients:
            assert ingredient.category == 'Spirit'

    def test_get_all_categories(self, session, sample_ingredient):
        categories = IngredientService.get_all_categories()
        assert 'Spirit' in categories
        assert len(categories) >= 1

    def test_search_ingredients(self, session, sample_ingredient, second_ingredient):
        results = IngredientService.search_ingredients('test')
        assert len(results) >= 2
        result_names = [r.name for r in results]
        assert 'Test Vodka' in result_names
        assert 'Test Rum' in result_names

    def test_search_ingredients_partial(self, session, sample_ingredient):
        results = IngredientService.search_ingredients('vod')
        assert len(results) >= 1
        assert 'Test Vodka' in [r.name for r in results]

    def test_search_ingredients_case_insensitive(self, session, sample_ingredient):
        results = IngredientService.search_ingredients('VODKA')
        assert len(results) >= 1
        assert 'Test Vodka' in [r.name for r in results]

    def test_search_ingredients_no_results(self, session):
        results = IngredientService.search_ingredients('nonexistent')
        assert len(results) == 0

    def test_get_cocktails_using_ingredient(self, session, sample_ingredient, sample_cocktail):
        cocktails = IngredientService.get_cocktails_using_ingredient(sample_ingredient.id)
        assert len(cocktails) >= 1
        cocktail_names = [c.name for c in cocktails]
        assert 'Test Martini' in cocktail_names

    def test_get_cocktails_using_ingredient_not_found(self, session):
        cocktails = IngredientService.get_cocktails_using_ingredient(99999)
        assert len(cocktails) == 0

    def test_get_alcoholic_ingredients(self, session, sample_ingredient):
        ingredients = IngredientService.get_alcoholic_ingredients()
        assert len(ingredients) >= 1
        for ingredient in ingredients:
            assert ingredient.abv > 0
        ingredient_names = [i.name for i in ingredients]
        assert 'Test Vodka' in ingredient_names

    def test_get_non_alcoholic_ingredients(self, session):
        data = {
            'name': 'Orange Juice',
            'category': 'Juice',
            'abv': 0.0
        }
        IngredientService.create_ingredient(data)
        ingredients = IngredientService.get_non_alcoholic_ingredients()
        assert len(ingredients) >= 1
        for ingredient in ingredients:
            assert ingredient.abv == 0
        ingredient_names = [i.name for i in ingredients]
        assert 'Orange Juice' in ingredient_names
