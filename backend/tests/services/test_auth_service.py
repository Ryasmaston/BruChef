import pytest
from app.services.auth_service import AuthService
from app.models import User

@pytest.mark.services
class TestAuthService:
    def test_validate_email_valid(self):
        assert AuthService.validate_email('test@example.com')
        assert AuthService.validate_email('user.name@domain.co.uk')
        assert AuthService.validate_email('test+tag@example.com')

    def test_validate_email_invalid(self):
        assert not AuthService.validate_email('invalid')
        assert not AuthService.validate_email('test@')
        assert not AuthService.validate_email('@example.com')
        assert not AuthService.validate_email('test@example')

    def test_validate_password_valid(self):
        is_valid, error = AuthService.validate_password('Password123')
        assert is_valid
        assert error == ""
        is_valid, error = AuthService.validate_password('MySecure1Pass')
        assert is_valid
        assert error == ""

    def test_validate_password_too_short(self):
        is_valid, error = AuthService.validate_password('Pass1')
        assert not is_valid
        assert "8 characters" in error

    def test_validate_password_no_uppercase(self):
        """Test password without uppercase"""
        is_valid, error = AuthService.validate_password('password123')
        assert not is_valid
        assert "uppercase" in error

    def test_validate_password_no_lowercase(self):
        is_valid, error = AuthService.validate_password('PASSWORD123')
        assert not is_valid
        assert "lowercase" in error

    def test_validate_password_no_number(self):
        is_valid, error = AuthService.validate_password('PasswordOnly')
        assert not is_valid
        assert "number" in error

    def test_validate_username_valid(self):
        is_valid, error = AuthService.validate_username('testuser')
        assert is_valid
        assert error == ""
        is_valid, error = AuthService.validate_username('user_123')
        assert is_valid

    def test_validate_username_too_short(self):
        is_valid, error = AuthService.validate_username('ab')
        assert not is_valid
        assert "3 characters" in error

    def test_validate_username_too_long(self):
        is_valid, error = AuthService.validate_username('a' * 81)
        assert not is_valid
        assert "80 characters" in error

    def test_validate_username_invalid_chars(self):
        is_valid, error = AuthService.validate_username('user@name')
        assert not is_valid
        assert "letters, numbers, hyphens" in error

    def test_register_user_success(self, session):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'Password123'
        }
        user = AuthService.register_user(data)
        assert user.id is not None
        assert user.username == 'newuser'
        assert user.email == 'newuser@example.com'
        assert not user.is_admin

    def test_register_user_missing_username(self, session):
        data = {
            'email': 'test@example.com',
            'password': 'Password123'
        }
        with pytest.raises(ValueError, match="Username is required"):
            AuthService.register_user(data)

    def test_register_user_missing_email(self, session):
        data = {
            'username': 'testuser',
            'password': 'Password123'
        }
        with pytest.raises(ValueError, match="Email is required"):
            AuthService.register_user(data)

    def test_register_user_missing_password(self, session):
        data = {
            'username': 'testuser',
            'email': 'test@example.com'
        }
        with pytest.raises(ValueError, match="Password is required"):
            AuthService.register_user(data)

    def test_register_user_invalid_email(self, session):
        data = {
            'username': 'testuser',
            'email': 'invalid-email',
            'password': 'Password123'
        }
        with pytest.raises(ValueError, match="Invalid email format"):
            AuthService.register_user(data)

    def test_register_user_weak_password(self, session):
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'weak'
        }
        with pytest.raises(ValueError):
            AuthService.register_user(data)

    def test_register_user_duplicate_username(self, session, regular_user):
        data = {
            'username': 'user_test',
            'email': 'different@example.com',
            'password': 'Password123'
        }
        with pytest.raises(ValueError, match="Username already exists"):
            AuthService.register_user(data)

    def test_register_user_duplicate_email(self, session, regular_user):
        data = {
            'username': 'differentuser',
            'email': 'user@test.com',
            'password': 'Password123'
        }
        with pytest.raises(ValueError, match="Email already registered"):
            AuthService.register_user(data)

    def test_login_user_success(self, session, regular_user):
        data = {
            'username': 'user_test',
            'password': 'Password123'
        }
        user = AuthService.login_user(data)
        assert user is not None
        assert user.username == 'user_test'

    def test_login_user_with_email(self, session, regular_user):
        data = {
            'username': 'user@test.com',
            'password': 'Password123'
        }
        user = AuthService.login_user(data)
        assert user is not None
        assert user.email == 'user@test.com'

    def test_login_user_wrong_password(self, session, regular_user):
        data = {
            'username': 'user_test',
            'password': 'WrongPassword123'
        }
        user = AuthService.login_user(data)
        assert user is None

    def test_login_user_nonexistent(self, session):
        data = {
            'username': 'nonexistent',
            'password': 'Password123'
        }
        user = AuthService.login_user(data)
        assert user is None

    def test_login_user_missing_username(self, session):
        data = {
            'password': 'Password123'
        }
        with pytest.raises(ValueError, match="Username or email is required"):
            AuthService.login_user(data)

    def test_login_user_missing_password(self, session):
        data = {
            'username': 'testuser'
        }
        with pytest.raises(ValueError, match="Password is required"):
            AuthService.login_user(data)

    def test_get_user_by_id(self, session, regular_user):
        user = AuthService.get_user_by_id(regular_user.id)
        assert user is not None
        assert user.id == regular_user.id
        assert user.username == 'user_test'

    def test_get_user_by_id_not_found(self, session):
        user = AuthService.get_user_by_id(99999)
        assert user is None

    def test_get_user_by_username(self, session, regular_user):
        user = AuthService.get_user_by_username('user_test')
        assert user is not None
        assert user.username == 'user_test'

    def test_get_user_by_username_not_found(self, session):
        user = AuthService.get_user_by_username('nonexistent')
        assert user is None

    def test_get_user_by_email(self, session, regular_user):
        user = AuthService.get_user_by_email('user@test.com')
        assert user is not None
        assert user.email == 'user@test.com'

    def test_get_user_by_email_case_insensitive(self, session, regular_user):
        user = AuthService.get_user_by_email('USER@TEST.COM')
        assert user is not None
        assert user.email == 'user@test.com'

    def test_get_user_by_email_not_found(self, session):
        user = AuthService.get_user_by_email('nonexistent@example.com')
        assert user is None

    def test_update_password_success(self, session, regular_user):
        result = AuthService.update_password(
            regular_user.id,
            'Password123',
            'NewPassword456'
        )
        assert result
        assert regular_user.check_password('NewPassword456')
        assert not regular_user.check_password('Password123')

    def test_update_password_wrong_old_password(self, session, regular_user):
        result = AuthService.update_password(
            regular_user.id,
            'WrongPassword',
            'NewPassword456'
        )
        assert not result

    def test_update_password_weak_new_password(self, session, regular_user):
        with pytest.raises(ValueError):
            AuthService.update_password(
                regular_user.id,
                'Password123',
                'weak'
            )

    def test_update_password_user_not_found(self, session):
        with pytest.raises(ValueError, match="User not found"):
            AuthService.update_password(
                99999,
                'Password123',
                'NewPassword456'
            )
