import requests
from flask import Flask, render_template, request, redirect, url_for, jsonify
from app import app, db, celery
from flask_login import login_user, logout_user, current_user, login_required
from app.models import User, Type, Set, Card, Inventory
import os
from datetime import datetime


@celery.task()
def update_inventory_prices():
    user = User.query.filter_by(username='travis').one()
    user_inv = Inventory.query.filter_by(user=user.id).all()

    for i in user_inv:
        card = Card.query.filter_by(id=i.card).one()
        scryfall_card = requests.get(
            f'https://api.scryfall.com/cards/search?q={card.name}'
        ).json()['data'][0]
        
        i.current_price = scryfall_card['prices']['usd']       

    db.session.commit()


def update_prices_on_daily_visit():
    if current_user.is_authenticated:
        d = datetime.utcnow()
        d = datetime(d.year, d.month, d.day)

        u = User.query.filter_by(username=current_user.username).first()
        lv = u.last_visit
        lv = datetime(lv.year, lv.month, lv.day)

        if (d > lv):
            update_inventory_prices.delay()


def update_users_last_visit():
    if current_user.is_authenticated:
        u = User.query.filter_by(username=current_user.username).first()
        u.last_visit = datetime.utcnow()
        db.session.commit()


@app.route('/')
def index():
    update_prices_on_daily_visit()
    update_users_last_visit()
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

        # if the user didn't provide a necessary peice of information 
        # show an error
        if not username or not email or not password or not confirm_password:
            error = 'You must fill out all fields in order to register'
            print(error)
            return render_template('register.html', error=error)
        
        # if the username is taken, show an error message
        if User.query.filter_by(username=username).first():
            error = 'That username is already taken, please try a \
                different username'
            print(error)
            return render_template('register.html', error=error)
        
        # if the email is taken, show an error message
        if User.query.filter_by(email=email).first():
            error = 'That email is already being used, please try a \
                different email address'
            print(error)
            return render_template('register.html', error=error)
        
        # If the passwords don't match, display an error
        if password != confirm_password:
            error = 'Passwords do not match'
            print(error)
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


@app.route('/search', methods=['GET', 'POST'])
def search():
    update_prices_on_daily_visit()
    update_users_last_visit()

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
    return render_template('search.html', types=types, sets=sets)


@app.route('/results/<string:display_method>/<string:query>', methods=['GET', 'POST'])
def results(query, display_method):
    return render_template('search-results.html')


def add_card(card):
    new_card = Card(
            cmc = card['cmc'],
            scryfall_id = card['id'],
            name = card['name'],
            price_usd = float(card['prices']['usd']),
            set_code = card['set'],
            set_name = card['set_name'],
            rarity = card['rarity']
    )

    if not 'card_faces' in card:
        new_card.colors = card['colors']
        new_card.image_uri_small = card['image_uris']['small']
        new_card.image_uri_normal = card['image_uris']['normal']
        new_card.image_uri_large = card['image_uris']['large']
        new_card.mana_cost = card['mana_cost']
        new_card.type_line = card['type_line']
    
    if 'card_faces' in card:
        new_card.colors = card['card_faces'][0]['colors']
        new_card.image_uri_small = card['card_faces'][0]['image_uris']['small']
        new_card.image_uri_normal = card['card_faces'][0]['image_uris']['normal']
        new_card.image_uri_large = card['card_faces'][0]['image_uris']['large']
        new_card.mana_cost = card['card_faces'][0]['mana_cost']
        new_card.type_line = card['card_faces'][0]['type_line']

    db.session.add(new_card)    
    return


@app.route('/card/<string:card_set>/<string:card_name>', methods=['GET', 'POST'])
def display_card(card_set, card_name):
    if request.method == 'POST':   
        # Grab the card with an api call to scryall using the set and card name. 
        card = requests.get(
            f'https://api.scryfall.com/cards/search?q={card_name}+set%3A{card_set}'
        ).json()['data'][0]

        if not Card.query.filter_by(name=card['name']).first():
            add_card(card)

        if request.form.get('price') != '':
            price = float(request.form.get('price'))
        else:
            if card['prices']['usd']:
                price = float(card['prices']['usd'])
            # If there is no price associated with the api response
            else:
                price = 0
        
        user = User.query.filter_by(username=current_user.username).one()
        c = Card.query.filter_by(name=card['name']).one()

        i = Inventory(
            card=c.id, 
            user=user.id,
            purchase_price=price, 
            current_price = float(card['prices']['usd'])
        )
        user.cards.append(i)
        db.session.commit()

        return redirect(url_for('search'))


    if request.method == 'GET':
        # Grab the card with an api call to scryall using the set and card name. 
        card = requests.get(
            f'https://api.scryfall.com/cards/search?q={card_name}+set%3A{card_set}'
        ).json()['data'][0]

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
                p['image_uris'] = {'normal': p['card_faces'][0]['image_uris']['normal']}   
    
        return render_template(
            'card.html',
            card=card,
            face_one=face_one,
            face_two=face_two,
            oracle_texts=oracle_texts,
            color_indicator = color_indicator,
            set_svg=set_svg,
            all_prints=all_prints,
            adventure=adventure,
        )


@app.route('/inventory')
def user_inventory():
    update_prices_on_daily_visit()
    update_users_last_visit()
    
    user = User.query.filter_by(username=current_user.username).one()
    user_inv = Inventory.query.filter_by(user=user.id).all()
    cards = []
    data = []

    total_inv_value = {'value': 0}
    for i in user_inv:
        cards.append(Card.query.filter_by(id=i.card).one())      

        if (i.current_price):
            total_inv_value['value'] += float(i.current_price)

    return render_template(
        'inventory.html', 
        user_inv=user_inv, 
        cards=cards, 
        total_inv_value=total_inv_value,
    )


# # One time route to store the types in a data base
# @app.route('/get_types')
# def get_types():
#     creature_types = requests.get('https://api.scryfall.com/catalog/creature-types').json()['data']
#     planeswalker_types = requests.get('https://api.scryfall.com/catalog/planeswalker-types').json()['data']
#     land_types = requests.get('https://api.scryfall.com/catalog/land-types').json()['data']
#     artifact_types = requests.get('https://api.scryfall.com/catalog/artifact-types').json()['data']
#     enchantment_types = requests.get('https://api.scryfall.com/catalog/enchantment-types').json()['data']
#     spell_types = requests.get('https://api.scryfall.com/catalog/spell-types').json()['data']  

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
# def get_sets():
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