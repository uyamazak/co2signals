from config import (CO2SIGNALS_SENSOR_READ_INTERVAL_SECONDS,
                    CO2SIGNALS_API_REQUEST_INTERVAL_SECONDS,
                    CO2SIGNALS_API_ENABLED,
                    CO2SIGNALS_API_ADD_URL,
                    CO2SIGNALS_API_LOCATION,
                    CO2SIGNALS_API_TOKEN)
from datetime import datetime
from enum import Enum, auto
from gpiozero import LED
from time import sleep, time
import mh_z19
import requests


count = 0
leds = {
    'green': LED(2),
    'yellow': LED(3),
    'red': LED(4)
}

class Status(Enum):
    OK = auto()
    NG = auto()

class Alert:
    _last_status = None
    _last_ng_time = None
    _last_ok_time = None
    _ok_to_ng = False
    _ng_to_ok = False
    _continuous_ng_count = 0

    def __init__(self, alert_interval_sec=60):
        self._alert_interval_sec = alert_interval_sec

    def check(self, status):
        if _last_status is Status['OK'] and status is Status['NG']:
            _ok_to_ng = True
            _ng_to_ok = False
            _continuous_ng_count = 1
        else if _last_status is Status['NG'] and status is Status['OK']:
            _ok_to_ng = True
            _ng_to_ok = False
            _continuous_ng_count = 0

        if _last_status is Status['NG'] and status is Status['NG']:
            _continuous_ng_count += 1

        if status is Status['OK']:
            self._last_ok = datetime.now()
        else if status is Status['NG']:
            self._last_ng = datetime.now()

        _last_status = status

def on_single_led(on_name):
    for name, led in leds.items():
        if name == on_name:
            led.on()
        else:
            led.off()

def send_api(co2, temp):
    if CO2SIGNALS_API_ENABLED is False:
        return
    try :
        r = requests.post(CO2SIGNALS_API_ADD_URL, params={
            'co2': co2,
            'temperature': temp,
            'location': CO2SIGNALS_API_LOCATION,
            'token' : CO2SIGNALS_API_TOKEN
        })
        print(r.text)
    except Exception as e :
        print(e)

if __name__ == '__main__':
    while True:
        start = time()
        data = mh_z19.read_all()
        temp = data.get('temperature')
        co2 = data.get('co2')
        text = 'datetime: {} co2:{} tempereture:{}'.format(datetime.now(), co2, temp)
        print(text)

        if co2 < 700:
            on_single_led('green')
        if 700 <= co2 < 1000:
            on_single_led('yellow')
        if co2 >= 1000:
            on_single_led('red')

        if count % int(CO2SIGNALS_API_REQUEST_INTERVAL_SECONDS / CO2SIGNALS_SENSOR_READ_INTERVAL_SECONDS) is 0:
            send_api(co2, temp)
            count = 0

        count += 1
        end = time()
        # 処理にかかった時間をスリープ時間から引いて、スリープ時間を設定した時間に近づける
        exec_seconds = end - start
        sleep(max(CO2SIGNALS_SENSOR_READ_INTERVAL_SECONDS - exec_seconds, 0))
