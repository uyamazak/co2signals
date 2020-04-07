cd `dirname $0`
sudo cp -i src/*.py /opt/co2signals/
sudo cp -i service/co2signals.service /etc/systemd/system/co2signals.service
