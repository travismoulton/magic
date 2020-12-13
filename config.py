import os

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CELERY_RESULT_BACKEND = os.environ['CELERY_RESULT_BACKEND']
    BROKER_URL = os.environ['BROKER_URL']
    # CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'

    # BROKER_URL = 'redis://localhost:6379/0'
    
