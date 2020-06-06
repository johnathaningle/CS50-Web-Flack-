from datetime import date, datetime
from typing import Any, Generator, List, Optional, Tuple

from flask import request
from ip2geotools.databases.noncommercial import DbIpCity
from sqlalchemy import desc

from flack import db
from flack.models import Log

MAX_LOGIN_ATTEMPTS = 15
FLAGGED_LOG_LOOKBACK = 5
FLAGGED_LOG_MIN = 10

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

def get_lat_log(ip: str) -> Tuple[str, str]:
    try:
        res = DbIpCity.get(ip, api_key="free")
        lat, lng = str(res.latitude), str(res.longitude)
        return lat, lng
    except:
        return "", ""


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

def get_logs() -> List[Log]:
    logs: List[Log] = db.session.query(Log)\
        .order_by(desc(Log.time))\
        .all()
    return logs

def group_logs_by_time(logs: List[Log]):
    previous_group: Optional[Tuple[str, List[Log]]] = None
    for group in _get_log_groups(logs):
        if previous_group is None:
            yield group
            previous_group = group
        else:
            min_date = min([log.time for log in previous_group[1]])
            if min_date not in [log.time for log in previous_group[1]]:
                yield group
                previous_group = group

def _get_log_groups(logs: List[Log]):
    ip_addresses = set([log.ip_address for log in logs])
    for ip in ip_addresses:
        ip_logs = [log for log in logs if log.ip_address == ip]
        for log in ip_logs:
            potential_group = list(_find_close_logs(log, ip_logs, FLAGGED_LOG_LOOKBACK))
            if len(potential_group) >= FLAGGED_LOG_MIN:
                yield str(ip), potential_group


def _find_close_logs(source: Log, logs: List[Log], minutes: int):
    time = source.time
    for log in logs:
        time_delta = float(abs((log.time - time).seconds) / 60.0)
        if time_delta < float(minutes) and time_delta != 0.0:
            yield log

