from app import create_app
from app.models import db, Cocktail, Ingredient, User, cocktail_ingredients
from app.utilities.unsplash import fetch_image_url

def assign_image(cocktail):
    try:
        image_url = fetch_image_url(f"{cocktail.name} cocktail drink")
        print(f"Fetched image for {cocktail.name}: {image_url}")
        cocktail.image_url = image_url
    except Exception:
        cocktail.image_url = None

def seed_database():
    app = create_app()
    with app.app_context():
        print("Clearing existing data")
        db.drop_all()
        db.create_all()

        print("Creating users")
        users_data = [
            {"username": "Admin", "email": "admin@email.com", "password": "Password123", "is_admin": True},
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

        base_vodka = Ingredient(name="Vodka", category="Spirit", base_type="vodka", abv=40.0, preferred_unit="oz",
            description="A clear, neutral spirit distilled from grains or potatoes.")
        base_gin = Ingredient(name="Gin", category="Spirit", base_type="gin", abv=40.0, preferred_unit="oz",
            description="A juniper-flavoured spirit with botanical infusions.")
        base_white_rum = Ingredient(name="White Rum", category="Spirit", base_type="rum", abv=40.0, preferred_unit="oz",
            description="A light-bodied rum distilled from sugarcane or molasses.")
        base_dark_rum = Ingredient(name="Dark Rum", category="Spirit", base_type="rum", abv=40.0, preferred_unit="oz",
            description="A rich, full-bodied rum aged in charred oak barrels.")
        base_spiced_rum = Ingredient(name="Spiced Rum", category="Spirit", base_type="rum", abv=40.0, preferred_unit="oz",
            description="Rum infused with spices such as vanilla, cinnamon, and clove.")
        base_tequila = Ingredient(name="Tequila", category="Spirit", base_type="tequila", abv=40.0, preferred_unit="oz",
            description="A Mexican spirit distilled from blue agave plants.")
        base_bourbon = Ingredient(name="Bourbon Whiskey", category="Spirit", base_type="whiskey", abv=45.0, preferred_unit="oz",
            description="An American whiskey aged in new charred oak barrels.")
        base_scotch = Ingredient(name="Scotch Whisky", category="Spirit", base_type="whiskey", abv=40.0, preferred_unit="oz",
            description="A malt or grain whisky made in Scotland.")
        base_irish_whiskey = Ingredient(name="Irish Whiskey", category="Spirit", base_type="whiskey", abv=40.0, preferred_unit="oz",
            description="A smooth whiskey distilled and aged in Ireland.")
        base_rye = Ingredient(name="Rye Whiskey", category="Spirit", base_type="whiskey", abv=40.0, preferred_unit="oz",
            description="A whiskey made with a majority rye grain mash.")
        base_brandy = Ingredient(name="Brandy", category="Spirit", base_type="brandy", abv=40.0, preferred_unit="oz",
            description="A spirit distilled from wine or fermented fruit juice.")
        base_cognac = Ingredient(name="Cognac", category="Spirit", base_type="brandy", abv=40.0, preferred_unit="oz",
            description="A variety of brandy from the Cognac region of France.")
        base_mezcal = Ingredient(name="Mezcal", category="Spirit", base_type="mezcal", abv=40.0, preferred_unit="oz",
            description="A smoky Mexican spirit made from agave.")
        base_triple_sec = Ingredient(name="Triple Sec", category="Liqueur", base_type="orange_liqueur", abv=30.0, preferred_unit="oz",
            description="A clear orange-flavoured Liqueur.")
        base_campari = Ingredient(name="Campari", category="Liqueur", base_type="bitter_liqueur", abv=24.0, preferred_unit="oz",
            description="An iconic Italian bitter liqueur with a distinctive red colour.")
        base_aperol = Ingredient(name="Aperol", category="Liqueur", base_type="bitter_liqueur", abv=11.0, preferred_unit="oz",
            description="A bright orange Italian aperitif with a bittersweet flavour.")
        base_amaretto = Ingredient(name="Amaretto", category="Liqueur", base_type="nut_liqueur", abv=28.0, preferred_unit="oz",
            description="A sweet Italian liqueur with an almond flavour.")
        base_coffee_liqueur = Ingredient(name="Coffee Liqueur", category="Liqueur", base_type="coffee_liqueur", abv=20.0, preferred_unit="oz",
            description="A sweet coffee-flavoured liqueur.")
        base_cream_liqueur = Ingredient(name="Cream Liqueur", category="Liqueur", base_type="cream_liqueur", abv=17.0, preferred_unit="oz",
            description="A liqueur combining cream with a spirit base.")
        base_raspberry_liqueur = Ingredient(name="Raspberry Liqueur", category="Liqueur", base_type="fruit_liqueur", abv=16.0, preferred_unit="oz",
            description="A sweet fruit liqueur made from raspberries.")
        base_elderflower_liqueur = Ingredient(name="Elderflower Liqueur", category="Liqueur", base_type="floral_liqueur", abv=20.0, preferred_unit="oz",
            description="A floral liqueur made from elderflower blossoms.")
        base_peach_schnapps = Ingredient(name="Peach Schnapps", category="Liqueur", base_type="fruit_liqueur", abv=20.0, preferred_unit="oz",
            description="A sweet peach-flavoured liqueur.")
        base_blue_curacao = Ingredient(name="Blue Curaçao", category="Liqueur", base_type="orange_liqueur", abv=25.0, preferred_unit="oz",
            description="A blue-coloured orange-flavoured liqueur.")
        base_creme_de_menthe = Ingredient(name="Crème de Menthe", category="Liqueur", base_type="herbal_liqueur", abv=25.0, preferred_unit="oz",
            description="A sweet mint-flavoured liqueur.")
        base_creme_de_cacao = Ingredient(name="Crème de Cacao", category="Liqueur", base_type="chocolate_liqueur", abv=25.0, preferred_unit="oz",
            description="A chocolate-flavoured liqueur.")
        base_sweet_vermouth = Ingredient(name="Sweet Vermouth", category="Wine and Champagne", base_type="vermouth", abv=16.0, preferred_unit="oz",
            description="A sweet fortified wine used in Manhattans and Negronis.")
        base_dry_vermouth = Ingredient(name="Dry Vermouth", category="Wine and Champagne", base_type="vermouth", abv=18.0, preferred_unit="oz",
            description="A dry fortified wine used in Martinis.")
        base_prosecco = Ingredient(name="Prosecco", category="Wine and Champagne", base_type="sparkling_wine", abv=11.0, preferred_unit="oz",
            description="An Italian sparkling wine.")
        base_champagne = Ingredient(name="Champagne", category="Wine and Champagne", base_type="sparkling_wine", abv=12.0, preferred_unit="oz",
            description="A French sparkling wine from the Champagne region.")
        base_angostura = Ingredient(name="Angostura Bitters", category="Mixer", base_type="bitters", abv=44.7, preferred_unit="dashes",
            description="A concentrated botanical extract from Trinidad.")
        base_orange_bitters = Ingredient(name="Orange Bitters", category="Mixer", base_type="bitters", abv=28.0, preferred_unit="dashes",
            description="A bitter citrus-forward cocktail additive.")
        base_peychauds = Ingredient(name="Peychaud's Bitters", category="Mixer", base_type="bitters", abv=35.0, preferred_unit="dashes",
            description="A gentian-based bitters with a floral, anise character.")
        base_lime_juice = Ingredient(name="Lime Juice", category="Mixer", base_type="citrus", abv=0.0, preferred_unit="oz",
            description="Freshly squeezed lime juice providing bright, tart acidity.")
        base_lemon_juice = Ingredient(name="Lemon Juice", category="Mixer", base_type="citrus", abv=0.0, preferred_unit="oz",
            description="Fresh lemon juice offering balanced acidity and citrus brightness.")
        base_orange_juice = Ingredient(name="Orange Juice", category="Mixer", base_type="citrus", abv=0.0, preferred_unit="oz",
            description="Freshly squeezed orange juice with sweet citrus flavour.")
        base_cranberry_juice = Ingredient(name="Cranberry Juice", category="Mixer", base_type="juice", abv=0.0, preferred_unit="oz",
            description="A tart, ruby-red juice that adds colour and fruity acidity.")
        base_pineapple_juice = Ingredient(name="Pineapple Juice", category="Mixer", base_type="juice", abv=0.0, preferred_unit="oz",
            description="A sweet, tropical juice perfect for tiki drinks.")
        base_grapefruit_juice = Ingredient(name="Grapefruit Juice", category="Mixer", base_type="citrus", abv=0.0, preferred_unit="oz",
            description="A tart, slightly bitter citrus juice.")
        base_soda_water = Ingredient(name="Soda Water", category="Mixer", base_type="soda", abv=0.0, preferred_unit=None,
            description="Carbonated water that adds effervescence without sweetness.")
        base_tonic_water = Ingredient(name="Tonic Water", category="Mixer", base_type="soda", abv=0.0, preferred_unit=None,
            description="A carbonated soft drink containing quinine, with a bitter flavour.")
        base_ginger_beer = Ingredient(name="Ginger Beer", category="Mixer", base_type="soda", abv=0.0, preferred_unit=None,
            description="A spicy, fermented ginger drink.")
        base_cola = Ingredient(name="Cola", category="Mixer", base_type="soda", abv=0.0, preferred_unit=None,
            description="A sweet, caramel-flavoured carbonated soft drink.")
        base_simple_syrup = Ingredient(name="Simple Syrup", category="Kitchen cupboard", base_type="sweetener", abv=0.0, preferred_unit="oz",
            description="A 1:1 mixture of sugar and water.")
        base_sugar_cube = Ingredient(name="Sugar Cube", category="Kitchen cupboard", base_type="sweetener", abv=0.0, preferred_unit="cubes",
            description="A measured cube of sugar used in Old Fashioneds.")
        base_grenadine = Ingredient(name="Grenadine", category="Kitchen cupboard", base_type="sweetener", abv=0.0, preferred_unit="oz",
            description="A sweet pomegranate syrup used for colour and sweetness.")
        base_honey_syrup = Ingredient(name="Honey Syrup", category="Kitchen cupboard", base_type="sweetener", abv=0.0, preferred_unit="oz",
            description="A mixture of honey and water used as a natural sweetener.")
        base_agave_syrup = Ingredient(name="Agave Syrup", category="Kitchen cupboard", base_type="sweetener", abv=0.0, preferred_unit="oz",
            description="A natural sweetener made from agave nectar.")
        base_coconut_cream = Ingredient(name="Coconut Cream", category="Kitchen cupboard", base_type="cream", abv=0.0, preferred_unit="oz",
            description="A thick, rich cream made from coconut meat and water.")
        base_heavy_cream = Ingredient(name="Heavy Cream", category="Kitchen cupboard", base_type="cream", abv=0.0, preferred_unit="oz",
            description="Full-fat dairy cream used to add richness to cocktails.")
        base_egg_white = Ingredient(name="Egg White", category="Kitchen cupboard", base_type="egg", abv=0.0, preferred_unit="pieces",
            description="Fresh egg whites that create silky foam when shaken.")
        base_whole_egg = Ingredient(name="Whole Egg", category="Kitchen cupboard", base_type="egg", abv=0.0, preferred_unit="pieces",
            description="A whole egg used in flips and other egg-based cocktails.")
        base_mint = Ingredient(name="Fresh Mint", category="Kitchen cupboard", base_type="herb", abv=0.0, preferred_unit="leaves",
            description="Aromatic herb with refreshing menthol notes.")
        base_basil = Ingredient(name="Fresh Basil", category="Kitchen cupboard", base_type="herb", abv=0.0, preferred_unit="leaves",
            description="A sweet aromatic herb that pairs well with gin and vodka.")
        base_cucumber = Ingredient(name="Cucumber", category="Kitchen cupboard", base_type="fresh", abv=0.0, preferred_unit="slices",
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

        print("Creating specific ingredients")

        grey_goose = Ingredient(name="Grey Goose", category="Spirit", base_type="vodka", abv=40.0,
            preferred_unit="oz", parent_id=base_vodka.id,
            description="A premium French vodka distilled from wheat.")
        absolut = Ingredient(name="Absolut Vodka", category="Spirit", base_type="vodka", abv=40.0,
            preferred_unit="oz", parent_id=base_vodka.id,
            description="A Swedish vodka known for its clean, smooth taste.")
        hendricks = Ingredient(name="Hendrick's Gin", category="Spirit", base_type="gin", abv=41.4,
            preferred_unit="oz", parent_id=base_gin.id,
            description="A Scottish gin distilled with cucumber and rose petals.")
        tanqueray = Ingredient(name="Tanqueray Gin", category="Spirit", base_type="gin", abv=43.1,
            preferred_unit="oz", parent_id=base_gin.id,
            description="A classic London Dry gin with juniper and citrus notes.")
        bombay = Ingredient(name="Bombay Sapphire", category="Spirit", base_type="gin", abv=47.0,
            preferred_unit="oz", parent_id=base_gin.id,
            description="A London Dry gin with 10 hand-selected botanicals.")
        bacardi = Ingredient(name="Bacardí White Rum", category="Spirit", base_type="rum", abv=40.0,
            preferred_unit="oz", parent_id=base_white_rum.id,
            description="A light, crisp white rum from Puerto Rico.")
        captain_morgan = Ingredient(name="Captain Morgan Spiced Rum", category="Spirit", base_type="rum", abv=35.0,
            preferred_unit="oz", parent_id=base_spiced_rum.id,
            description="A popular spiced rum with vanilla and caramel notes.")
        patron = Ingredient(name="Patrón Silver", category="Spirit", base_type="tequila", abv=40.0,
            preferred_unit="oz", parent_id=base_tequila.id,
            description="A smooth, ultra-premium silver tequila.")
        jose_cuervo = Ingredient(name="Jose Cuervo Especial", category="Spirit", base_type="tequila", abv=38.0,
            preferred_unit="oz", parent_id=base_tequila.id,
            description="A well-known gold tequila blended for smoothness.")
        makers_mark = Ingredient(name="Maker's Mark", category="Spirit", base_type="whiskey", abv=45.0,
            preferred_unit="oz", parent_id=base_bourbon.id,
            description="A wheated bourbon with a soft, sweet flavour.")
        jack_daniels = Ingredient(name="Jack Daniel's", category="Spirit", base_type="whiskey", abv=40.0,
            preferred_unit="oz", parent_id=base_bourbon.id,
            description="A Tennessee whiskey charcoal-mellowed for smoothness.")
        cointreau = Ingredient(name="Cointreau", category="Liqueur", base_type="orange_liqueur", abv=40.0,
            preferred_unit="oz", parent_id=base_triple_sec.id,
            description="A premium French orange liqueur.")
        grand_marnier = Ingredient(name="Grand Marnier", category="Liqueur", base_type="orange_liqueur", abv=40.0,
            preferred_unit="oz", parent_id=base_triple_sec.id,
            description="A blend of cognac and distilled essence of orange.")
        kahlua = Ingredient(name="Kahlúa", category="Liqueur", base_type="coffee_liqueur", abv=20.0,
            preferred_unit="oz", parent_id=base_coffee_liqueur.id,
            description="A coffee-flavoured rum-based liqueur.")
        baileys = Ingredient(name="Baileys Irish Cream", category="Liqueur", base_type="cream_liqueur", abv=17.0,
            preferred_unit="oz", parent_id=base_cream_liqueur.id,
            description="An Irish whiskey and cream liqueur.")
        chambord = Ingredient(name="Chambord", category="Liqueur", base_type="fruit_liqueur", abv=16.5,
            preferred_unit="oz", parent_id=base_raspberry_liqueur.id,
            description="A French black raspberry liqueur.")
        st_germain = Ingredient(name="St-Germain", category="Liqueur", base_type="floral_liqueur", abv=20.0,
            preferred_unit="oz", parent_id=base_elderflower_liqueur.id,
            description="A French elderflower liqueur with a delicate floral flavour.")
        frangelico = Ingredient(name="Frangelico", category="Liqueur", base_type="nut_liqueur", abv=20.0,
            preferred_unit="oz", parent_id=base_amaretto.id,
            description="An Italian hazelnut liqueur.")

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

        def measured(cocktail_id, ingredient_id, quantity, unit):
            return {
                'cocktail_id': cocktail_id,
                'ingredient_id': ingredient_id,
                'quantity': quantity,
                'unit': unit,
                'quantity_note': None
            }
        def instructional(cocktail_id, ingredient_id, note):
            return {
                'cocktail_id': cocktail_id,
                'ingredient_id': ingredient_id,
                'quantity': None,
                'unit': None,
                'quantity_note': note
            }
        margarita = Cocktail(
            name="Margarita",
            description="A classic tequila cocktail with lime and triple sec",
            instructions="Add tequila, triple sec, and lime juice to shaker with ice\nShake well\nStrain into salt-rimmed rocks glass\nGarnish with lime wheel",
            glass_type="Rocks", garnish="Lime wheel, salt rim", difficulty="Easy",
            status='approved', user_id=None
        )
        db.session.add(margarita)
        db.session.flush()
        assign_image(margarita)
        db.session.execute(cocktail_ingredients.insert().values([
            measured(margarita.id, base_tequila.id, 2.0, 'oz'),
            measured(margarita.id, base_triple_sec.id, 1.0, 'oz'),
            measured(margarita.id, base_lime_juice.id, 1.0, 'oz'),
        ]))

        mojito = Cocktail(
            name="Mojito",
            description="A refreshing rum cocktail with mint and lime",
            instructions="Muddle mint with simple syrup and lime juice\nAdd rum and ice\nTop with soda water\nStir gently\nGarnish with mint sprig",
            glass_type="Highball", garnish="Mint sprig", difficulty="Easy",
            status='approved', user_id=None
        )
        db.session.add(mojito)
        db.session.flush()
        assign_image(mojito)
        db.session.execute(cocktail_ingredients.insert().values([
            measured(mojito.id, base_white_rum.id, 2.0, 'oz'),
            measured(mojito.id, base_lime_juice.id, 0.75, 'oz'),
            measured(mojito.id, base_simple_syrup.id, 0.5, 'oz'),
            measured(mojito.id, base_mint.id, 8.0, 'leaves'),
            instructional(mojito.id, base_soda_water.id, 'top with'),
        ]))

        cosmopolitan = Cocktail(
            name="Cosmopolitan",
            description="A vodka cocktail with cranberry and citrus",
            instructions="Add vodka, triple sec, lime juice, cranberry juice to shaker with ice\nShake well\nStrain into chilled martini glass\nGarnish with lime wheel",
            glass_type="Martini", garnish="Lime wheel", difficulty="Medium",
            status='approved', user_id=None
        )
        db.session.add(cosmopolitan)
        db.session.flush()
        assign_image(cosmopolitan)
        db.session.execute(cocktail_ingredients.insert().values([
            measured(cosmopolitan.id, base_vodka.id, 1.5, 'oz'),
            measured(cosmopolitan.id, base_triple_sec.id, 0.5, 'oz'),
            measured(cosmopolitan.id, base_lime_juice.id, 0.5, 'oz'),
            measured(cosmopolitan.id, base_cranberry_juice.id, 0.25, 'oz'),
        ]))

        old_fashioned = Cocktail(
            name="Old Fashioned",
            description="A timeless whiskey cocktail with bitters and sugar",
            instructions="Muddle sugar cube with bitters\nAdd bourbon and ice\nStir gently\nGarnish with orange peel",
            glass_type="Rocks", garnish="Orange peel", difficulty="Easy",
            status="approved", user_id=None
        )
        db.session.add(old_fashioned)
        db.session.flush()
        assign_image(old_fashioned)
        db.session.execute(cocktail_ingredients.insert().values([
            measured(old_fashioned.id, base_bourbon.id, 2.0, 'oz'),
            measured(old_fashioned.id, base_angostura.id, 2.0, 'dashes'),
            measured(old_fashioned.id, base_sugar_cube.id, 1.0, 'cubes'),
        ]))

        negroni = Cocktail(
            name="Negroni",
            description="A bold gin cocktail with Campari and sweet vermouth",
            instructions="Add gin, Campari, sweet vermouth to mixing glass with ice\nStir until chilled\nStrain over ice in rocks glass\nGarnish with orange peel",
            glass_type="Rocks", garnish="Orange peel", difficulty="Medium",
            status="approved", user_id=None
        )
        db.session.add(negroni)
        db.session.flush()
        assign_image(negroni)
        db.session.execute(cocktail_ingredients.insert().values([
            measured(negroni.id, base_gin.id, 1.0, 'oz'),
            measured(negroni.id, base_campari.id, 1.0, 'oz'),
            measured(negroni.id, base_sweet_vermouth.id, 1.0, 'oz'),
        ]))

        whiskey_sour = Cocktail(
            name="Whiskey Sour",
            description="A balanced cocktail with lemon and egg white",
            instructions="Add whiskey, lemon juice, simple syrup, egg white\nDry shake\nAdd ice and shake again\nStrain into rocks glass\nGarnish with cherry",
            glass_type="Rocks", garnish="Cherry", difficulty="Medium",
            status="approved", user_id=None
        )
        db.session.add(whiskey_sour)
        db.session.flush()
        assign_image(whiskey_sour)
        db.session.execute(cocktail_ingredients.insert().values([
            measured(whiskey_sour.id, base_bourbon.id, 2.0, 'oz'),
            measured(whiskey_sour.id, base_lemon_juice.id, 0.75, 'oz'),
            measured(whiskey_sour.id, base_simple_syrup.id, 0.5, 'oz'),
            measured(whiskey_sour.id, base_egg_white.id, 1.0, 'pieces'),
        ]))

        pina_colada = Cocktail(
            name="Piña Colada",
            description="A tropical rum cocktail with pineapple and coconut",
            instructions="Add rum, pineapple juice, coconut cream to blender\nAdd ice and blend\nPour into hurricane glass\nGarnish with pineapple wedge",
            glass_type="Hurricane", garnish="Pineapple wedge", difficulty="Easy",
            status="approved", user_id=None
        )
        db.session.add(pina_colada)
        db.session.flush()
        assign_image(pina_colada)
        db.session.execute(cocktail_ingredients.insert().values([
            measured(pina_colada.id, base_white_rum.id, 2.0, 'oz'),
            measured(pina_colada.id, base_pineapple_juice.id, 3.0, 'oz'),
            measured(pina_colada.id, base_coconut_cream.id, 1.5, 'oz'),
        ]))

        aperol_spritz = Cocktail(
            name="Aperol Spritz",
            description="A light Italian aperitif with prosecco and Aperol",
            instructions="Fill wine glass with ice\nAdd prosecco\nAdd Aperol\nTop with soda water\nStir gently",
            glass_type="Wine", garnish="Orange slice", difficulty="Easy",
            status="approved", user_id=None
        )
        db.session.add(aperol_spritz)
        db.session.flush()
        assign_image(aperol_spritz)
        db.session.execute(cocktail_ingredients.insert().values([
            measured(aperol_spritz.id, base_prosecco.id, 3.0, 'oz'),
            measured(aperol_spritz.id, base_aperol.id, 2.0, 'oz'),
            instructional(aperol_spritz.id, base_soda_water.id, 'splash'),
        ]))

        rum_and_coke = Cocktail(
            name="Rum & Coke",
            description="A simple highball with rum and cola",
            instructions="Fill highball glass with ice\nAdd rum\nTop with cola\nStir gently",
            glass_type="Highball", garnish="Lime wedge", difficulty="Easy",
            status="approved", user_id=None
        )
        db.session.add(rum_and_coke)
        db.session.flush()
        assign_image(rum_and_coke)
        db.session.execute(cocktail_ingredients.insert().values([
            measured(rum_and_coke.id, base_white_rum.id, 2.0, 'oz'),
            instructional(rum_and_coke.id, base_cola.id, 'fill'),
        ]))

        moscow_mule = Cocktail(
            name="Moscow Mule",
            description="A refreshing vodka cocktail with ginger beer and lime",
            instructions="Fill copper mug with ice\nAdd vodka and lime juice\nTop with ginger beer\nStir gently\nGarnish with lime wedge and mint",
            glass_type="Copper Mug", garnish="Lime wedge, mint sprig", difficulty="Easy",
            status="approved", user_id=None
        )
        db.session.add(moscow_mule)
        db.session.flush()
        assign_image(moscow_mule)
        db.session.execute(cocktail_ingredients.insert().values([
            measured(moscow_mule.id, base_vodka.id, 2.0, 'oz'),
            measured(moscow_mule.id, base_lime_juice.id, 0.5, 'oz'),
            instructional(moscow_mule.id, base_ginger_beer.id, 'fill'),
        ]))

        gin_tonic = Cocktail(
            name="Gin & Tonic",
            description="A classic highball with gin and tonic water",
            instructions="Fill highball glass with ice\nAdd gin\nTop with tonic water\nGarnish with lime wedge",
            glass_type="Highball", garnish="Lime wedge", difficulty="Easy",
            status="approved", user_id=None
        )
        db.session.add(gin_tonic)
        db.session.flush()
        assign_image(gin_tonic)
        db.session.execute(cocktail_ingredients.insert().values([
            measured(gin_tonic.id, base_gin.id, 2.0, 'oz'),
            instructional(gin_tonic.id, base_tonic_water.id, 'fill'),
        ]))

        daiquiri = Cocktail(
            name="Daiquiri",
            description="A classic rum sour with lime and sugar",
            instructions="Add rum, lime juice, and simple syrup to shaker with ice\nShake well\nStrain into chilled coupe glass",
            glass_type="Coupe", garnish="Lime wheel", difficulty="Easy",
            status="approved", user_id=None
        )
        db.session.add(daiquiri)
        db.session.flush()
        assign_image(daiquiri)
        db.session.execute(cocktail_ingredients.insert().values([
            measured(daiquiri.id, base_white_rum.id, 2.0, 'oz'),
            measured(daiquiri.id, base_lime_juice.id, 1.0, 'oz'),
            measured(daiquiri.id, base_simple_syrup.id, 0.75, 'oz'),
        ]))
        db.session.commit()

        print("✓ Database seeded successfully")
        print(f"  - {User.query.count()} users")
        print(f"  - {Ingredient.query.count()} ingredients ({Ingredient.query.filter_by(parent_id=None, user_id=None).count()} base, {Ingredient.query.filter(Ingredient.parent_id.isnot(None)).count()} specific)")
        print(f"  - {Cocktail.query.count()} cocktails")


if __name__ == "__main__":
    seed_database()
