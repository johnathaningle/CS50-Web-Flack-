from datetime import datetime
from typing import List

from flask import request
from ip2geotools.databases.noncommercial import DbIpCity
from sqlalchemy import desc

from flack import db
from flack.models import Log

def add_log(req: request, email: str, success: bool) -> None:
    ip_address = "0.0.0.0"
    try:
        res = DbIpCity.get(req.environ["REMOTE_ADDR"], api_key="free")
        ip_address = res.ip_address
    except:
        pass
    log = Log(ip_address=ip_address, time=datetime.now(), success=success, email=email)
    db.session.add(log)
    db.session.commit()

def validate_past_failed_logins(email: str) -> bool:
    last_success: Log = db.session.query(Log)\
        .filter(Log.email == email)\
        .filter_by(success=True)\
        .order_by(desc(Log.time))\
        .first()
    if last_success:
        failed_logs: List[Log] = db.session.query(Log)\
            .filter_by(email=email)\
            .filter(Log.time > last_success.time)\
            .all()
        if len(failed_logs) > 5:
            return False
        else:
            return True
    else:
        failed_log_count: int = db.session.query(Log)\
            .filter(Log.success == False)\
            .filter(Log.email == email)\
            .count()
        if failed_log_count > 15:
            return False
        else:
            return True
