from config import (CO2SIGNALS_API_ADD_URL,
                    CO2SIGNALS_API_LOCATION,
                    CO2SIGNALS_API_TOKEN)
from datetime import datetime
from gpiozero import LED
from time import sleep, time
import mh_z19
import requests

#センサーから値を取得する間隔の秒数
READ_INTERVAL_SECONDS = 3
#APIにデータを送る間隔の秒数
API_REQUEST_INTERVAL_SECONDS = 60
count = 0
leds = {
    'green': LED(2),
    'yellow': LED(3),
    'red': LED(4)
}

def on_single_led(on_name):
    for name, led in leds.items():
        if name == on_name:
            led.on()
        else:
            led.off()

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


    if count % int(API_REQUEST_INTERVAL_SECONDS / READ_INTERVAL_SECONDS) is 0:
        count = 0
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

    count += 1
    end = time()
    # 処理にかかった時間をスリープ時間から引いて、スリープ時間を設定した時間に近づける
    exec_seconds = end - start
    sleep(max(READ_INTERVAL_SECONDS - exec_seconds, 0))
