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
        dark_rum = Ingredient(name="Dark Rum", category="Spirit", abv=40.0)
        tequila = Ingredient(name="Tequila", category="Spirit", abv=40.0)
        whiskey = Ingredient(name="Bourbon Whiskey", category="Spirit", abv=45.0)
        triple_sec = Ingredient(name="Triple Sec", category="Liqueur", abv=40.0)
        campari = Ingredient(name="Campari", category="Liqueur", abv=24.0)
        aperol = Ingredient(name="Aperol", category="Liqueur", abv=11.0)
        sweet_vermouth = Ingredient(name="Sweet Vermouth", category="Fortified Wine", abv=16.0)
        dry_vermouth = Ingredient(name="Dry Vermouth", category="Fortified Wine", abv=18.0)
        prosecco = Ingredient(name="Prosecco", category="Sparkling Wine", abv=11.0)
        angostura = Ingredient(name="Angostura Bitters", category="Bitters", abv=44.7)
        lime_juice = Ingredient(name="Lime Juice", category="Mixer", abv=0.0)
        lemon_juice = Ingredient(name="Lemon Juice", category="Mixer", abv=0.0)
        simple_syrup = Ingredient(name="Simple Syrup", category="Mixer", abv=0.0)
        cranberry = Ingredient(name="Cranberry Juice", category="Mixer", abv=0.0)
        orange_juice = Ingredient(name="Orange Juice", category="Mixer", abv=0.0)
        pineapple = Ingredient(name="Pineapple Juice", category="Mixer", abv=0.0)
        coconut_cream = Ingredient(name="Coconut Cream", category="Mixer", abv=0.0)
        soda_water = Ingredient(name="Soda Water", category="Mixer", abv=0.0)
        coke = Ingredient(name="Cola", category="Mixer", abv=0.0)
        mint = Ingredient(name="Fresh Mint", category="Garnish", abv=0.0)
        egg_white = Ingredient(name="Egg White", category="Other", abv=0.0)
        sugar_cube = Ingredient(name="Sugar Cube", category="Sweetener", abv=0.0)

        db.session.add_all([
            vodka, gin, rum, dark_rum, tequila, whiskey,
            triple_sec, campari, aperol,
            sweet_vermouth, dry_vermouth,
            prosecco, angostura,
            lime_juice, lemon_juice, simple_syrup,
            cranberry, orange_juice, pineapple,
            coconut_cream, soda_water, coke,
            mint, egg_white, sugar_cube
        ])
        db.session.commit()

        print("Creating cocktails")
        margarita = Cocktail(
            name="Margarita",
            description="A classic tequila cocktail with lime and triple sec",
            instructions="""1. Add tequila, triple sec, and lime juice to shaker with ice
                            2. Shake well
                            3. Strain into salt-rimmed rocks glass
                            4. Garnish with lime wheel""",
            glass_type="Rocks",
            garnish="Lime wheel, salt rim",
            difficulty="Easy"
        )
        margarita.ingredients.extend([tequila, triple_sec, lime_juice])

        mojito = Cocktail(
            name="Mojito",
            description="A refreshing rum cocktail with mint and lime",
            instructions="""1. Muddle mint with simple syrup and lime juice
                            2. Add rum and ice
                            3. Top with soda water
                            4. Stir gently
                            5. Garnish with mint sprig""",
            glass_type="Highball",
            garnish="Mint sprig",
            difficulty="Easy"
        )
        mojito.ingredients.extend([rum, lime_juice, simple_syrup, mint, soda_water])

        cosmopolitan = Cocktail(
            name="Cosmopolitan",
            description="A vodka cocktail with cranberry and citrus",
            instructions="""1. Add vodka, triple sec, lime juice, cranberry juice to shaker with ice
            2. Shake well
            3. Strain into chilled martini glass
            4. Garnish with lime wheel""",
            glass_type="Martini",
            garnish="Lime wheel",
            difficulty="Medium"
        )
        cosmopolitan.ingredients.extend([vodka, triple_sec, lime_juice, cranberry])

        old_fashioned = Cocktail(
            name="Old Fashioned",
            description="A timeless whiskey cocktail with bitters and sugar",
            instructions="""1. Muddle sugar cube with bitters
                            2. Add bourbon and ice
                            3. Stir gently
                            4. Garnish with orange peel""",
            glass_type="Rocks",
            garnish="Orange peel",
            difficulty="Easy"
        )
        old_fashioned.ingredients.extend([whiskey, angostura, sugar_cube])

        negroni = Cocktail(
            name="Negroni",
            description="A bold gin cocktail with Campari and sweet vermouth",
            instructions="""1. Add gin, Campari, sweet vermouth to mixing glass with ice
                            2. Stir until chilled
                            3. Strain over ice in rocks glass
                            4. Garnish with orange peel""",
            glass_type="Rocks",
            garnish="Orange peel",
            difficulty="Medium"
        )
        negroni.ingredients.extend([gin, campari, sweet_vermouth])

        whiskey_sour = Cocktail(
            name="Whiskey Sour",
            description="A balanced cocktail with lemon and egg white",
            instructions="""1. Add whiskey, lemon juice, simple syrup, egg white
                            2. Dry shake
                            3. Add ice and shake again
                            4. Strain into rocks glass
                            5. Garnish with cherry""",
            glass_type="Rocks",
            garnish="Cherry",
            difficulty="Medium"
        )
        whiskey_sour.ingredients.extend([whiskey, lemon_juice, simple_syrup, egg_white])

        pina_colada = Cocktail(
            name="Piña Colada",
            description="A tropical rum cocktail with pineapple and coconut",
            instructions="""1. Add rum, pineapple juice, coconut cream to blender
                            2. Add ice and blend
                            3. Pour into hurricane glass
                            4. Garnish with pineapple wedge""",
            glass_type="Hurricane",
            garnish="Pineapple wedge",
            difficulty="Easy"
        )
        pina_colada.ingredients.extend([rum, pineapple, coconut_cream])

        aperol_spritz = Cocktail(
            name="Aperol Spritz",
            description="A light Italian aperitif with prosecco and Aperol",
            instructions="""1. Fill wine glass with ice
                            2. Add prosecco
                            3. Add Aperol
                            4. Top with soda water
                            5. Stir gently""",
            glass_type="Wine",
            garnish="Orange slice",
            difficulty="Easy"
        )
        aperol_spritz.ingredients.extend([aperol, prosecco, soda_water])

        rum_and_coke = Cocktail(
            name="Rum & Coke",
            description="A simple highball with rum and cola",
            instructions="""1. Fill highball glass with ice
                            2. Add rum
                            3. Top with cola
                            4. Stir gently""",
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
