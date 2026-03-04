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
                "password": "admin123",
                "is_admin": False
            },
            {
                "username": "Alice",
                "email": "alice@email.com",
                "password": "Password123",
                "is_admin": False
            },
            {
                "username": "John",
                "email": "john@email.com",
                "password": "Password123",
                "is_admin": False
            },
            {
                "username": "Ryan",
                "email": "ryan@email.com",
                "password": "Password123",
                "is_admin": True
            }
        ]
        users = []
        for data in users_data:
            user = User(
                username=data["username"],
                email=data["email"],
                is_admin=data.get("is_admin", False)
            )
            user.set_password(data["password"])
            users.append(user)

        db.session.add_all(users)
        db.session.commit()

        print("Creating ingredients")

        vodka = Ingredient(
            name="Vodka",
            category="Spirit",
            subcategory="Vodka",
            abv=40.0,
            description="A clear, neutral spirit distilled from grains or potatoes. Known for its clean taste and versatility in cocktails, vodka is one of the most popular spirits worldwide."
        )
        gin = Ingredient(
            name="Gin",
            category="Spirit",
            subcategory="Gin",
            abv=40.0,
            description="A juniper-flavored spirit with botanical infusions including coriander, angelica root, and citrus peels. London Dry is the most common style, offering a crisp, aromatic profile."
        )
        rum = Ingredient(
            name="White Rum",
            category="Spirit",
            subcategory="Rum",
            abv=40.0,
            description="A light-bodied rum distilled from sugarcane or molasses and aged briefly. Its clean, slightly sweet flavor makes it perfect for tropical cocktails like Mojitos and Daiquiris."
        )
        dark_rum = Ingredient(
            name="Dark Rum",
            category="Spirit",
            subcategory="Rum",
            abv=40.0,
            description="A rich, full-bodied rum aged in charred oak barrels, giving it deep caramel and molasses flavors. Essential for classic tiki drinks and winter cocktails."
        )
        tequila = Ingredient(
            name="Tequila",
            category="Spirit",
            subcategory="Tequila",
            abv=40.0,
            description="A Mexican spirit distilled from blue agave plants, primarily in the Jalisco region. Silver/Blanco tequila is unaged with bright, herbaceous notes perfect for Margaritas."
        )
        whiskey = Ingredient(
            name="Bourbon Whiskey",
            category="Spirit",
            subcategory="Bourbon",
            abv=45.0,
            description="An American whiskey made from at least 51% corn and aged in new charred oak barrels. Known for its sweet, vanilla, and caramel notes with a smooth finish."
        )
        triple_sec = Ingredient(
            name="Triple Sec",
            category="Liqueur",
            subcategory="Orange",
            abv=40.0,
            description="A clear, sweet orange-flavored liqueur made from dried orange peels. Essential in classics like Margaritas and Cosmopolitans, adding citrus sweetness and depth."
        )
        campari = Ingredient(
            name="Campari",
            category="Liqueur",
            subcategory="Herbal",
            abv=24.0,
            description="An iconic Italian bitter liqueur with a distinctive red color and complex herbal profile. Features notes of orange peel, cherry, and herbs, perfect for Negronis and spritzes."
        )
        aperol = Ingredient(
            name="Aperol",
            category="Liqueur",
            subcategory="Herbal",
            abv=11.0,
            description="A bright orange Italian aperitif with a bittersweet flavor profile. Lighter than Campari, it features rhubarb, gentian, and orange notes, making it ideal for refreshing spritzes."
        )
        sweet_vermouth = Ingredient(
            name="Sweet Vermouth",
            category="Wine",
            subcategory="Fortified",
            abv=16.0,
            description="An aromatized fortified wine flavored with botanicals and sweetened. Features rich, spiced notes of vanilla, cherry, and herbs. Essential in Manhattans and Negronis."
        )
        dry_vermouth = Ingredient(
            name="Dry Vermouth",
            category="Wine",
            subcategory="Fortified",
            abv=18.0,
            description="A fortified wine infused with botanicals and herbs, with minimal sweetness. Its dry, herbal character makes it perfect for Martinis and other sophisticated cocktails."
        )
        prosecco = Ingredient(
            name="Prosecco",
            category="Wine",
            subcategory="Sparkling",
            abv=11.0,
            description="An Italian sparkling wine from the Veneto region, made using the Charmat method. Light, fruity, and effervescent with notes of apple, pear, and white flowers."
        )
        angostura = Ingredient(
            name="Angostura Bitters",
            category="Bitters",
            subcategory="Aromatic",
            abv=44.7,
            description="A concentrated botanical extract from Trinidad, featuring spices like cinnamon, cloves, and cardamom. A few dashes add complexity and depth to cocktails like Old Fashioneds."
        )
        lime_juice = Ingredient(
            name="Lime Juice",
            category="Juice",
            subcategory="Citrus",
            abv=0.0,
            description="Freshly squeezed lime juice provides bright, tart acidity essential to countless cocktails. Always use fresh juice, never bottled, for the best flavor in Margaritas, Mojitos, and Daiquiris."
        )
        lemon_juice = Ingredient(
            name="Lemon Juice",
            category="Juice",
            subcategory="Citrus",
            abv=0.0,
            description="Fresh lemon juice offers balanced acidity and citrus brightness. A cornerstone of sour-style cocktails, it adds refreshing tang to Whiskey Sours, Tom Collins, and countless classics."
        )
        cranberry = Ingredient(
            name="Cranberry Juice",
            category="Juice",
            subcategory="Berry",
            abv=0.0,
            description="A tart, ruby-red juice that adds color and fruity acidity to cocktails. Choose 100% cranberry juice or cranberry cocktail depending on desired sweetness level."
        )
        orange_juice = Ingredient(
            name="Orange Juice",
            category="Juice",
            subcategory="Citrus",
            abv=0.0,
            description="Freshly squeezed orange juice brings sweet citrus flavor and natural sugars to drinks. Essential for brunch cocktails like Mimosas and Screwdrivers, always use fresh when possible."
        )
        pineapple = Ingredient(
            name="Pineapple Juice",
            category="Juice",
            subcategory="Tropical",
            abv=0.0,
            description="A sweet, tropical juice that adds exotic flair and natural sweetness to tiki drinks. Its rich flavor pairs perfectly with rum in classics like Piña Coladas and Mai Tais."
        )
        simple_syrup = Ingredient(
            name="Simple Syrup",
            category="Syrup",
            subcategory="Simple",
            abv=0.0,
            description="A 1:1 mixture of sugar and water, heated until dissolved and cooled. This liquid sweetener dissolves instantly in cold cocktails, providing clean sweetness without granulated sugar texture."
        )
        sugar = Ingredient(
            name="Sugar Cube",
            category="Syrup",
            subcategory="Simple",
            abv=0.0,
            description="A natural sweetener that balances acidity and bitterness in cocktails. Used in simple syrup or muddled form, sugar enhances flavor, smooths harsh notes, and adds body to drinks like an Old Fashioned or Mojito."
        )
        soda_water = Ingredient(
            name="Soda Water",
            category="Soda",
            subcategory="Club Soda",
            abv=0.0,
            description="Carbonated water that adds effervescence and dilution to cocktails without sweetness. Essential for highballs, spritzes, and lengthening drinks while maintaining their flavor profile."
        )
        coke = Ingredient(
            name="Cola",
            category="Soda",
            subcategory="Cola",
            abv=0.0,
            description="A sweet, caramel-flavored carbonated soft drink. Its vanilla and spice notes complement rum and whiskey in simple mixed drinks like Rum & Coke and Whiskey Cola."
        )
        coconut_cream = Ingredient(
            name="Coconut Cream",
            category="Dairy",
            subcategory="Coconut Cream",
            abv=0.0,
            description="A thick, rich cream made from coconut meat and water. Adds tropical richness and smooth texture to tiki drinks like Piña Coladas, with a sweet coconut flavor."
        )
        egg_white = Ingredient(
            name="Egg White",
            category="Egg",
            subcategory="Egg White",
            abv=0.0,
            description="Fresh egg whites create silky foam when shaken, adding luxurious texture and mouthfeel to sour-style cocktails. They also mellow harsh flavors and create beautiful presentation."
        )
        mint = Ingredient(
            name="Fresh Mint",
            category="Fresh Ingredient",
            subcategory="Herb",
            abv=0.0,
            description="Aromatic herb with refreshing menthol notes. When muddled, it releases essential oils that add cooling freshness to cocktails like Mojitos and Mint Juleps. Use fresh leaves for best results."
        )
        db.session.add_all([
            vodka, gin, rum, dark_rum, tequila, whiskey,
            triple_sec, campari, aperol,
            sweet_vermouth, dry_vermouth, prosecco,
            angostura,
            lime_juice, lemon_juice, cranberry,
            orange_juice, pineapple,
            simple_syrup, sugar,
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
            difficulty="Easy",
            status='approved',
            user_id=None
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
            difficulty="Easy",
            status='approved',
            user_id=None
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
            difficulty="Medium",
            status='approved',
            user_id=None
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
            difficulty="Easy",
            status="approved",
            user_id=None
        )
        db.session.add(old_fashioned)
        db.session.flush()
        db.session.execute(
            cocktail_ingredients.insert().values([
                {'cocktail_id': old_fashioned.id, 'ingredient_id': whiskey.id, 'quantity': '2 oz'},
                {'cocktail_id': old_fashioned.id, 'ingredient_id': angostura.id, 'quantity': '2 dashes'},
                {'cocktail_id': old_fashioned.id, 'ingredient_id': sugar.id, 'quantity': '1 cube'}
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
            difficulty="Medium",
            status="approved",
            user_id=None
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
            difficulty="Medium",
            status="approved",
            user_id=None
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
            difficulty="Easy",
            status="approved",
            user_id=None
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
            difficulty="Easy",
            status="approved",
            user_id=None
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
            difficulty="Easy",
            status="approved",
            user_id=None
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
