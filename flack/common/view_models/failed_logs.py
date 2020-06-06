
from typing import List, Tuple

from flack.models import Log

class LogIpInfo:
    ip: str
    logs: List[Log]
    total_failures: int
    attempted_emails: List[str]

class FailedLogsViewModel:
    log_ip_groups: List[LogIpInfo]

    def __init__(self) -> None:
        self.log_ip_groups = []




