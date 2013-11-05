#!/usr/bin/env bash

# Install needed OS libraries
apt-get update
apt-get install -y python-software-properties python g++ make python-setuptools libpq-dev python-dev git-core tmux

# Install NodeJS
sed -i '$a deb http://ppa.launchpad.net/chris-lea/node.js/ubuntu precise main' /etc/apt/sources.list
apt-get update
apt-get install -y --force-yes nodejs # Because we never confirmed the public key but it's all good

# Install Python dependencies
easy_install pip
cd /vagrant
pip install -r requirements.txt --use-mirrors

# Install and setup database
apt-get install -y postgresql
echo "ALTER USER postgres WITH PASSWORD 'postgres'" | sudo -u postgres psql
cp ./website/myphillyrising/local_settings.py.template ./website/myphillyrising/local_settings.py
echo "CREATE DATABASE myphillyrising OWNER postgres" | sudo -u postgres psql

# Install and build JavaScript dependencies
npm install -g grunt-cli
npm install -g bower
cd website/myphillyrising
npm install
grunt
bower install --allow-root
cd ../alexander
npm install
grunt
bower install --allow-root
