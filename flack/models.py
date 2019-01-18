from sqlalchemy import Column, ForeignKey, String, Integer
from sqlalchemy.orm import relationship
from flask_login import UserMixin
from flack import db, loginmanager

@loginmanager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String)
    user_reviews = db.relationship("Review", backref='author', lazy=True)

class Workspace(db.Model):
    id = db.Column(db.Integer, primary_key=True)