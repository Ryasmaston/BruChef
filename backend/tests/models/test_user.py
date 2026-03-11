import pytest
from app.models import User
from werkzeug.security import check_password_hash


@pytest.mark.models
class TestUserModel:
    def test_create_user(self, session):
        user = User(username='testuser', email='test@example.com')
        user.set_password('SecurePassword123')
        session.add(user)
        session.commit()
        assert user.id is not None
        assert user.username == 'testuser'
        assert user.email == 'test@example.com'
        assert not user.is_admin
        assert user.created_at is not None

    def test_create_admin_user(self, session):
        admin = User(
            username='adminuser',
            email='admin@example.com',
            is_admin=True
        )
        admin.set_password('AdminPassword123')
        session.add(admin)
        session.commit()
        assert admin.is_admin

    def test_password_hashing(self, session):
        user = User(username='testuser', email='test@example.com')
        user.set_password('MyPassword123')
        session.add(user)
        session.commit()
        assert user.password_hash != 'MyPassword123'
        assert user.password_hash is not None
        assert len(user.password_hash) > 20
    def test_check_password(self, regular_user):
        assert regular_user.check_password('Password123')
        assert not regular_user.check_password('WrongPassword')
        assert not regular_user.check_password('')

    def test_unique_username(self, session, regular_user):
        duplicate = User(
            username='user_test',
            email='different@example.com'
        )
        duplicate.set_password('Password123')
        session.add(duplicate)
        with pytest.raises(Exception):
            session.commit()
        session.rollback()

    def test_unique_email(self, session, regular_user):
        duplicate = User(
            username='different_user',
            email='user@test.com'
        )
        duplicate.set_password('Password123')
        session.add(duplicate)
        with pytest.raises(Exception):
            session.commit()
        session.rollback()

    def test_user_cocktails_relationship(self, regular_user, sample_cocktail):
        cocktails = regular_user.created_cocktails.all()
        assert len(cocktails) > 0
        assert sample_cocktail in cocktails

    def test_user_ingredients_relationship(self, regular_user, user_ingredient):
        ingredients = regular_user.created_ingredients.all()
        assert len(ingredients) > 0
        assert user_ingredient in ingredients

    def test_user_to_dict(self, regular_user):
        assert regular_user.username == 'user_test'
        assert regular_user.email == 'user@test.com'
        assert not regular_user.is_admin

    def test_required_fields(self, session):
        user = User(email='test@example.com')
        user.set_password('Password123')
        session.add(user)
        with pytest.raises(Exception):
            session.commit()
        session.rollback()
