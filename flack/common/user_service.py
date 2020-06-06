from typing import List, Optional, Tuple

from flack import db
from flack.models import User

from werkzeug.security import check_password_hash, generate_password_hash
from flask_login import login_user, logout_user

def validate_password(user: Optional[User], old_pw: str, new_pw: str) -> Tuple[bool, str]:
    if new_pw in get_insecure_passwords():
        return False, "The password is too commonly used"
    if len(new_pw) < 8:
        return False, "Please enter a password that is at least 8 characters"
    if len(new_pw) > 64:
        return False, "Please enter a password less than 64 characters"
    if user is not None:
        if not check_password_hash(user.password, old_pw):
            return False, "The existing pasword is incorrect"

    return True, "Successful password validation"

def get_insecure_passwords() -> List[str]:
    passwords: List[str] = []
    try:
        with open("invalid_passwords.txt", "r") as infile:
            for line in infile:
                passwords.append(line)
    except:
        with open("C:/src-other/Python/SDEV300/Project8/invalid_passwords.txt", "r") as infile:
            for line in infile:
                passwords.append(line)
    passwords = [str(line).strip().replace("\n", "") for line in passwords]
    return passwords


def update_password(user: User, new_pw: str):
    check_user = db.session.query(User).filter_by(email=user.email).first()
    check_user.password = generate_password_hash(new_pw)
    logout_user()
    db.session.commit()
    login_user(check_user)



