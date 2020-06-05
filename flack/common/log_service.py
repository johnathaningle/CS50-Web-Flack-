from datetime import datetime
from flask import request
from ip2geotools.databases.noncommercial import DbIpCity

from flack import db
from flack.models import Log

def add_log(req: request, success: bool) -> None:
    ip_address = "0.0.0.0"
    try:
        res = DbIpCity.get(req.environ["REMOTE_ADDR"], api_key="free")
        ip_address = res.ip_address
    except:
        pass
    log = Log(ip_address=ip_address, time=datetime.now(), success=success)
    db.session.add(log)
    db.session.commit()
