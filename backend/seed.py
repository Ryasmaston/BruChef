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
            {"username": "admin", "email": "admin@email.com", "password": "Password123", "is_admin": True},
            {"username": "Alice", "email": "alice@email.com", "password": "Password123", "is_admin": False},
            {"username": "John", "email": "john@email.com", "password": "Password123", "is_admin": False}
        ]
        users = []
        for data in users_data:
            user = User(username=data["username"], email=data["email"], is_admin=data.get("is_admin", False))
            user.set_password(data["password"])
            users.append(user)
        db.session.add_all(users)
        db.session.commit()

        print("Creating base ingredients")

        base_vodka = Ingredient(name="Vodka", category="Spirit", subcategory="Vodka", abv=40.0,
            description="A clear, neutral spirit distilled from grains or potatoes.")
        base_gin = Ingredient(name="Gin", category="Spirit", subcategory="Gin", abv=40.0,
            description="A juniper-flavoured spirit with botanical infusions.")
        base_white_rum = Ingredient(name="White Rum", category="Spirit", subcategory="Rum", abv=40.0,
            description="A light-bodied rum distilled from sugarcane or molasses.")
        base_dark_rum = Ingredient(name="Dark Rum", category="Spirit", subcategory="Rum", abv=40.0,
            description="A rich, full-bodied rum aged in charred oak barrels.")
        base_tequila = Ingredient(name="Tequila", category="Spirit", subcategory="Tequila", abv=40.0,
            description="A Mexican spirit distilled from blue agave plants.")
        base_bourbon = Ingredient(name="Bourbon Whiskey", category="Spirit", subcategory="Bourbon", abv=45.0,
            description="An American whiskey aged in new charred oak barrels.")
        base_scotch = Ingredient(name="Scotch Whisky", category="Spirit", subcategory="Scotch", abv=40.0,
            description="A malt or grain whisky made in Scotland.")
        base_irish_whiskey = Ingredient(name="Irish Whiskey", category="Spirit", subcategory="Whiskey", abv=40.0,
            description="A smooth whiskey distilled and aged in Ireland.")
        base_rye = Ingredient(name="Rye Whiskey", category="Spirit", subcategory="Whiskey", abv=40.0,
            description="A whiskey made with a majority rye grain mash.")
        base_brandy = Ingredient(name="Brandy", category="Spirit", subcategory="Brandy", abv=40.0,
            description="A spirit distilled from wine or fermented fruit juice.")
        base_cognac = Ingredient(name="Cognac", category="Spirit", subcategory="Cognac", abv=40.0,
            description="A variety of brandy from the Cognac region of France.")
        base_mezcal = Ingredient(name="Mezcal", category="Spirit", subcategory="Mezcal", abv=40.0,
            description="A smoky Mexican spirit made from agave.")
        base_spiced_rum = Ingredient(name="Spiced Rum", category="Spirit", subcategory="Rum", abv=40.0,
            description="Rum infused with spices such as vanilla, cinnamon, and clove.")
        base_triple_sec = Ingredient(name="Triple Sec", category="Liqueur", subcategory="Orange", abv=30.0,
            description="A clear orange-flavoured liqueur.")
        base_campari = Ingredient(name="Campari", category="Liqueur", subcategory="Herbal", abv=24.0,
            description="An iconic Italian bitter liqueur with a distinctive red colour.")
        base_aperol = Ingredient(name="Aperol", category="Liqueur", subcategory="Herbal", abv=11.0,
            description="A bright orange Italian aperitif with a bittersweet flavour.")
        base_amaretto = Ingredient(name="Amaretto", category="Liqueur", subcategory="Nut", abv=28.0,
            description="A sweet Italian liqueur with an almond flavour.")
        base_coffee_liqueur = Ingredient(name="Coffee Liqueur", category="Liqueur", subcategory="Coffee", abv=20.0,
            description="A sweet coffee-flavoured liqueur.")
        base_cream_liqueur = Ingredient(name="Cream Liqueur", category="Liqueur", subcategory="Cream", abv=17.0,
            description="A liqueur combining cream with a spirit base.")
        base_raspberry_liqueur = Ingredient(name="Raspberry Liqueur", category="Liqueur", subcategory="Fruit", abv=16.0,
            description="A sweet fruit liqueur made from raspberries.")
        base_elderflower_liqueur = Ingredient(name="Elderflower Liqueur", category="Liqueur", subcategory="Herbal", abv=20.0,
            description="A floral liqueur made from elderflower blossoms.")
        base_peach_schnapps = Ingredient(name="Peach Schnapps", category="Liqueur", subcategory="Fruit", abv=20.0,
            description="A sweet peach-flavoured liqueur.")
        base_blue_curacao = Ingredient(name="Blue Curaçao", category="Liqueur", subcategory="Orange", abv=25.0,
            description="A blue-coloured orange-flavoured liqueur.")
        base_creme_de_menthe = Ingredient(name="Crème de Menthe", category="Liqueur", subcategory="Herbal", abv=25.0,
            description="A sweet mint-flavoured liqueur.")
        base_creme_de_cacao = Ingredient(name="Crème de Cacao", category="Liqueur", subcategory="Chocolate", abv=25.0,
            description="A chocolate-flavoured liqueur.")
        base_sweet_vermouth = Ingredient(name="Sweet Vermouth", category="Wine", subcategory="Fortified", abv=16.0,
            description="A sweet fortified wine used in Manhattans and Negronis.")
        base_dry_vermouth = Ingredient(name="Dry Vermouth", category="Wine", subcategory="Fortified", abv=18.0,
            description="A dry fortified wine used in Martinis.")
        base_prosecco = Ingredient(name="Prosecco", category="Wine", subcategory="Sparkling", abv=11.0,
            description="An Italian sparkling wine.")
        base_champagne = Ingredient(name="Champagne", category="Wine", subcategory="Sparkling", abv=12.0,
            description="A French sparkling wine from the Champagne region.")
        base_angostura = Ingredient(name="Angostura Bitters", category="Bitters", subcategory="Aromatic", abv=44.7,
            description="A concentrated botanical extract from Trinidad.")
        base_orange_bitters = Ingredient(name="Orange Bitters", category="Bitters", subcategory="Orange", abv=28.0,
            description="A bitter citrus-forward cocktail additive.")
        base_peychauds = Ingredient(name="Peychaud's Bitters", category="Bitters", subcategory="Aromatic", abv=35.0,
            description="A gentian-based bitters with a floral, anise character.")
        base_lime_juice = Ingredient(name="Lime Juice", category="Juice", subcategory="Citrus", abv=0.0,
            description="Freshly squeezed lime juice providing bright, tart acidity.")
        base_lemon_juice = Ingredient(name="Lemon Juice", category="Juice", subcategory="Citrus", abv=0.0,
            description="Fresh lemon juice offering balanced acidity and citrus brightness.")
        base_orange_juice = Ingredient(name="Orange Juice", category="Juice", subcategory="Citrus", abv=0.0,
            description="Freshly squeezed orange juice with sweet citrus flavour.")
        base_cranberry_juice = Ingredient(name="Cranberry Juice", category="Juice", subcategory="Berry", abv=0.0,
            description="A tart, ruby-red juice that adds colour and fruity acidity.")
        base_pineapple_juice = Ingredient(name="Pineapple Juice", category="Juice", subcategory="Tropical", abv=0.0,
            description="A sweet, tropical juice perfect for tiki drinks.")
        base_grapefruit_juice = Ingredient(name="Grapefruit Juice", category="Juice", subcategory="Citrus", abv=0.0,
            description="A tart, slightly bitter citrus juice used in Palomas and other cocktails.")
        base_simple_syrup = Ingredient(name="Simple Syrup", category="Syrup", subcategory="Simple", abv=0.0,
            description="A 1:1 mixture of sugar and water.")
        base_sugar_cube = Ingredient(name="Sugar Cube", category="Syrup", subcategory="Simple", abv=0.0,
            description="A measured cube of sugar used in Old Fashioneds and Champagne cocktails.")
        base_grenadine = Ingredient(name="Grenadine", category="Syrup", subcategory="Grenadine", abv=0.0,
            description="A sweet pomegranate syrup used for colour and sweetness.")
        base_honey_syrup = Ingredient(name="Honey Syrup", category="Syrup", subcategory="Honey", abv=0.0,
            description="A mixture of honey and water used as a natural sweetener.")
        base_agave_syrup = Ingredient(name="Agave Syrup", category="Syrup", subcategory="Agave", abv=0.0,
            description="A natural sweetener made from agave nectar.")
        base_soda_water = Ingredient(name="Soda Water", category="Soda", subcategory="Club Soda", abv=0.0,
            description="Carbonated water that adds effervescence without sweetness.")
        base_tonic_water = Ingredient(name="Tonic Water", category="Soda", subcategory="Tonic", abv=0.0,
            description="A carbonated soft drink containing quinine, with a bitter flavour.")
        base_ginger_beer = Ingredient(name="Ginger Beer", category="Soda", subcategory="Ginger Beer", abv=0.0,
            description="A spicy, fermented ginger drink. Essential for Moscow Mules and Dark & Stormys.")
        base_cola = Ingredient(name="Cola", category="Soda", subcategory="Cola", abv=0.0,
            description="A sweet, caramel-flavoured carbonated soft drink.")
        base_coconut_cream = Ingredient(name="Coconut Cream", category="Dairy", subcategory="Coconut Cream", abv=0.0,
            description="A thick, rich cream made from coconut meat and water.")
        base_heavy_cream = Ingredient(name="Heavy Cream", category="Dairy", subcategory="Cream", abv=0.0,
            description="Full-fat dairy cream used to add richness to cocktails.")
        base_egg_white = Ingredient(name="Egg White", category="Egg", subcategory="Egg White", abv=0.0,
            description="Fresh egg whites that create silky foam when shaken.")
        base_whole_egg = Ingredient(name="Whole Egg", category="Egg", subcategory="Whole Egg", abv=0.0,
            description="A whole egg used in flips and other egg-based cocktails.")
        base_mint = Ingredient(name="Fresh Mint", category="Fresh Ingredient", subcategory="Herb", abv=0.0,
            description="Aromatic herb with refreshing menthol notes.")
        base_basil = Ingredient(name="Fresh Basil", category="Fresh Ingredient", subcategory="Herb", abv=0.0,
            description="A sweet aromatic herb that pairs well with gin and vodka.")
        base_cucumber = Ingredient(name="Cucumber", category="Fresh Ingredient", subcategory="Vegetable", abv=0.0,
            description="Adds a cool, fresh flavour when muddled or used as garnish.")

        all_base_ingredients = [
            base_vodka, base_gin, base_white_rum, base_dark_rum, base_tequila,
            base_bourbon, base_scotch, base_irish_whiskey, base_rye, base_brandy,
            base_cognac, base_mezcal, base_spiced_rum,
            base_triple_sec, base_campari, base_aperol, base_amaretto,
            base_coffee_liqueur, base_cream_liqueur, base_raspberry_liqueur,
            base_elderflower_liqueur, base_peach_schnapps, base_blue_curacao,
            base_creme_de_menthe, base_creme_de_cacao,
            base_sweet_vermouth, base_dry_vermouth, base_prosecco, base_champagne,
            base_angostura, base_orange_bitters, base_peychauds,
            base_lime_juice, base_lemon_juice, base_orange_juice,
            base_cranberry_juice, base_pineapple_juice, base_grapefruit_juice,
            base_simple_syrup, base_sugar_cube, base_grenadine,
            base_honey_syrup, base_agave_syrup,
            base_soda_water, base_tonic_water, base_ginger_beer, base_cola,
            base_coconut_cream, base_heavy_cream,
            base_egg_white, base_whole_egg,
            base_mint, base_basil, base_cucumber
        ]
        db.session.add_all(all_base_ingredients)
        db.session.commit()

        print("Creating specific ingredients (children of base ingredients)")

        grey_goose = Ingredient(name="Grey Goose", category="Spirit", subcategory="Vodka", abv=40.0,
            description="A premium French vodka distilled from wheat.", parent_id=base_vodka.id)
        absolut = Ingredient(name="Absolut Vodka", category="Spirit", subcategory="Vodka", abv=40.0,
            description="A Swedish vodka known for its clean, smooth taste.", parent_id=base_vodka.id)
        hendricks = Ingredient(name="Hendrick's Gin", category="Spirit", subcategory="Gin", abv=41.4,
            description="A Scottish gin distilled with cucumber and rose petals.", parent_id=base_gin.id)
        tanqueray = Ingredient(name="Tanqueray Gin", category="Spirit", subcategory="Gin", abv=43.1,
            description="A classic London Dry gin with juniper and citrus notes.", parent_id=base_gin.id)
        bombay = Ingredient(name="Bombay Sapphire", category="Spirit", subcategory="Gin", abv=47.0,
            description="A London Dry gin with 10 hand-selected botanicals.", parent_id=base_gin.id)
        bacardi = Ingredient(name="Bacardí White Rum", category="Spirit", subcategory="Rum", abv=40.0,
            description="A light, crisp white rum from Puerto Rico.", parent_id=base_white_rum.id)
        captain_morgan = Ingredient(name="Captain Morgan Spiced Rum", category="Spirit", subcategory="Rum", abv=35.0,
            description="A popular spiced rum with vanilla and caramel notes.", parent_id=base_spiced_rum.id)
        patron = Ingredient(name="Patrón Silver", category="Spirit", subcategory="Tequila", abv=40.0,
            description="A smooth, ultra-premium silver tequila.", parent_id=base_tequila.id)
        jose_cuervo = Ingredient(name="Jose Cuervo Especial", category="Spirit", subcategory="Tequila", abv=38.0,
            description="A well-known gold tequila blended for smoothness.", parent_id=base_tequila.id)
        makers_mark = Ingredient(name="Maker's Mark", category="Spirit", subcategory="Bourbon", abv=45.0,
            description="A wheated bourbon with a soft, sweet flavour.", parent_id=base_bourbon.id)
        jack_daniels = Ingredient(name="Jack Daniel's", category="Spirit", subcategory="Whiskey", abv=40.0,
            description="A Tennessee whiskey charcoal-mellowed for smoothness.", parent_id=base_bourbon.id)
        cointreau = Ingredient(name="Cointreau", category="Liqueur", subcategory="Orange", abv=40.0,
            description="A premium French orange liqueur.", parent_id=base_triple_sec.id)
        grand_marnier = Ingredient(name="Grand Marnier", category="Liqueur", subcategory="Orange", abv=40.0,
            description="A blend of cognac and distilled essence of orange.", parent_id=base_triple_sec.id)
        kahlua = Ingredient(name="Kahlúa", category="Liqueur", subcategory="Coffee", abv=20.0,
            description="A coffee-flavoured rum-based liqueur.", parent_id=base_coffee_liqueur.id)
        baileys = Ingredient(name="Baileys Irish Cream", category="Liqueur", subcategory="Cream", abv=17.0,
            description="An Irish whiskey and cream liqueur.", parent_id=base_cream_liqueur.id)
        chambord = Ingredient(name="Chambord", category="Liqueur", subcategory="Fruit", abv=16.5,
            description="A French black raspberry liqueur.", parent_id=base_raspberry_liqueur.id)
        st_germain = Ingredient(name="St-Germain", category="Liqueur", subcategory="Herbal", abv=20.0,
            description="A French elderflower liqueur with a delicate floral flavour.", parent_id=base_elderflower_liqueur.id)
        frangelico = Ingredient(name="Frangelico", category="Liqueur", subcategory="Nut", abv=20.0,
            description="An Italian hazelnut liqueur.", parent_id=base_amaretto.id)

        all_specific_ingredients = [
            grey_goose, absolut,
            hendricks, tanqueray, bombay,
            bacardi, captain_morgan,
            patron, jose_cuervo,
            makers_mark, jack_daniels,
            cointreau, grand_marnier, kahlua, baileys, chambord, st_germain, frangelico
        ]
        db.session.add_all(all_specific_ingredients)
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
                {'cocktail_id': margarita.id, 'ingredient_id': base_tequila.id, 'quantity': '2 oz'},
                {'cocktail_id': margarita.id, 'ingredient_id': base_triple_sec.id, 'quantity': '1 oz'},
                {'cocktail_id': margarita.id, 'ingredient_id': base_lime_juice.id, 'quantity': '1 oz'}
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
                {'cocktail_id': mojito.id, 'ingredient_id': base_white_rum.id, 'quantity': '2 oz'},
                {'cocktail_id': mojito.id, 'ingredient_id': base_lime_juice.id, 'quantity': '0.75 oz'},
                {'cocktail_id': mojito.id, 'ingredient_id': base_simple_syrup.id, 'quantity': '0.5 oz'},
                {'cocktail_id': mojito.id, 'ingredient_id': base_mint.id, 'quantity': '8 leaves'},
                {'cocktail_id': mojito.id, 'ingredient_id': base_soda_water.id, 'quantity': 'Top with'}
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
                {'cocktail_id': cosmopolitan.id, 'ingredient_id': base_vodka.id, 'quantity': '1.5 oz'},
                {'cocktail_id': cosmopolitan.id, 'ingredient_id': base_triple_sec.id, 'quantity': '0.5 oz'},
                {'cocktail_id': cosmopolitan.id, 'ingredient_id': base_lime_juice.id, 'quantity': '0.5 oz'},
                {'cocktail_id': cosmopolitan.id, 'ingredient_id': base_cranberry_juice.id, 'quantity': '0.25 oz'}
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
                {'cocktail_id': old_fashioned.id, 'ingredient_id': base_bourbon.id, 'quantity': '2 oz'},
                {'cocktail_id': old_fashioned.id, 'ingredient_id': base_angostura.id, 'quantity': '2 dashes'},
                {'cocktail_id': old_fashioned.id, 'ingredient_id': base_sugar_cube.id, 'quantity': '1 cube'}
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
                {'cocktail_id': negroni.id, 'ingredient_id': base_gin.id, 'quantity': '1 oz'},
                {'cocktail_id': negroni.id, 'ingredient_id': base_campari.id, 'quantity': '1 oz'},
                {'cocktail_id': negroni.id, 'ingredient_id': base_sweet_vermouth.id, 'quantity': '1 oz'}
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
                {'cocktail_id': whiskey_sour.id, 'ingredient_id': base_bourbon.id, 'quantity': '2 oz'},
                {'cocktail_id': whiskey_sour.id, 'ingredient_id': base_lemon_juice.id, 'quantity': '0.75 oz'},
                {'cocktail_id': whiskey_sour.id, 'ingredient_id': base_simple_syrup.id, 'quantity': '0.5 oz'},
                {'cocktail_id': whiskey_sour.id, 'ingredient_id': base_egg_white.id, 'quantity': '1 egg white'}
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
                {'cocktail_id': pina_colada.id, 'ingredient_id': base_white_rum.id, 'quantity': '2 oz'},
                {'cocktail_id': pina_colada.id, 'ingredient_id': base_pineapple_juice.id, 'quantity': '3 oz'},
                {'cocktail_id': pina_colada.id, 'ingredient_id': base_coconut_cream.id, 'quantity': '1.5 oz'}
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
                {'cocktail_id': aperol_spritz.id, 'ingredient_id': base_prosecco.id, 'quantity': '3 oz'},
                {'cocktail_id': aperol_spritz.id, 'ingredient_id': base_aperol.id, 'quantity': '2 oz'},
                {'cocktail_id': aperol_spritz.id, 'ingredient_id': base_soda_water.id, 'quantity': 'Splash'}
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
                {'cocktail_id': rum_and_coke.id, 'ingredient_id': base_white_rum.id, 'quantity': '2 oz'},
                {'cocktail_id': rum_and_coke.id, 'ingredient_id': base_cola.id, 'quantity': 'Fill'}
            ])
        )

        moscow_mule = Cocktail(
            name="Moscow Mule",
            description="A refreshing vodka cocktail with ginger beer and lime",
            instructions="""Fill copper mug with ice
                            Add vodka and lime juice
                            Top with ginger beer
                            Stir gently
                            Garnish with lime wedge and mint""",
            glass_type="Copper Mug",
            garnish="Lime wedge, mint sprig",
            difficulty="Easy",
            status="approved",
            user_id=None
        )
        db.session.add(moscow_mule)
        db.session.flush()
        db.session.execute(
            cocktail_ingredients.insert().values([
                {'cocktail_id': moscow_mule.id, 'ingredient_id': base_vodka.id, 'quantity': '2 oz'},
                {'cocktail_id': moscow_mule.id, 'ingredient_id': base_lime_juice.id, 'quantity': '0.5 oz'},
                {'cocktail_id': moscow_mule.id, 'ingredient_id': base_ginger_beer.id, 'quantity': 'Fill'}
            ])
        )

        gin_tonic = Cocktail(
            name="Gin & Tonic",
            description="A classic highball with gin and tonic water",
            instructions="""Fill highball glass with ice
                            Add gin
                            Top with tonic water
                            Garnish with lime wedge""",
            glass_type="Highball",
            garnish="Lime wedge",
            difficulty="Easy",
            status="approved",
            user_id=None
        )
        db.session.add(gin_tonic)
        db.session.flush()
        db.session.execute(
            cocktail_ingredients.insert().values([
                {'cocktail_id': gin_tonic.id, 'ingredient_id': base_gin.id, 'quantity': '2 oz'},
                {'cocktail_id': gin_tonic.id, 'ingredient_id': base_tonic_water.id, 'quantity': 'Fill'}
            ])
        )

        daiquiri = Cocktail(
            name="Daiquiri",
            description="A classic rum sour with lime and sugar",
            instructions="""Add rum, lime juice, and simple syrup to shaker with ice
                            Shake well
                            Strain into chilled coupe glass""",
            glass_type="Coupe",
            garnish="Lime wheel",
            difficulty="Easy",
            status="approved",
            user_id=None
        )
        db.session.add(daiquiri)
        db.session.flush()
        db.session.execute(
            cocktail_ingredients.insert().values([
                {'cocktail_id': daiquiri.id, 'ingredient_id': base_white_rum.id, 'quantity': '2 oz'},
                {'cocktail_id': daiquiri.id, 'ingredient_id': base_lime_juice.id, 'quantity': '1 oz'},
                {'cocktail_id': daiquiri.id, 'ingredient_id': base_simple_syrup.id, 'quantity': '0.75 oz'}
            ])
        )

        db.session.commit()

        print("✓ Database seeded successfully")
        print(f"  - {User.query.count()} users")
        print(f"  - {Ingredient.query.count()} ingredients ({Ingredient.query.filter_by(parent_id=None, user_id=None).count()} base, {Ingredient.query.filter(Ingredient.parent_id.isnot(None)).count()} specific)")
        print(f"  - {Cocktail.query.count()} cocktails")


if __name__ == "__main__":
    seed_database()
