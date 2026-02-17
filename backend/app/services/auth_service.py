from app.models import db, User
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from typing import Optional, Dict, Any
import re

class AuthService:
    @staticmethod
    def validate_email(email: str) -> bool:
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    @staticmethod
    def validate_password(password: str) -> tuple[bool, str]:
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        if not re.search(r'[0-9]', password):
            return False, "Password must contain at least one number"
        return True, ""

    @staticmethod
    def validate_username(username: str) -> tuple[bool, str]:
        if len(username) < 3:
            return False, "Username must be at least 3 characters long"
        if len(username) > 80:
            return False, "Username must be less than 80 characters"
        if not re.match(r'^[a-zA-Z0-9_-]+$', username):
            return False, "Username can only contain letters, numbers, hyphens, and underscores"
        return True, ""

    @staticmethod
    def register_user(data: Dict[str, Any]) -> User:
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        if not username:
            raise ValueError("Username is required")
        if not email:
            raise ValueError("Email is required")
        if not password:
            raise ValueError("Password is required")
        is_valid, error = AuthService.validate_username(username)
        if not is_valid:
            raise ValueError(error)
        if not AuthService.validate_email(email):
            raise ValueError("Invalid email format")
        is_valid, error = AuthService.validate_password(password)
        if not is_valid:
            raise ValueError(error)
        if User.query.filter_by(username=username).first():
            raise ValueError("Username already exists")
        if User.query.filter_by(email=email).first():
            raise ValueError("Email already registered")
        try:
            new_user = User(
                username=username,
                email=email
            )
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()
            return new_user
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Username or email already exists")
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error creating user: {str(e)}")

    @staticmethod
    def login_user(data: Dict[str, Any]) -> Optional[User]:
        username_or_email = data.get('username', '').strip().lower()
        password = data.get('password', '')
        if not username_or_email:
            raise ValueError("Username or email is required")
        if not password:
            raise ValueError("Password is required")
        user = User.query.filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()
        if user and user.check_password(password):
            return user
        return None

    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        return User.query.get(user_id)

    @staticmethod
    def get_user_by_username(username: str) -> Optional[User]:
        return User.query.filter_by(username=username).first()

    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        return User.query.filter_by(email=email.lower()).first()

    @staticmethod
    def update_password(user_id: int, old_password: str, new_password: str) -> bool:
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        if not user.check_password(old_password):
            return False
        is_valid, error = AuthService.validate_password(new_password)
        if not is_valid:
            raise ValueError(error)
        try:
            user.set_password(new_password)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise Exception(f"Error updating password: {str(e)}")
