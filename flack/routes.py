from flack.common.user_service import update_password, validate_password
from flack import app, db, socketio
from flack.models import User, Workspace, Channel, Message
from flack.forms import PasswordResetForm, RegistrationForm, LoginForm
from flack.common.log_service import add_log, validate_past_failed_logins

from flask import render_template, redirect, flash, url_for, request, jsonify, session
from flask_login import login_user, current_user, logout_user
from flask_socketio import emit, join_room, send
from werkzeug.security import generate_password_hash, check_password_hash



@app.route('/')
def index():
    if current_user.is_authenticated:
        workspace_list = {}
        for workspace in current_user.workspaces:
            workspace_list[workspace.name[:2]] = workspace.name.replace(" ", "_")
        return render_template('index.html', workspaces=workspace_list, user=current_user.username)  
    else:
        return redirect(url_for('login'))

@app.route("/reset", methods=["GET", "POST"])
def reset():
    if not current_user.is_authenticated:
        return redirect(url_for("login"))
    form = PasswordResetForm()
    if form.validate_on_submit():
        if validate_password(current_user, form.current_password.data, form.new_password.data):
            update_password(current_user, form.new_password.data)
        return redirect(url_for('index'))
    else:
        return render_template("reset.html", form=form)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        if not validate_past_failed_logins(request, form.email.data):
            flash("Your account has been locked for too many failed login attempts", category="danger")
            return render_template("login.html", form=form)
        check_user = db.session.query(User).filter_by(email=form.email.data).first()
        if check_user and check_password_hash(check_user.password, form.password.data):
            login_user(check_user, remember=form.remember.data)
            add_log(request, form.email.data, True)
            flash('You have been logged in!', 'success')
            return redirect(url_for('index'))
        else:
            add_log(request, form.email.data, False)
            flash('Invalid username or password', 'danger')
            return redirect(url_for('index'))
    return render_template("login.html", form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        form_username = form.username.data
        valid_pw, valid_msg = validate_password(None, "", form.password.data)
        if not valid_pw:
            flash(valid_msg, category='danger')
            return redirect(url_for('register'))
        form_password = generate_password_hash(form.password.data)
        form_email = form.email.data
        form_workspace = form.workspace_name.data
        user = db.session.query(User).filter_by(username=form_username).first()
        email = db.session.query(User).filter_by(email=form_email).first()
        workspace = Workspace.query.filter(Workspace.name==form_workspace).first()
        if user or email:
            flash(f"Username {form.username.data} already exists", category='danger')
            return redirect(url_for('register'))
        u1 = User(username=form_username, email=form_email, password=form_password)
        if workspace:
            db.session.add(u1)
            w_channels = workspace.channels
            for channel in w_channels:
                channel.users.append(u1)
            u1.workspaces.append(workspace)
        else:
            db.session.add(u1)
            w1 = Workspace(name=form_workspace)
            db.session.add(w1)
            db.session.commit()
            u1.workspaces.append(w1)
        db.session.commit()
        flash(f"Account created for {form.username.data}", category='success')
        return (redirect(url_for('login')))
    return render_template("register.html", form=form)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))

#return a list of channels and workspaces
@app.route("/<workspace>")
def workspace(workspace):
    workspace = workspace.replace("_", " ")
    data = {}
    channel_list = []
    user_set = set()
    space = Workspace.query.filter(Workspace.name==workspace).first()
    try:
        chans = space.channels
        for i in chans:
            c_users = i.users
            if i.private == 'false':
                channel_list.append(i.name)
            for user in c_users:
                user_set.add(user.username)
        print(user_set)
        data["channels"] = channel_list
        data["users"] = list(user_set)
        return jsonify(data)
    except AttributeError:
        print("Invalid Workspace name")
        return jsonify({"channels": "none"})

@app.route("/<workspace>/<channel_name>")
def get_channel(workspace, channel_name):
    workspace = workspace.replace("_", " ")
    channel_name = channel_name.replace("_", " ")
    channel_list = []
    channel_id = ''
    space = Workspace.query.filter_by(name=workspace).first()
    chans = space.channels
    for i in chans:
        name = i.name
        if name == channel_name:
            channel_id = i.id
        channel_list.append(name)
    if channel_id:
        print(f"channel found {channel_id}")
        data = []
        messages = Message.query.filter_by(channel_id=channel_id).all()
        print(messages)
        for row in messages:
            contents = {}
            contents["id"] = row.id
            contents['content'] = row.content
            contents['username'] = row.sender.username
            data.append(dict(contents))
        return jsonify(data)
    #if the channel was not found, create a new one
    else:
        space = Workspace.query.filter_by(name=workspace).first()
        c = Channel(name=channel_name, private='false')
        u = User.query.get(current_user.id)
        db.session.add(c)
        db.session.commit()
        space.channels.append(c)
        c.users.append(u)
        db.session.commit()
        data = [{'new-channel': 'success'}]
        return jsonify(data)

@app.route('/pm/<username>')
def get_private_messages(username):
    message_list = []
    user1 = User.query.filter_by(username=username).first()
    channel_name = ""
    if user1.id > current_user.id:
        channel_name = f"{current_user.username}{current_user.id}{user1.username}{user1.id}"
    else:
        channel_name = f"{user1.username}{user1.id}{current_user.username}{current_user.id}"
    private_channel = Channel.query.filter_by(name=channel_name).first()
    if private_channel:
        messages = Message.query.filter_by(channel_id=private_channel.id).all()
        for field in messages:
            message = {}
            message['username'] = field.sender.username
            message['content'] = field.content
            message['id'] = field.id
            message_list.append(message)
        return jsonify(message_list)
    else:
        return jsonify({"status": 0})


@app.route('/rm/<messageid>')
def remove_message(messageid):
    m = Message.query.get(messageid)
    sender_id = m.sender.id
    print(f"Sender: {sender_id} Current: {current_user.id}")
    if sender_id == current_user.id:
        print("deleting message")
        db.session.execute(f"DELETE FROM message WHERE id={messageid}")
        db.session.commit()
        return jsonify({"status": 1})
    else:
        return jsonify({"status": 0})
    

@socketio.on('message')
def handle_message(message):
    try:
        message = dict(message)
        user = current_user.username
        workspace = message['workspace']
        channel = message['channel']
        c_name = channel.replace("_", " ")
        w_name = workspace.replace('_', ' ')
        content = message['message']
        if workspace != '':
            if message["private_message"] == "False":
                m = Message(content=content)
                db.session.add(m)
                db.session.commit()
                current_user.messages.append(m)
                w = Workspace.query.filter_by(name=w_name).first()
                w_channels = w.channels
                for channel in w_channels:
                    channel_name = channel.name
                    if channel_name == c_name:
                        print(f"Channel name: {channel_name} matches!")
                        channel.messages.append(m)
                        db.session.commit()
                message['user'] = user
                send({"status": 1}, broadcast=True)
            #if the message is private
            else:
                print('private message')
                user1 = User.query.filter_by(username=message["reciever"]).first()
                channel_name = ""
                if user1.id > current_user.id:
                    channel_name = f"{current_user.username}{current_user.id}{user1.username}{user1.id}"
                else:
                    channel_name = f"{user1.username}{user1.id}{current_user.username}{current_user.id}"
                private_channel = Channel.query.filter(Channel.name==channel_name).first()
                if not private_channel:
                    print('private channel created')
                    private_channel = Channel(name=channel_name)
                    db.session.add(private_channel)
                    db.session.commit()
                    private_channel.users.extend((user1, current_user))
                    w = Workspace.query.filter_by(name=w_name).first()
                    w.channels.append(private_channel)
                    db.session.commit()
                print(channel_name)
                private_message = Message(content=content)
                private_channel.messages.append(private_message)
                current_user.messages.append(private_message)
                db.session.commit()
                send({"status": 2}, broadcast=True)
    except ValueError:
        pass





