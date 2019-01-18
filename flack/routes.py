from flack import app, db
from flack.models import User
from flack.forms import RegistrationForm, LoginForm
from flask import render_template, redirect, flash, url_for, request, jsonify, session
from flask_login import login_user, current_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        flash(f'Welcome {form.email.data}, you are now logged in.', category='success')
        return redirect(url_for('index'))
    return render_template("login.html", form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        flash(f"Account created for {form.username.data}", category='success')
        return (redirect(url_for('index')))
    return render_template("register.html", form=form)