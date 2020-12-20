from app import db, login
from datetime import datetime
from flask_login import UserMixin
from passlib.hash import sha256_crypt
from sqlalchemy import ForeignKey


class Inventory(db.Model):
    __tablename__ = 'inventory'
    id = db.Column(db.Integer, primary_key=True)
    card = db.Column(db.Integer, db.ForeignKey('cards.id'), nullable=False)
    user = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    card_name = db.Column(db.String(128))
    purchase_price = db.Column(db.Float)
    current_price = db.Column(db.Float)

    def __repr__(self):
        return f'{Card.query.filter_by(id=self.card).first()} owned by {User.query.filter_by(id=self.user).first()}'


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email= db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    last_visit = db.Column(db.DateTime, default=datetime.utcnow)
    cards = db.relationship('Inventory')  


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
    cmc = db.Column(db.Integer)

    # Should I just store the colors as a string and break the string apart as needed?
    # That is what I am currently doing here
    colors = db.Column(db.String(32))

    scryfall_id = db.Column(db.String(128))

    # Image URIs
    image_uri_small = db.Column(db.String(256))
    image_uri_normal = db.Column(db.String(256))
    image_uri_large = db.Column(db.String(256))

    mana_cost = db.Column(db.String(32))
    name = db.Column(db.String(128))
    rarity = db.Column(db.String(32))
    
    # Prices
    price_usd = db.Column(db.Float)

    set_code = db.Column(db.String(8))
    set_name = db.Column(db.String(128))
    type_line = db.Column(db.String(128))

    owned_by = db.relationship('Inventory')

    def __repr__(self):
        return f'<Card {self.name}>'


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