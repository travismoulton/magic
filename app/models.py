from app import db, login
from datetime import datetime
from flask_login import UserMixin
from passlib.hash import sha256_crypt
from sqlalchemy import ForeignKey




class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email= db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))


    def __repr__(self):
        return f'<User {self.username}>'

    def hash_and_set(self, password):
        self.password_hash = sha256_crypt.encrypt(password)

    def check_password(self, password):
        return sha256_crypt.verify(password, self.password_hash)


@login.user_loader
def load_user(id):
    return User.query.get(int(id))


class Card(db.Model):
    __tablename__ = 'cards'
    id = db.Column(db.Integer, primary_key=True)
    artist = db.Column(db.String(64))
    booster = db.Column(db.Boolean)
    cardmarket_id = db.Column(db.Integer)
    cmc = db.Column(db.Integer)

    just_testing = db.Column(db.Integer)

    # Should I just store the colors as a string and break the string apart as needed?
    # That is what I am currently doing here
    colors = db.Column(db.String(32))

    flavor_text = db.Column(db.String(512))
    foil = db.Column(db.Boolean)
    full_art = db.Column(db.String)

    highres_image = db.Column(db.Boolean)
    scryfall_id = db.Column(db.String(128))

    # Image URIs
    image_uri_small = db.Column(db.String(256))
    image_uri_normal = db.Column(db.String(256))
    image_uri_large = db.Column(db.String(256))
    image_uri_art_crop = db.Column(db.String(256))
    image_uri_border_crop = db.Column(db.String(256))
    image_uri_png = db.Column(db.String(256))

    keywords = db.Column(db.String(128))

    mana_cost = db.Column(db.String(32))
    name = db.Column(db.String(128))
    nonfoil = db.Column(db.Boolean)
    
    # Prices
    price_usd = db.Column(db.Integer)

    promo = db.Column(db.Boolean)
    set_code = db.Column(db.String(8))
    set_name = db.Column(db.String(128))
    set_search_uri = db.Column(db.String(128))
    set_uri = db.Column(db.String(128))
    type_line = db.Column(db.String(128))
    uri = db.Column(db.String(128))

    def __repr__(self):
        return f'<User {self.name}>'


class Type(db.Model):
    __tablename__ = 'types'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(64))
    name = db.Column(db.String(64))

    def __repr__(self):
        return f'<Type: Category - {self.category}, {self.name}>'


class Set(db.Model):
    __tablename__ = 'sets'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128))
    code = db.Column(db.String(32))
    svg = db.Column(db.String(128))
    set_type = db.Column(db.String(64))

    def __repr__(self):
        return f'<Set: {self.name}, {self.code}, {self.set_type}>'






