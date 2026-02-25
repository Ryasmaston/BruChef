from app import create_app
from app.models import db, Cocktail, Ingredient, User, cocktail_ingredients


def seed_database():
    app = create_app()
    with app.app_context():
        print("Clearing existing data")
        db.drop_all()
        db.create_all()
        print("Creating users")
        users_data = [
            {
                "username": "admin",
                "email": "admin@example.com",
                "password": "admin123"
            },
            {
                "username": "Alice",
                "email": "alice@email.com",
                "password": "Password123"
            },
            {
                "username": "John",
                "email": "john@email.com",
                "password": "Password123"
            },
            {
                "username": "Ryan",
                "email": "ryan@email.com",
                "password": "Password123"
            }
        ]
        users = []
        for data in users_data:
            user = User(
                username=data["username"],
                email=data["email"]
            )
            user.set_password(data["password"])
            users.append(user)

        db.session.add_all(users)
        db.session.commit()

        print("Creating ingredients")
        vodka = Ingredient(name="Vodka", category="Spirit", subcategory="Vodka", abv=40.0)
        gin = Ingredient(name="Gin", category="Spirit", subcategory="Gin", abv=40.0)
        rum = Ingredient(name="White Rum", category="Spirit", subcategory="Rum", abv=40.0)
        dark_rum = Ingredient(name="Dark Rum", category="Spirit", subcategory="Rum", abv=40.0)
        tequila = Ingredient(name="Tequila", category="Spirit", subcategory="Tequila", abv=40.0)
        whiskey = Ingredient(name="Bourbon Whiskey", category="Spirit", subcategory="Bourbon", abv=45.0)
        triple_sec = Ingredient(name="Triple Sec", category="Liqueur", subcategory="Orange", abv=40.0)
        campari = Ingredient(name="Campari", category="Liqueur", subcategory="Herbal", abv=24.0)
        aperol = Ingredient(name="Aperol", category="Liqueur", subcategory="Herbal", abv=11.0)
        sweet_vermouth = Ingredient(name="Sweet Vermouth", category="Wine", subcategory="Fortified", abv=16.0)
        dry_vermouth = Ingredient(name="Dry Vermouth", category="Wine", subcategory="Fortified", abv=18.0)
        prosecco = Ingredient(name="Prosecco", category="Wine", subcategory="Sparkling", abv=11.0)
        angostura = Ingredient(name="Angostura Bitters", category="Bitters", subcategory="Aromatic", abv=44.7)
        lime_juice = Ingredient(name="Lime Juice", category="Juice", subcategory="Citrus", abv=0.0)
        lemon_juice = Ingredient(name="Lemon Juice", category="Juice", subcategory="Citrus", abv=0.0)
        cranberry = Ingredient(name="Cranberry Juice", category="Juice", subcategory="Berry", abv=0.0)
        orange_juice = Ingredient(name="Orange Juice", category="Juice", subcategory="Citrus", abv=0.0)
        pineapple = Ingredient(name="Pineapple Juice", category="Juice", subcategory="Tropical", abv=0.0)
        simple_syrup = Ingredient(name="Simple Syrup", category="Syrup", subcategory="Simple", abv=0.0)
        sugar_cube = Ingredient(name="Sugar Cube", category="Syrup", abv=0.0)
        soda_water = Ingredient(name="Soda Water", category="Soda", subcategory="Club Soda", abv=0.0)
        coke = Ingredient(name="Cola", category="Soda", subcategory="Cola", abv=0.0)
        coconut_cream = Ingredient(name="Coconut Cream", category="Dairy", subcategory="Coconut Cream", abv=0.0)
        egg_white = Ingredient(name="Egg White", category="Egg", subcategory="Egg White", abv=0.0)
        mint = Ingredient(name="Fresh Mint", category="Fresh Ingredient", subcategory="Herb", abv=0.0)

        db.session.add_all([
            vodka, gin, rum, dark_rum, tequila, whiskey,
            triple_sec, campari, aperol,
            sweet_vermouth, dry_vermouth, prosecco,
            angostura,
            lime_juice, lemon_juice, cranberry,
            orange_juice, pineapple,
            simple_syrup, sugar_cube,
            soda_water, coke,
            coconut_cream,
            egg_white,
            mint
        ])

        db.session.commit()

        print("Creating cocktails")

        margarita = Cocktail(
            name="Margarita",
            description="A classic tequila cocktail with lime and triple sec",
            instructions="""Add tequila, triple sec, and lime juice to shaker with ice
                            Shake well
                            Strain into salt-rimmed rocks glass
                            Garnish with lime wheel""",
            glass_type="Rocks",
            garnish="Lime wheel, salt rim",
            difficulty="Easy"
        )
        db.session.add(margarita)
        db.session.flush()
        db.session.execute(
            cocktail_ingredients.insert().values([
                {'cocktail_id': margarita.id, 'ingredient_id': tequila.id, 'quantity': '2 oz'},
                {'cocktail_id': margarita.id, 'ingredient_id': triple_sec.id, 'quantity': '1 oz'},
                {'cocktail_id': margarita.id, 'ingredient_id': lime_juice.id, 'quantity': '1 oz'}
            ])
        )

        mojito = Cocktail(
            name="Mojito",
            description="A refreshing rum cocktail with mint and lime",
            instructions="""Muddle mint with simple syrup and lime juice
                            Add rum and ice
                            Top with soda water
                            Stir gently
                            Garnish with mint sprig""",
            glass_type="Highball",
            garnish="Mint sprig",
            difficulty="Easy"
        )
        db.session.add(mojito)
        db.session.flush()
        db.session.execute(
            cocktail_ingredients.insert().values([
                {'cocktail_id': mojito.id, 'ingredient_id': rum.id, 'quantity': '2 oz'},
                {'cocktail_id': mojito.id, 'ingredient_id': lime_juice.id, 'quantity': '0.75 oz'},
                {'cocktail_id': mojito.id, 'ingredient_id': simple_syrup.id, 'quantity': '0.5 oz'},
                {'cocktail_id': mojito.id, 'ingredient_id': mint.id, 'quantity': '8 leaves'},
                {'cocktail_id': mojito.id, 'ingredient_id': soda_water.id, 'quantity': 'Top with'}
            ])
        )

        cosmopolitan = Cocktail(
            name="Cosmopolitan",
            description="A vodka cocktail with cranberry and citrus",
            instructions="""Add vodka, triple sec, lime juice, cranberry juice to shaker with ice
                            Shake well
                            Strain into chilled martini glass
                            Garnish with lime wheel""",
            glass_type="Martini",
            garnish="Lime wheel",
            difficulty="Medium"
        )
        db.session.add(cosmopolitan)
        db.session.flush()
        db.session.execute(
            cocktail_ingredients.insert().values([
                {'cocktail_id': cosmopolitan.id, 'ingredient_id': vodka.id, 'quantity': '1.5 oz'},
                {'cocktail_id': cosmopolitan.id, 'ingredient_id': triple_sec.id, 'quantity': '0.5 oz'},
                {'cocktail_id': cosmopolitan.id, 'ingredient_id': lime_juice.id, 'quantity': '0.5 oz'},
                {'cocktail_id': cosmopolitan.id, 'ingredient_id': cranberry.id, 'quantity': '0.25 oz'}
            ])
        )

        old_fashioned = Cocktail(
            name="Old Fashioned",
            description="A timeless whiskey cocktail with bitters and sugar",
            instructions="""Muddle sugar cube with bitters
                            Add bourbon and ice
                            Stir gently
                            Garnish with orange peel""",
            glass_type="Rocks",
            garnish="Orange peel",
            difficulty="Easy"
        )
        db.session.add(old_fashioned)
        db.session.flush()
        db.session.execute(
            cocktail_ingredients.insert().values([
                {'cocktail_id': old_fashioned.id, 'ingredient_id': whiskey.id, 'quantity': '2 oz'},
                {'cocktail_id': old_fashioned.id, 'ingredient_id': angostura.id, 'quantity': '2 dashes'},
                {'cocktail_id': old_fashioned.id, 'ingredient_id': sugar_cube.id, 'quantity': '1 cube'}
            ])
        )

        negroni = Cocktail(
            name="Negroni",
            description="A bold gin cocktail with Campari and sweet vermouth",
            instructions="""Add gin, Campari, sweet vermouth to mixing glass with ice
                            Stir until chilled
                            Strain over ice in rocks glass
                            Garnish with orange peel""",
            glass_type="Rocks",
            garnish="Orange peel",
            difficulty="Medium"
        )
        db.session.add(negroni)
        db.session.flush()

        db.session.execute(
            cocktail_ingredients.insert().values([
                {'cocktail_id': negroni.id, 'ingredient_id': gin.id, 'quantity': '1 oz'},
                {'cocktail_id': negroni.id, 'ingredient_id': campari.id, 'quantity': '1 oz'},
                {'cocktail_id': negroni.id, 'ingredient_id': sweet_vermouth.id, 'quantity': '1 oz'}
            ])
        )

        whiskey_sour = Cocktail(
            name="Whiskey Sour",
            description="A balanced cocktail with lemon and egg white",
            instructions="""Add whiskey, lemon juice, simple syrup, egg white
                            Dry shake
                            Add ice and shake again
                            Strain into rocks glass
                            Garnish with cherry""",
            glass_type="Rocks",
            garnish="Cherry",
            difficulty="Medium"
        )
        db.session.add(whiskey_sour)
        db.session.flush()
        db.session.execute(
            cocktail_ingredients.insert().values([
                {'cocktail_id': whiskey_sour.id, 'ingredient_id': whiskey.id, 'quantity': '2 oz'},
                {'cocktail_id': whiskey_sour.id, 'ingredient_id': lemon_juice.id, 'quantity': '0.75 oz'},
                {'cocktail_id': whiskey_sour.id, 'ingredient_id': simple_syrup.id, 'quantity': '0.5 oz'},
                {'cocktail_id': whiskey_sour.id, 'ingredient_id': egg_white.id, 'quantity': '1 egg white'}
            ])
        )

        pina_colada = Cocktail(
            name="Piña Colada",
            description="A tropical rum cocktail with pineapple and coconut",
            instructions="""Add rum, pineapple juice, coconut cream to blender
                            Add ice and blend
                            Pour into hurricane glass
                            Garnish with pineapple wedge""",
            glass_type="Hurricane",
            garnish="Pineapple wedge",
            difficulty="Easy"
        )
        db.session.add(pina_colada)
        db.session.flush()
        db.session.execute(
            cocktail_ingredients.insert().values([
                {'cocktail_id': pina_colada.id, 'ingredient_id': rum.id, 'quantity': '2 oz'},
                {'cocktail_id': pina_colada.id, 'ingredient_id': pineapple.id, 'quantity': '3 oz'},
                {'cocktail_id': pina_colada.id, 'ingredient_id': coconut_cream.id, 'quantity': '1.5 oz'}
            ])
        )

        aperol_spritz = Cocktail(
            name="Aperol Spritz",
            description="A light Italian aperitif with prosecco and Aperol",
            instructions="""Fill wine glass with ice
                            Add prosecco
                            Add Aperol
                            Top with soda water
                            Stir gently""",
            glass_type="Wine",
            garnish="Orange slice",
            difficulty="Easy"
        )
        db.session.add(aperol_spritz)
        db.session.flush()
        db.session.execute(
            cocktail_ingredients.insert().values([
                {'cocktail_id': aperol_spritz.id, 'ingredient_id': prosecco.id, 'quantity': '3 oz'},
                {'cocktail_id': aperol_spritz.id, 'ingredient_id': aperol.id, 'quantity': '2 oz'},
                {'cocktail_id': aperol_spritz.id, 'ingredient_id': soda_water.id, 'quantity': 'Splash'}
            ])
        )

        rum_and_coke = Cocktail(
            name="Rum & Coke",
            description="A simple highball with rum and cola",
            instructions="""Fill highball glass with ice
                            Add rum
                            Top with cola
                            Stir gently""",
            glass_type="Highball",
            garnish="Lime wedge",
            difficulty="Easy"
        )
        db.session.add(rum_and_coke)
        db.session.flush()
        db.session.execute(
            cocktail_ingredients.insert().values([
                {'cocktail_id': rum_and_coke.id, 'ingredient_id': rum.id, 'quantity': '2 oz'},
                {'cocktail_id': rum_and_coke.id, 'ingredient_id': coke.id, 'quantity': 'Fill'}
            ])
        )

        db.session.commit()

        print("✓ Database seeded successfully")
        print(f"  - {User.query.count()} users")
        print(f"  - {Ingredient.query.count()} ingredients")
        print(f"  - {Cocktail.query.count()} cocktails")

if __name__ == "__main__":
    seed_database()
