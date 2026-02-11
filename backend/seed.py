from app import create_app
from app.models import db, Cocktail, Ingredient

def seed_database():
    app = create_app()
    with app.app_context():
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()

        print("Creating ingredients...")
        vodka = Ingredient(name="Vodka", category="Spirit", abv=40.0)
        gin = Ingredient(name="Gin", category="Spirit", abv=40.0)
        rum = Ingredient(name="White Rum", category="Spirit", abv=40.0)
        tequila = Ingredient(name="Tequila", category="Spirit", abv=40.0)
        triple_sec = Ingredient(name="Triple Sec", category="Liqueur", abv=40.0)
        lime_juice = Ingredient(name="Lime Juice", category="Mixer", abv=0.0)
        lemon_juice = Ingredient(name="Lemon Juice", category="Mixer", abv=0.0)
        simple_syrup = Ingredient(name="Simple Syrup", category="Mixer", abv=0.0)
        cranberry = Ingredient(name="Cranberry Juice", category="Mixer", abv=0.0)
        orange_juice = Ingredient(name="Orange Juice", category="Mixer", abv=0.0)
        mint = Ingredient(name="Fresh Mint", category="Garnish", abv=0.0)

        db.session.add_all([vodka, gin, rum, tequila, triple_sec, lime_juice, lemon_juice, simple_syrup, cranberry, orange_juice, mint])
        db.session.commit()

        print("Creating cocktails...")

        margarita = Cocktail(
            name="Margarita",
            description="A classic Mexican cocktail with tequila, lime, and triple sec",
            instructions="1. Add tequila, triple sec, and lime juice to a shaker with ice\n2. Shake well\n3. Strain into a salt-rimmed glass with ice\n4. Garnish with lime wheel",
            glass_type="Rocks",
            garnish="Lime wheel, salt rim",
            difficulty="Easy"
        )
        margarita.ingredients.extend([tequila, triple_sec, lime_juice])

        mojito = Cocktail(
            name="Mojito",
            description="A refreshing Cuban highball with rum, mint, and lime",
            instructions="1. Muddle mint leaves with simple syrup and lime juice\n2. Add rum and fill glass with ice\n3. Top with soda water\n4. Stir gently and garnish with mint sprig",
            glass_type="Highball",
            garnish="Mint sprig, lime wheel",
            difficulty="Easy"
        )
        mojito.ingredients.extend([rum, lime_juice, simple_syrup, mint])

        cosmopolitan = Cocktail(
            name="Cosmopolitan",
            description="A sophisticated cocktail made famous by Sex and the City",
            instructions="1. Add vodka, triple sec, lime juice, and cranberry juice to shaker with ice\n2. Shake well\n3. Strain into a chilled martini glass\n4. Garnish with lime wheel",
            glass_type="Martini",
            garnish="Lime wheel",
            difficulty="Medium"
        )
        cosmopolitan.ingredients.extend([vodka, triple_sec, lime_juice, cranberry])

        db.session.add_all([margarita, mojito, cosmopolitan])
        db.session.commit()
        print("✓ Database seeded successfully!")
        print(f"  - {Ingredient.query.count()} ingredients")
        print(f"  - {Cocktail.query.count()} cocktails")

if __name__ == "__main__":
    seed_database()
