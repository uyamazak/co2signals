cd `dirname $0`
sudo cp -i src/run.py /opt/co2signals/run.py
sudo cp -i service/co2signals.service /etc/systemd/system/co2signals.service
