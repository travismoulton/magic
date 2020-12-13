from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from celery import Celery



app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
login = LoginManager(app)
celery = Celery(
    app.name,
    backend=app.config['CELERY_RESULT_BACKEND'],
    broker=app.config['BROKER_URL']
)
celery.conf.update(app.config)


from app import routes, models