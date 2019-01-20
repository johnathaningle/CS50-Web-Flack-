from flack import app, db
from flack.models import User, Workspace
from flack.forms import RegistrationForm, LoginForm
from flask import render_template, redirect, flash, url_for, request, jsonify, session
from flask_login import login_user, current_user, logout_user
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

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        check_user = User.query.filter_by(email=form.email.data).first()
        if check_user and check_password_hash(check_user.password, form.password.data):
            login_user(check_user, remember=form.remember.data)
            flash('You have been logged in!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password', 'danger')
            return redirect(url_for('index'))
        return redirect(url_for('index'))
    return render_template("login.html", form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        form_username = form.username.data
        form_password = generate_password_hash(form.password.data)
        form_email = form.email.data
        form_workspace = form.workspace_name.data
        print(f"{form_username} {form_password} {form_email} {form_workspace}")
        user = User.query.filter_by(username=form_username).first()
        email = User.query.filter_by(email=form_email).first()
        workspace = Workspace.query.filter_by(name=form_workspace).first()
        if user:
            flash(f"Username {form.username.data} already exists", category='danger')
            return redirect(url_for('register'))
        if email:
            print('email already exists')
        u1 = User(username=form_username, email=form_email, password=form_password)
        if workspace:
            db.session.add(u1)
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

@app.route("/<workspace>")
def workspace(workspace):
    workspace = workspace.replace("_", " ")
    channel_list = []
    space = Workspace.query.filter_by(name=workspace).first()
    channels = space.channels
    for i in channels:
        channel_list.append(i.name)
    return jsonify(channel_list)