myPhillyRising
==============

A mobile web app to support the outreach work of the PhillyRising collaborative.


Setup Instructions
------------------

### Install `pip` and `virtualenv`, if not already installed.

These will keep your python code isolated from the rest of your machine and ensure you have
the correct versions.

    easy_install pip
    pip install virtualenv

You may need to use `sudo` to install these tools.

    sudo easy_install pip
    sudo pip install virtualenv

### Clone the repo

    git clone https://github.com/openplans/myphillyrising.git

### Create a new virtual environment

Do this inside of the repository folder, and install the project requirements.

    virtualenv env
    source env/bin/activate
    pip install -r requirements.txt --use-mirrors

### Setup a PostgreSQL database

Check out this [installation guide](https://wiki.postgresql.org/wiki/Detailed_installation_guides) for help

Create a new database named `myphillyrising`. You can use `createdb` or your 
favorite IDE to do this.

### Configure the local settings

    cp ./website/myphillyrising/local_settings.py.template ./website/myphillyrising/local_settings.py

Update the database setting to allow the application to connect to your database. 
It should just be the username and password.

Set the Twitter, Facebook, and DISQUS keys. These can be junk values if you don't 
need to login or test comments right away.
    
### Initialize your database and run migrations

    ./website/manage.py syncdb
    ./website/manage.py migrate


### Install Bower and Grunt

[Bower](http://bower.io/) is a package manager for JavaScript assets and [Grunt](http://gruntjs.com/) is a build tool.

    npm install -g bower grunt-cli

### Install client assets

Do the *bower* and *grunt* installs in both the `myphillyrising` and `alexander` folders:

    cd website/myphillyrising
    npm install
    bower install
    grunt
    cd ../alexander
    npm install
    bower install
    grunt
    cd ../..

### Load the neighborhoods and tags:

    ./website/manage.py loaddata ./website/alexander/fixtures/neighborhood_tags.json

### Start the servers

    ./website/manage.py runserver  # Run this in one terminal
    ./website/manage.py celeryd    # Run this in another terminal

Browse to `http://localhost:8000/admin` and add a feed or two. Click the *Refresh* button next to each feed to import the data. Give it a minute (you should see database activity scrolling by in your `celeryd` terminal as the content items are loading).


About PhillyRising
------------------
PhillyRising targets neighborhoods throughout Philadelphia that are plagued by chronic crime and quality of life concerns, and establishes partnerships with community members to address these issues. The PhillyRising Team coordinates the actions of City agencies to help neighbors realize their vision for their community through sustainable, responsive, and cost-effective solutions. Read more at [phila.gov/phillyrising](http://www.phila.gov/phillyrising/).
