from sqlalchemy import Column, ForeignKey, String, Integer
from sqlalchemy.orm import relationship
from flask_login import UserMixin
from flack import db, loginmanager, app #remove app for production

@loginmanager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))



user_channels = db.Table('user_channels',
db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
db.Column('channel_id', db.Integer, db.ForeignKey('channel.id'))
)

workspace_channels = db.Table('workspace_channels',
db.Column('workspace_id', db.Integer, db.ForeignKey('workspace.id')),
db.Column('channel_id', db.Integer, db.ForeignKey('channel.id'))
)



class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String)
    messages = db.relationship("Message", backref='sender', lazy=True)

class Workspace(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=True)
    channels = db.relationship("Channel", secondary=workspace_channels, backref='channels', lazy=True)

class Channel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    messages = db.relationship("Message", backref='message_channel', lazy=True)
    users = db.relationship("User", secondary=user_channels, backref='users', lazy=True)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    channel_id = db.Column(db.Integer, db.ForeignKey("channel.id"))

@app.cli.command('bootstrap')
def bootstrap_data():
    db.drop_all()
    print("database dropped")
    db.create_all()
    print("database created")
    u1 = User(username='greg', password="password", email="j@email.co")
    u2 = User(username='bob', password="supersecret", email="bob@email.co")
    u3 = User(username='bsname', password="pawoaman", email="bse@email.co")
    c1 = Channel(name="General")
    c2 = Channel(name="Random")
    c3 = Channel(name="Labs")
    m1 = Message(content="Hey everyone, this is a message")
    m2 = Message(content="Hey ladies and gents, this is a second message")
    m3 = Message(content="Hey pythonistas, this is a third message")
    w1 = Workspace(name="Flack Workspace", description="The First Workspace")
    db.session.add(u1)
    db.session.add(u2)
    db.session.add(u3)
    db.session.add(c1)
    db.session.add(c2)
    db.session.add(c3)
    db.session.add(m1)
    db.session.add(m2)
    db.session.add(m3)
    db.session.add(w1)
    #assign users to channel
    c1.users.extend((u1, u2, u3))
    #add channels to workspace
    w1.channels.extend((c1, c2, c3))
    #assign messages to users
    u1.messages.append(m1)
    u2.messages.append(m2)
    u3.messages.append(m3)
    #add messagees to channel 1
    c1.messages.append(m3)
    c1.messages.append(m2)
    c1.messages.append(m1)
    db.session.commit()

    #test database queries
    w1_channels = w1.channels
    #get each channel
    for i in w1_channels:
        print(i.name)
        #print the users in each channel
        x = i.users
        for z in x:
            print("\t"+z.username)
