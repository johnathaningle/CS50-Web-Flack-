
from typing import List, Tuple, Set

from flack.models import Log

class LogIpInfo:
    ip: str
    logs: List[Log]
    high_frequency_log_count: int
    total_failures: int
    attempted_emails: Set[str]

class FailedLogsViewModel:
    log_ip_groups: List[LogIpInfo]

    def __init__(self) -> None:
        self.log_ip_groups = []




