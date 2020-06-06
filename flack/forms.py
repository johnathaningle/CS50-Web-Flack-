from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError

class RegistrationForm(FlaskForm):
    workspace_name = StringField('Workspace Name', validators=[DataRequired(), Length(min=4, max=24)])
    username = StringField('Username', validators=[DataRequired(), Length(min=4, max=24)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo("password")])
    submit = SubmitField('Register')

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember = BooleanField('Remember Me')
    submit = SubmitField('Sign In')

class PasswordResetForm(FlaskForm):
    current_password = PasswordField("Current Password", validators=[DataRequired(), Length(min=8, max=64)])
    new_password = PasswordField("New Password", validators=[DataRequired(), Length(min=8, max=64)])
    submit = SubmitField('Reset Password')
