from app import app, db
from app.models import User, Type, Set, Card, Inventory

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Type': Type, 'Set': Set, 'Card': Card, 'Inventory': Inventory}
