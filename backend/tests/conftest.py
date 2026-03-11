import pytest
from app import create_app, db
from app.models import User, Ingredient, Cocktail, Inventory
from app.models.cocktail import cocktail_ingredients
from werkzeug.security import generate_password_hash


@pytest.fixture(scope='session')
def app():
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SECRET_KEY': 'test-secret-key',
        'WTF_CSRF_ENABLED': False
    })

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    return app.test_client()


@pytest.fixture(scope='function')
def _db(app):
    with app.app_context():
        db.create_all()
        yield db
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='function')
def session(_db):
    connection = _db.engine.connect()
    transaction = connection.begin()
    session = _db.session
    session.begin_nested()
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def admin_user(session):
    admin = User(
        username='admin_test',
        email='admin@test.com',
        password_hash=generate_password_hash('Password123'),
        is_admin=True
    )
    session.add(admin)
    session.commit()
    return admin


@pytest.fixture
def regular_user(session):
    user = User(
        username='user_test',
        email='user@test.com',
        password_hash=generate_password_hash('Password123'),
        is_admin=False
    )
    session.add(user)
    session.commit()
    return user


@pytest.fixture
def second_user(session):
    user = User(
        username='user2_test',
        email='user2@test.com',
        password_hash=generate_password_hash('Password123'),
        is_admin=False
    )
    session.add(user)
    session.commit()
    return user


@pytest.fixture
def sample_ingredient(session):
    ingredient = Ingredient(
        name='Test Vodka',
        category='Spirit',
        subcategory='Vodka',
        abv=40.0,
        description='Test vodka for testing'
    )
    session.add(ingredient)
    session.commit()
    return ingredient


@pytest.fixture
def second_ingredient(session):
    ingredient = Ingredient(
        name='Test Rum',
        category='Spirit',
        subcategory='Rum',
        abv=40.0,
        description='Test rum for testing'
    )
    session.add(ingredient)
    session.commit()
    return ingredient

@pytest.fixture
def user_ingredient(session, regular_user):
    ingredient = Ingredient(
        name="User Created Ingredient",
        category="Spirit",
        subcategory="Test",
        abv=40.0,
        description="Created by user",
        user_id=regular_user.id
    )

    session.add(ingredient)
    session.commit()
    return ingredient


@pytest.fixture
def sample_cocktail(session, regular_user, sample_ingredient):
    cocktail = Cocktail(
        name='Test Martini',
        description='A test martini',
        instructions='Shake and strain',
        difficulty='Medium',
        glass_type='Martini Glass',
        garnish='Olive',
        servings=1,
        user_id=regular_user.id,
        status='private'
    )
    session.add(cocktail)
    session.flush()
    session.execute(
        cocktail_ingredients.insert().values(
            cocktail_id=cocktail.id,
            ingredient_id=sample_ingredient.id,
            quantity='2 oz'
        )
    )
    session.commit()
    return cocktail


@pytest.fixture
def approved_cocktail(session, sample_ingredient):
    cocktail = Cocktail(
        name='Official Cocktail',
        description='An approved cocktail',
        instructions='Mix and serve',
        difficulty='Easy',
        glass_type='Rocks Glass',
        servings=1,
        user_id=None,
        status='approved'
    )
    session.add(cocktail)
    session.flush()
    session.execute(
        cocktail_ingredients.insert().values(
            cocktail_id=cocktail.id,
            ingredient_id=sample_ingredient.id,
            quantity='1.5 oz'
        )
    )
    session.commit()
    return cocktail


@pytest.fixture
def auth_headers(client, regular_user):
    response = client.post('/api/auth/login', json={
        'username': 'user_test',
        'password': 'Password123'
    })
    return {'Content-Type': 'application/json'}


@pytest.fixture
def admin_auth_headers(client, admin_user):
    response = client.post('/api/auth/login', json={
        'username': 'admin_test',
        'password': 'Password123'
    })
    return {'Content-Type': 'application/json'}

@pytest.fixture
def inventory_item(session, regular_user, sample_ingredient):
    """Create inventory item for tests"""
    item = Inventory(
        user_id=regular_user.id,
        ingredient_id=sample_ingredient.id,
        quantity=750,
        unit='ml',
        notes='Test inventory item'
    )
    session.add(item)
    session.commit()
    return item
