import pytest
from app.models.inventory import Inventory
from app.models.ingredient import Ingredient

@pytest.mark.models
class TestInventoryModel:
    def test_create_inventory_item(self, session, regular_user, sample_ingredient):
        item = Inventory(
            user_id=regular_user.id,
            ingredient_id=sample_ingredient.id,
            quantity=750,
            unit='ml',
            notes='Full bottle'
        )
        session.add(item)
        session.commit()
        assert item.id is not None
        assert item.user_id == regular_user.id
        assert item.ingredient_id == sample_ingredient.id
        assert item.quantity == 750
        assert item.unit == 'ml'
        assert item.notes == 'Full bottle'
        assert item.added_at is not None

    def test_inventory_item_relationships(self, inventory_item, regular_user, sample_ingredient):
        assert inventory_item.user.id == regular_user.id
        assert inventory_item.ingredient.id == sample_ingredient.id
        assert inventory_item.ingredient.name == 'Test Vodka'

    def test_inventory_item_to_dict(self, inventory_item):
        result = inventory_item.to_dict()
        assert result['quantity'] == 750
        assert result['unit'] == 'ml'
        assert result['ingredient'] is not None
        assert result['ingredient']['name'] == 'Test Vodka'
        assert 'added_at' in result
        assert 'updated_at' in result

    def test_update_quantity(self, session, inventory_item):
        original_quantity = inventory_item.quantity
        inventory_item.quantity = 500
        session.commit()
        assert inventory_item.quantity == 500
        assert inventory_item.quantity != original_quantity

    def test_various_units(self, session, regular_user):
        units = ['ml', 'oz', 'g', 'lb', 'pieces', 'bottles']
        for i, unit in enumerate(units):
            ingredient = Ingredient(
                name=f'Test Ingredient {i}',
                category='Spirit',
                subcategory='Vodka',
                abv=40.0
            )
            session.add(ingredient)
            session.flush()
            item = Inventory(
                user_id=regular_user.id,
                ingredient_id=ingredient.id,
                quantity=100,
                unit=unit
            )
            session.add(item)
        session.commit()
        items = session.query(Inventory).filter_by(user_id=regular_user.id).all()
        assert len(items) >= len(units)

    def test_optional_notes(self, session, regular_user, sample_ingredient):
        item = Inventory(
            user_id=regular_user.id,
            ingredient_id=sample_ingredient.id,
            quantity=750,
            unit='ml',
            notes=None
        )
        session.add(item)
        session.commit()
        assert item.notes is None

    def test_user_multiple_inventory_items(self, session, regular_user, sample_ingredient):
        ingredient2 = Ingredient(
            name='Test Rum',
            category='Spirit',
            subcategory='Rum',
            abv=40.0
        )
        session.add(ingredient2)
        session.flush()
        item1 = Inventory(
            user_id=regular_user.id,
            ingredient_id=sample_ingredient.id,
            quantity=750,
            unit='ml'
        )
        item2 = Inventory(
            user_id=regular_user.id,
            ingredient_id=ingredient2.id,
            quantity=1000,
            unit='ml'
        )
        session.add_all([item1, item2])
        session.commit()
        items = session.query(Inventory).filter_by(user_id=regular_user.id).all()
        assert len(items) >= 2

    def test_delete_inventory_item(self, session, inventory_item):
        item_id = inventory_item.id
        session.delete(inventory_item)
        session.commit()
        deleted_item = session.query(Inventory).get(item_id)
        assert deleted_item is None

    def test_required_fields(self, session, regular_user):
        item = Inventory(
            user_id=regular_user.id,
            quantity=750,
            unit='ml'
        )
        session.add(item)
        with pytest.raises(Exception):
            session.commit()
        session.rollback()

    def test_unique_constraint(self, session, regular_user, sample_ingredient):
        item1 = Inventory(
            user_id=regular_user.id,
            ingredient_id=sample_ingredient.id,
            quantity=750,
            unit='ml'
        )
        session.add(item1)
        session.commit()
        item2 = Inventory(
            user_id=regular_user.id,
            ingredient_id=sample_ingredient.id,
            quantity=500,
            unit='ml'
        )
        session.add(item2)
        with pytest.raises(Exception):
            session.commit()
        session.rollback()
