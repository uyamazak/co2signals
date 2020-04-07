from enum import Enum
from time import time


class Status(Enum):
    OK = 1
    NG = 2


class Alert:
    # 何回NGが続いたらアラートを出すか
    _continuous_ng_cout_threshold = 3
    # 前回の送信より何秒以上経っていたら出すか
    _min_alert_interval_sec = 60 * 60
    last_status = None
    last_ng_time = None
    last_ok_time = None
    last_alert_time = None
    ok_to_ng = False
    ng_to_ok = False
    continuous_ng_count = 0

    def __init__(self,
                 continuous_ng_threshold=None,
                 min_alert_interval_sec=None) -> None:
        self._min_alert_interval_sec = min_alert_interval_sec or self._min_alert_interval_sec
        self._continuous_ng_cout_threshold = continuous_ng_threshold or self._continuous_ng_cout_threshold

    def __str__(self):
        return '''last_status: {}\
        last_ng_time: {}\
        last_alert_time: {}\
        continuous_ng_count: {}\
        needs_alert: {}'''.format(self.last_status,
                                  self.last_ng_time,
                                  self.last_alert_time,
                                  self.continuous_ng_count,
                                  self.needs_alert())

    def update(self, status: Status) -> None:
        if self.last_status is Status['OK'] and status is Status['NG']:
            self.ok_to_ng = True
            self.ng_to_ok = False
            self.continuous_ng_count = 1
        elif self.last_status is Status['NG'] and status is Status['OK']:
            self.ok_to_ng = True
            self.ng_to_ok = False

        if self.last_status is Status['NG'] and status is Status['NG']:
            self.continuous_ng_count += 1

        if status is Status['OK']:
            self.continuous_ng_count = 0
            self.last_ok_time = time()
        elif status is Status['NG']:
            self.last_ng_time = time()

        self.last_status = status

    def needs_alert(self) -> bool:
        if self.continuous_ng_count <= self._continuous_ng_cout_threshold:
            return False

        if self.last_alert_time is None:
            self.last_alert_time = time()
            return True

        if time() - self.last_alert_time <= self._min_alert_interval_sec:
            return False

        self.last_alert_time = time()
        return True
