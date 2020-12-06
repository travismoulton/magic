import os

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = 'postgres://omrurrfrlibrhd:8c355b817551d26dfb2e23e1b0e5685573e133bd405859534a3be5f07a4f4c49@ec2-3-224-97-209.compute-1.amazonaws.com:5432/dc6lphae81dd1b'
    SQLALCHEMY_TRACK_MODIFICATIONS = False