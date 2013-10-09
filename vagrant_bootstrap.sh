#!/usr/bin/env bash

apt-get update
apt-get install -y python-software-properties python g++ make python-setuptools libpq-dev python-dev git-core tmux
sed -i '$a deb http://ppa.launchpad.net/chris-lea/node.js/ubuntu precise main' /etc/apt/sources.list
apt-get update
apt-get install -y --force-yes nodejs # Because we never confirmed the public key but it's all good
easy_install pip
apt-get install postgresql
cd /vagrant
pip install -r requirements.txt --use-mirrors
echo "ALTER USER postgres WITH PASSWORD 'postgres'" | sudo -u postgres psql
cp ./website/myphillyrising/local_settings.py.template ./website/myphillyrising/local_settings.py
echo "CREATE DATABASE myphillyrising OWNER postgres" | sudo -u postgres psql
cd website/myphillyrising
npm install
npm install -g bower
bower install
cd ../alexander
npm install
bower install
