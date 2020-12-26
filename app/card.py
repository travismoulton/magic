@app.route('/card/<string:card_set>/<string:card_name>', methods=['GET', 'POST'])
def display_card(card_set, card_name):
    if request.method == 'POST':   
        card = get_card_from_scryfall(card_name, card_set)

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
        
        p = float(card['prices']['usd']) if card['prices']['usd'] else float(0)
        
        user = User.query.filter_by(username=current_user.username).one()
        c = Card.query.filter_by(name=card['name']).one()

        i = Inventory(
            card=c.id, 
            user=user.id,
            card_name=card['name'],
            purchase_price=price, 
            current_price=p
        )
        user.cards.append(i)
        db.session.commit()

        return redirect(url_for('search'))


    if request.method == 'GET':
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



