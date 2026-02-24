from app import create_app
from app.models import db, Cocktail, Ingredient, User


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
        simple_syrup = Ingredient(name="Simple Syrup", category="Syrup", abv=0.0)
        sugar_cube = Ingredient(name="Sugar Cube", category="Syrup", abv=0.0)
        soda_water = Ingredient(name="Soda Water", category="Soda", subcategory="Club Soda", abv=0.0)
        coke = Ingredient(name="Cola", category="Soda", subcategory="Cola", abv=0.0)
        coconut_cream = Ingredient(name="Coconut Cream", category="Dairy", abv=0.0)
        egg_white = Ingredient(name="Egg White", category="Egg", abv=0.0)
        mint = Ingredient(name="Fresh Mint", category="Fresh Ingredient", subcategory="Herb", abv=0.0)

        db.session.add_all([
            vodka, gin, rum, dark_rum, tequila, whiskey,
            triple_sec, campari, aperol,
            sweet_vermouth, dry_vermouth,
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
        margarita.ingredients.extend([tequila, triple_sec, lime_juice])

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
        mojito.ingredients.extend([rum, lime_juice, simple_syrup, mint, soda_water])

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
        cosmopolitan.ingredients.extend([vodka, triple_sec, lime_juice, cranberry])

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
        old_fashioned.ingredients.extend([whiskey, angostura, sugar_cube])

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
        negroni.ingredients.extend([gin, campari, sweet_vermouth])

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
        whiskey_sour.ingredients.extend([whiskey, lemon_juice, simple_syrup, egg_white])

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
        pina_colada.ingredients.extend([rum, pineapple, coconut_cream])

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
        aperol_spritz.ingredients.extend([aperol, prosecco, soda_water])

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
        rum_and_coke.ingredients.extend([rum, coke])

        db.session.add_all([
            margarita, mojito, cosmopolitan,
            old_fashioned, negroni, whiskey_sour,
            pina_colada, aperol_spritz, rum_and_coke
        ])
        db.session.commit()
        print("✓ Database seeded successfully")
        print(f"  - {Ingredient.query.count()} ingredients")
        print(f"  - {Cocktail.query.count()} cocktails")

if __name__ == "__main__":
    seed_database()
