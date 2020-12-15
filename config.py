import os

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    # SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL'] 

    SQLALCHEMY_DATABASE_URI = 'postgres://lonottuyslcnqi:cba3fce5b194bc18b4d7baec0fcf89e247f2b80d7e10d14899c6b18f9c70eab4@ec2-54-160-120-28.compute-1.amazonaws.com:5432/d4pe21vmkfgmj0'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # CELERY_RESULT_BACKEND = os.environ['REDIS_URL']
    # BROKER_URL = os.environ['REDIS_URL']


    CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
    BROKER_URL = 'redis://localhost:6379/0'
    
