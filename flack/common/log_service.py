from datetime import datetime
from typing import List

from flask import request
from ip2geotools.databases.noncommercial import DbIpCity
from sqlalchemy import desc

from flack import db
from flack.models import Log

MAX_LOGIN_ATTEMPTS = 15

def add_log(req: request, email: str, success: bool) -> None:
    ip_address = get_ip_address(req)
    log = Log(ip_address=ip_address, time=datetime.now(), success=success, email=email)
    db.session.add(log)
    db.session.commit()

def get_ip_address(req: request) -> str:
    ip_address = "0.0.0.0"
    try:
        res = DbIpCity.get(req.environ["REMOTE_ADDR"], api_key="free")
        ip_address = res.ip_address
    except:
        pass
    return ip_address

def validate_past_failed_logins(req: request, email: str) -> bool:
    ip_address = get_ip_address(req)
    last_success: Log = db.session.query(Log)\
        .filter(Log.email == email)\
        .filter(Log.ip_address == ip_address)\
        .filter(Log.success == True)\
        .order_by(desc(Log.time))\
        .first()
    if last_success:
        failed_log_count: int = db.session.query(Log)\
            .filter_by(email=email)\
            .filter(Log.ip_address == ip_address)\
            .filter(Log.time > last_success.time)\
            .filter(Log.success == False)\
            .count()
        if failed_log_count > MAX_LOGIN_ATTEMPTS:
            return False
        else:
            return True
    else:
        failed_log_count: int = db.session.query(Log)\
            .filter_by(email=email)\
            .filter(Log.ip_address == ip_address)\
            .filter(Log.success == False)\
            .count()
        if failed_log_count > MAX_LOGIN_ATTEMPTS:
            return False
        else:
            return True


