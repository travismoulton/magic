import requests
from flask import render_template, request, redirect, url_for, jsonify
from app import app, db, celery
from flask_login import login_user, logout_user, current_user, login_required
from app.models import User, Type, Set, Card, Inventory
from datetime import datetime
from sqlalchemy import text
from time import sleep 


def get_card_from_scryfall(name, set_code):
    return requests.get(
        f'https://api.scryfall.com/cards/search?q={name}+set%3A{set_code}'
    ).json()['data'][0]


@celery.task()
def update_inventory_prices(username):
    user = User.query.filter_by(username=username).one()
    user_inv = Inventory.query.filter_by(user=user.id).all()

    for i in user_inv:
        card = Card.query.filter_by(id=i.card).one()
        scryfall_card = get_card_from_scryfall(card.name, card.set_code)
        
        if scryfall_card['prices']['usd']:
            i.current_price = scryfall_card['prices']['usd']
        else:
            i.current_price = 0
        # Set a 50 milisecond timeout for the api
        sleep(.05)

    db.session.commit()


def update_prices_on_daily_visit():
    if current_user.is_authenticated:
        d = datetime.utcnow()
        d = datetime(d.year, d.month, d.day)

        u = User.query.filter_by(username=current_user.username).first()
        lv = u.inventory_last_updated
        lv = datetime(lv.year, lv.month, lv.day)

        if (d > lv):
            update_inventory_prices.delay(u.username)
            u.inventory_last_updated = d
            db.session.commit()


@app.route('/')
def index():
    # update_prices_on_daily_visit()
    return render_template('index.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'POST':
        # Get the username and password from the form
        username = request.form.get('username')
        password = request.form.get('password')

        if not username or not password:
            error = 'You must provide a username and password to login'
            return render_template('login.html', error=error)
        
        # Get the user object associated with that username
        user = User.query.filter_by(username=username).first()

        # If there is no user with that username, dispaly an error
        if not user:
            error = 'That username does not exist'
            return render_template('login.html', error=error)
        
        # If there is a user, check to see that the password matches
        if user.check_password(password):
            # If it passes, log the user in and redirect to index
            login_user(user)
            return redirect(url_for('index'))
        
        # If the password was wrong, display an error message
        error = 'That password is incorrect'
        return render_template('login.html', error=error)  

    # If the route is reached via a get request, render the template
    return render_template('login.html')


@app.route('/register', methods=['POST', 'GET'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))

    if request.method == 'POST':
        # Get relavant information from the form
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('comfirm-password')    

        print(username, email, password, confirm_password)    

        # if the user didn't provide a necessary peice of information 
        # show an error
        if not username or not email or not password or not confirm_password:
            error = 'You must fill out all fields in order to register'
            return render_template('register.html', error=error)
        
        # if the username is taken, show an error message
        if User.query.filter_by(username=username).first():
            error = 'That username is already taken, please try a \
                different username'
            return render_template('register.html', error=error)
        
        # if the email is taken, show an error message
        if User.query.filter_by(email=email).first():
            error = 'That email is already being used, please try a \
                different email address'
            return render_template('register.html', error=error)
        
        # If the passwords don't match, display an error
        if password != confirm_password:
            error = 'Passwords do not match'
            return render_template('register.html', error=error)
        
        # If all those tests passed, create the user object
        user = User(username=username, email=email)
        user.hash_and_set(password)

        # Commit the user to the database
        db.session.add(user)
        db.session.commit()

        # Log the user in and route them to the home page
        login_user(user)
        return redirect(url_for('index'))
    
    # If it's a get request, render the template
    return render_template('register.html')    


@app.route('/logout')
def logout():
    logout_user()    
    return redirect(url_for('index'))


def get_types():
    types = {
        'basic_types': Type.query.filter_by(category='basic').all(),
        'super_types': Type.query.filter_by(category='super').all(),
        'creature_types': Type.query.filter_by(category='creature').all(),
        'planeswalker_types': Type.query.filter_by(category='planeswalker').all(),
        'land_types': Type.query.filter_by(category='land').all(),
        'artifact_types': Type.query.filter_by(category='artifact').all(),
        'enchantment_types': Type.query.filter_by(category='enchantment').all(),
        'spell_types': Type.query.filter_by(category='spell').all()
    }
    return types


def get_sets():
    sets = {
        'expansions': Set.query.filter_by(set_type='expansion').all(),
        'core': Set.query.filter_by(set_type='core').all(),
        'masters': Set.query.filter_by(set_type='masters').all(),
        'draft_innovation': Set.query.filter_by(set_type='draft_innovation').all(),
        'duel_deck': Set.query.filter_by(set_type='duel_deck').all(),
        'archenemy': Set.query.filter_by(set_type='archenemy').all(),
        'box': Set.query.filter_by(set_type='box').all(),
        'commander': Set.query.filter_by(set_type='commander'),
        'from_the_vault': Set.query.filter_by(set_type='from_the_vault').all(),
        'funny': Set.query.filter_by(set_type='funny').all(),
        'masterpiece': Set.query.filter_by(set_type='masterpiece').all(),
        'memorabilia': Set.query.filter_by(set_type='memorabilia').all(),
        'planechase': Set.query.filter_by(set_type='planechase').all(),
        'premium_deck': Set.query.filter_by(set_type='premium_deck').all(),
        'promo': Set.query.filter_by(set_type='promo').all(),
        'spellbook': Set.query.filter_by(set_type='spellbook').all(),
        'starter': Set.query.filter_by(set_type='starter').all(),
        'token': Set.query.filter_by(set_type='token').all(),
        'treasure_chest': Set.query.filter_by(set_type='treasure_chest').all(),
        'vanguard': Set.query.filter_by(set_type='vanguard').all()
    }
    return sets


@app.route('/search', methods=['GET', 'POST'])
def search():
    # update_prices_on_daily_visit()
    return render_template('search.html', types=get_types(), sets=get_sets())


@app.route('/results/<string:display_method>/<string:query>', methods=['GET', 'POST'])
def results(query, display_method):
    return render_template('search-results.html')


def add_card(card):
    if card['prices']['usd'] != None:
        price = float(card['prices']['usd'])
    else:
        price = float(0)

    new_card = Card(
            cmc = card['cmc'],
            scryfall_id = card['id'],
            name = card['name'],
            price_usd = price,
            set_code = card['set'],
            set_name = card['set_name'],
            rarity = f"#{card['rarity']}"
    )

    # For double sided cards
    if not 'card_faces' in card:
        new_card.colors = card['colors']
        new_card.image_uri_small = card['image_uris']['small']
        new_card.image_uri_normal = card['image_uris']['normal']
        new_card.image_uri_large = card['image_uris']['large']
        new_card.mana_cost = card['mana_cost']
        new_card.type_line = card['type_line']
    
    # For single sided cards
    if 'card_faces' in card:
        new_card.colors = card['card_faces'][0]['colors']
        new_card.image_uri_small = card['card_faces'][0]['image_uris']['small']
        new_card.image_uri_normal = card['card_faces'][0]['image_uris']['normal']
        new_card.image_uri_large = card['card_faces'][0]['image_uris']['large']
        new_card.mana_cost = card['card_faces'][0]['mana_cost']
        new_card.type_line = card['card_faces'][0]['type_line']

    db.session.add(new_card)    
    return


def get_purchase_price(request, card):
    if request.form.get('price') != '':
        return float(request.form.get('price'))
    else:
        if card['prices']['usd']:
            return float(card['prices']['usd'])
        # If there is no price associated with the api response
        else:
            return float(0)


def get_current_price(card):
    if card['prices']['usd']:
        return float(card['prices']['usd'])
    else:
        return float(0)


def display_for_card_page(request, card_name, card_set):
    card = get_card_from_scryfall(card_name, card_set)

    # The set_svg will be the same regardless of the card has two faces or one, 
    # and so we can set the variable for both single and double sided cards
    set_svg = { 'set_svg': requests.get(card['set_uri']).json()['icon_svg_uri'] }

    #If the card has two faces, the JSON that comes back is different
    if 'card_faces' in card:
        face_one = card['card_faces'][0]
        face_two = card['card_faces'][1]

        # In order to properly handle both double sided cards and adventure cards,
        # we set the image_uris property to the card object (which on a double sided
        # card belongs to face_one) so that we can access it from the same place in 
        # both situations in card.html
        if not card['type_line'].endswith('Adventure'):
            card['image_uris'] = { 'large': face_one['image_uris']['large'] }
            adventure = False

            if 'color_indicator' in face_two:
                color_indicator = { 'color': face_two['color_indicator'][0] }
            else:
                color_indicator = None
        
        if card['type_line'].endswith('Adventure'):
            color_indicator = None
            adventure = True

        oracle_texts = {
            'face_one_texts': face_one['oracle_text'].rsplit("\n"),
            'face_two_texts': face_two['oracle_text'].rsplit("\n")
        }
        
    # For single sided cards
    else:
        oracle_texts = {'face_one_texts': card['oracle_text'].rsplit("\n")}
        face_one = card
        face_two = None
        adventure = False
        color_indicator = None
    
    # Used to display the list of prints. This gets all different prints and
    # stores them in a list
    all_prints = requests.get(card['prints_search_uri']).json()['data']

    for p in all_prints:
        # For double sided cards and not adventure cards, we grab the image 
        # to be displayed when hovering over a card from the print list.
        # Adventure and single sided cards need no additional logic to display
        if 'card_faces' in p and not p['type_line'].endswith('Adventure'):            
            p['image_uris'] = {
                'normal': p['card_faces'][0]['image_uris']['normal']
            }
    
    return {
        'card' : card,
        'face_one' : face_one,
        'face_two' : face_two,
        'oracle_texts' : oracle_texts,
        'color_indicator' : color_indicator,
        'set_svg' : set_svg,
        'all_prints' : all_prints,
        'adventure' : adventure,        
    }


@app.route('/card/<string:card_set>/<string:card_name>', methods=['GET', 'POST'])
def display_card(card_set, card_name):
    if request.method == 'POST':   
        scryfall_card = get_card_from_scryfall(card_name, card_set)

        if not Card.query.filter_by(name=scryfall_card['name']).first():
            add_card(scryfall_card)

        purchase_price = get_purchase_price(request, scryfall_card)
        
        current_price = get_current_price(scryfall_card)
        
        user = User.query.filter_by(username=current_user.username).one()
        card = Card.query.filter_by(name=scryfall_card['name']).one()

        i = Inventory(
            card=card.id, 
            user=user.id,
            card_name=card.name,
            purchase_price=purchase_price, 
            current_price=current_price
        )
        user.cards.append(i)
        db.session.commit()

        return redirect(url_for('search'))

    if request.method == 'GET':
        values = display_for_card_page(request, card_name, card_set)
    
        return render_template(
            'card.html',
            card=values['card'],
            face_one=values['face_one'],
            face_two=values['face_two'],
            oracle_texts=values['oracle_texts'],
            color_indicator=values['color_indicator'],
            set_svg=values['set_svg'],
            all_prints=values['all_prints'],
            adventure=values['adventure'],
            user_copy=False
        )



@app.route(
  '/<string:username>/inventory/<int:inv_id>/card/<string:card_set>/<string:card_name>',
  methods=['GET', 'POST']
)
def display_user_card(username, inv_id, card_set, card_name):
    if request.method == 'GET':
        values = display_for_card_page(request, card_name, card_set)
            
        return render_template(
            'card.html',
            card=values['card'],
            face_one=values['face_one'],
            face_two=values['face_two'],
            oracle_texts=values['oracle_texts'],
            color_indicator=values['color_indicator'],
            set_svg=values['set_svg'],
            all_prints=values['all_prints'],
            adventure=values['adventure'],
            user_copy=True,
        )

    if request.method == 'POST':
        inv_item = Inventory.query.filter_by(id=inv_id).one()
        db.session.delete(inv_item)
        db.session.commit()
        return redirect(url_for('user_inventory'))



def get_inv_value(cards):
    total_inv_value = { 'value': float(0) }
    for card in cards:
        if (card.current_price):
            total_inv_value['value'] += float(card.current_price)    
    return total_inv_value


def parse_card_name_for_url(card_name):
    print(card_name)
    card_name = card_name.replace(' ', '-')

    if card_name.find('/') != -1:
        card_name = card_name[0:card_name.index('/')]
   
    print(card_name)
    return card_name

@app.route('/inventory')
def user_inventory():
    # update_prices_on_daily_visit()
    
    user = User.query.filter_by(username=current_user.username).one()
    user_inv = Inventory.query.filter_by(user=user.id).\
      order_by(Inventory.card_name).all()

    stmt = text(f'SELECT * FROM cards JOIN inventory on inventory.card = cards.id \
      WHERE inventory.user = :id ORDER BY cards.name')
    
    cards = Card.query.from_statement(stmt).params(id=user.id)

    card_links = []
    for card in cards:
        card_links.append(parse_card_name_for_url(card.name))

    return render_template(
        'inventory.html', 
        user_inv=user_inv, 
        cards=cards, 
        total_inv_value=get_inv_value(user_inv),
        search_string=f'Display all of {user.username}\'s cards',
        card_links=card_links
    )


def adjust_for_two_rarities(string):
    if string.find('rarity') != string.rfind('rarity'):
        part_one = string[0:string.find('rarity')]
        part_two = string[string.find('rarity'):string.rfind('rarity')]
        part_three = string[string.rfind('rarity'):]

        # part_two = part_two.replace('and', 'or')

        print(string.find('rarity'))
        print(string.rfind('rarity'))

        return part_one + part_two + part_three
    
    else:
        return string


def build_search_paramater_string(request):
    final_string = ''

    if request.form.get('card-name'):
        final_string += f' and name includes \
         {request.form.get("card-name")}'            
    if request.form.get('card_type'):
        final_string += f' and type includes \
        "{request.form.get("card_type")}"'            
    if request.form.get('card_set'):
        final_string += f' and set code is {request.form.get("card_set")}'            
    if 'white' in request.form:
        final_string += f' and color includes white'
    if 'red' in request.form:
        final_string += f' and color includes red'
    if 'blue' in request.form:
        final_string += f' and color includes blue'
    if 'green' in request.form:
        final_string += f' and color includes green'
    if 'black' in request.form:
        final_string += f' and color includes black'     
    if 'common' in request.form:
        final_string += f' and rarities are common'     
    if 'uncommon' in request.form:
        final_string += f' and rarities are uncommon'     
    if 'rare' in request.form:
        final_string += f' and rarities are rare'     
    if 'mythic' in request.form:
        final_string += f' and rarities are mythic'   
    if request.form.get('price'):
        if request.form.get('denomination-sorter') == '>':
            final_string += f' and price is greater than \
            ${request.form.get("price")}'
        else:
            final_string += f' and price is less than \
            ${request.form.get("price")}'

    final_string = adjust_for_two_rarities(final_string)

    if final_string == '':
        return f'Displaying all of {current_user.username}\'s cards'   
    else:
        final_string = final_string.replace(' and ', '', 1)
        return f'Displaying all of {current_user.username}\'s cards that\'s {final_string}'


def check_for_rarity(request):
    if request.form.get('common') or request.form.get('uncommon') \
      or request.form.get('rare') or request.form.get('mythic'):
        return 'AND (cards.rarity = :common OR cards.rarity = :uncommon \
            OR cards.rarity = :rare OR cards.rarity = :mythic)'
    else:
        return ''


def check_for_price(request):
    if request.form.get('price'):
        return f'AND cards.price_usd {(request.form.get("denomination-sorter"))} :price'
    else:
        return ''  


def get_price(request):
    if request.form.get('price') != '':
        return float(request.form.get('price'))
    else:
        return ''


@app.route('/inventory/search', methods=['GET', 'POST'])
def search_inventory():
    if request.method == 'GET':
        return render_template(
            'inventory_search.html',
            types=get_types(),
            sets=get_sets()
        )
    if request.method == 'POST':
        # Checking to see if checkboxes from the form are checked
        white = 'w' if 'white' in request.form else ''
        red = 'r' if 'red' in request.form else ''
        blue = 'u' if 'blue' in request.form else ''
        green = 'g' if 'green' in request.form else ''
        black = 'b' if 'black' in request.form else ''
        common = '#common' if 'common' in request.form else ''
        uncommon = '#uncommon' if 'uncommon' in request.form else ''
        rare = '#rare' if 'rare' in request.form else ''
        mythic = '#mythic' if 'mthic' in request.form else ''       

        user = User.query.filter_by(username=current_user.username).first()       

        stmt = text(f'SELECT * FROM cards JOIN inventory ON inventory.card = cards.id \
          WHERE cards.name ILIKE :name AND cards.type_line ILIKE :type_line \
          AND cards.set_name ILIKE :set_name  AND cards.colors ILIKE :white \
          AND cards.colors ILIKE :red AND cards.colors ILIKE :blue \
          AND cards.colors ILIKE :green AND cards.colors ILIKE :black \
          AND inventory.user = :user_id {check_for_rarity(request)} \
          {check_for_price(request)} ORDER BY cards.name')

        params = {
            'name': f'%{request.form.get("card-name")}%',
            'type_line': f'%{request.form.get("type-line")}%',
            'set_name': f'%{request.form.get("set")}%',
            'white': f'%{white}%',
            'red': f'%{red}%',
            'blue': f'%{blue}%',
            'green': f'%{green}%',
            'black': f'%{black}%',
            'user_id': user.id,
            'common': common,
            'uncommon': uncommon,
            'rare': rare,
            'mythic': mythic,
            'price': get_price(request)
        }

        cards = Card.query.from_statement(stmt).params(params).all()

        user_inv = Inventory.query.from_statement(stmt).params(params).all()

        return render_template(
            'inventory.html', 
            user_inv=user_inv, 
            cards=cards, 
            total_inv_value=get_inv_value(user_inv),
            search_string=build_search_paramater_string(request)
        )


# # One time route to store the types in a data base
# @app.route('/get_types')
# def get_typess():
#     creature_types = requests.get('https://api.scryfall.com/catalog/creature-types').json()['data']
#     planeswalker_types = requests.get('https://api.scryfall.com/catalog/planeswalker-types').json()['data']
#     land_types = requests.get('https://api.scryfall.com/catalog/land-types').json()['data']
#     artifact_types = requests.get('https://api.scryfall.com/catalog/artifact-types').json()['data']
#     enchantment_types = requests.get('https://api.scryfall.com/catalog/enchantment-types').json()['data']
#     spell_types = requests.get('https://api.scryfall.com/catalog/spell-types').json()['data']  

#     artifact = Type(name='Artifact', category='basic')
#     conspiracy = Type(name='Conspiracy', category='basic')
#     creature = Type(name='Creature', category='basic')
#     emblem = Type(name='Emblem', category='basic')
#     enchantment = Type(name='Enchantment', category='basic')
#     hero = Type(name='Hero', category='basic')
#     instant = Type(name='Instant', category='basic')
#     land = Type(name='Land', category='basic')
#     phenomenon = Type(name='Phenomenon', category='basic')
#     plane = Type(name='Plane', category='basic')
#     planeswalker = Type(name='Planeswalker', category='basic')
#     scheme = Type(name='Scheme', category='basic')
#     sorcery = Type(name='Sorcery', category='basic')
#     tribal = Type(name='Tribal', category='basic')
#     vanguard = Type(name='Scheme', category='basic')

#     db.session.add(artifact)
#     db.session.add(conspiracy)
#     db.session.add(creature)
#     db.session.add(emblem)
#     db.session.add(enchantment)
#     db.session.add(hero)
#     db.session.add(instant)
#     db.session.add(land)
#     db.session.add(phenomenon)
#     db.session.add(plane)
#     db.session.add(planeswalker)
#     db.session.add(scheme)
#     db.session.add(sorcery)
#     db.session.add(tribal)
#     db.session.add(vanguard)


#     for creature_type in creature_types:
#         print(creature_type)
#         creature = Type(name=creature_type, category='creature')
#         db.session.add(creature)
    
#     print('*****************************')

#     for planeswalker_type in planeswalker_types:
#         planeswalker = Type(name=planeswalker_type, category='planeswalker')
#         db.session.add(planeswalker)
    
#     print('*****************************')

#     for land_type in land_types:
#         land = Type(name=land_type, category='land')
#         db.session.add(land)
    
#     print('*****************************')

#     for artifact_type in artifact_types:
#         artifact = Type(name=artifact_type, category='artifact')
#         db.session.add(artifact)
    
#     print('*****************************')

#     for enchantment_type in enchantment_types:
#         enchantment = Type(name=enchantment_type, category='enchantment')
#         db.session.add(enchantment)
    
#     print('*****************************')

#     for spell_type in spell_types:
#         spell = Type(name=spell_type, category='spell')
#         db.session.add(spell)
    
#     print('*****************************')

#     db.session.commit()
#     return render_template('get_types.html')


# # One time route to store the sets in the database
# @app.route('/get_sets')
# def get_setss():
#     sets = requests.get('https://api.scryfall.com/sets').json()['data']

#     for s in sets:
#         new_set = Set(
#             name=s['name'],
#             code=s['code'],
#             svg=s['icon_svg_uri'],
#             set_type=s['set_type']
#         )
#         db.session.add(new_set)
    
#     db.session.commit()
    
#     return render_template('get_types.html')


# Currently not going to use this. Doesn't seem like it's having an impact on performance.
# # One time route to write html elements to a txt file
# @app.route('/import_set_html')
# def import_set_html():

#     sets = {
#         'expansions': Set.query.filter_by(set_type='expansion').all(),
#         'core': Set.query.filter_by(set_type='core').all(),
#         'masters': Set.query.filter_by(set_type='masters').all(),
#         'draft_innovation': Set.query.filter_by(set_type='draft_innovation').all(),
#         'duel_deck': Set.query.filter_by(set_type='duel_deck').all(),
#         'archenemy': Set.query.filter_by(set_type='archenemy').all(),
#         'box': Set.query.filter_by(set_type='box').all(),
#         'commander': Set.query.filter_by(set_type='commander'),
#         'from_the_vault': Set.query.filter_by(set_type='from_the_vault').all(),
#         'funny': Set.query.filter_by(set_type='funny').all(),
#         'masterpiece': Set.query.filter_by(set_type='masterpiece').all(),
#         'memorabilia': Set.query.filter_by(set_type='memorabilia').all(),
#         'planechase': Set.query.filter_by(set_type='planechase').all(),
#         'premium_deck': Set.query.filter_by(set_type='premium_deck').all(),
#         'promo': Set.query.filter_by(set_type='promo').all(),
#         'spellbook': Set.query.filter_by(set_type='spellbook').all(),
#         'starter': Set.query.filter_by(set_type='starter').all(),
#         'token': Set.query.filter_by(set_type='token').all(),
#         'treasure_chest': Set.query.filter_by(set_type='treasure_chest').all(),
#         'vanguard': Set.query.filter_by(set_type='vanguard').all()
#     }
#     for s in sets['expansions']:
#         print(s.code)

#     f = open('set_html.txt', 'w')
#     f.write('<li class="js--api-dropdown-sets-list js--sets-category-header js--expansion-header search-form__dropdown-list-category">Expansions</li>\n')
#     for s in sets['expansions']:
#         f.write(f'<li class="js--api-dropdown-sets-list js--expansion search-form__dropdown-list-option" data-set-code="{s.code}" data-set-name="{s.name}"><img src="{s.svg}" alt="set-icon" class="search-form__dropdown-list-img">{s.name} <span>({s.code})</span></li>\n')
    
#     f.close()
    
#     return (render_template('get_types.html'))