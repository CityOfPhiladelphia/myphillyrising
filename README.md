myPhillyRising
==============

A mobile web app to support the outreach work of the PhillyRising collaborative. 
 
[OpenPlans](http://openplans.org) is currently building a webapp for the City of Philadelphia's Managing Director's office, working closely with the PhillyRising team. 

Stay tuned for more about the tool. It's in a very early state of development - feel free to poke around in our source code!


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


### Install bower and grunt

Bower is a package manager for JavaScript assets and grunt is a build tool.

TODO: add instructions


### Install client assets

Do the *bower* install in both the `myphillyrising` and `alexander` folders:

    cd website/myphillyrising
    npm install
    bower install
    cd ../alexander
    npm install
    bower install
    cd ../..

### Load the neighborhoods and tags:

    ./website/manage.py loaddata ./website/alexander/fixtures/phillyrising_neighborhoods.json

### Start the servers

    ./website/manage.py runserver  # Run this in one terminal
    ./website/manage.py celeryd    # Run this in another terminal

Browse to `http://localhost:8000/admin` and add a feed or two. Click the *Refresh* button next to each feed to import the data. Give it a minute (you should see database activity scrolling by in your `celeryd` terminal as the content items are loading).

Vagrant Installation
------------------

To setup a VM to run the database and app within, install [Vagrant](http://www.vagrantup.com), then:

     git clone https://github.com/openplans/myphillyrising.git
     vagrant up

This will do a lot of the installation work above for you. When the VM has finished initializing:

     vagrant ssh

Then finish setting up the database:

    cd /vagrant # The repo's code will be available in the VM here
    ./website/manage.py syncdb
    ./website/manage.py migrate
    ./website/manage.py loaddata ./website/alexander/fixtures/neighborhood_tags.json

Now you're ready to start the servers. [Tmux](http://tmux.sourceforge.net/) is installed so that you can both of these servers within one shell or you could open a new shell and `vagrant ssh` into it:

    ./website/manage.py runserver [::]:8000  # Run this in one terminal (slight change from above)
    ./website/manage.py celeryd    # Run this in another terminal`

Use `vagrant halt` to stop the VM while saving your state for next time. [Refer to the docs](http://docs.vagrantup.com/v2/getting-started/teardown.html) for more info on Vagrant teardown.

About PhillyRising
------------------
PhillyRising targets neighborhoods throughout Philadelphia that are plagued by chronic crime and quality of life concerns, and establishes partnerships with community members to address these issues. The PhillyRising Team coordinates the actions of City agencies to help neighbors realize their vision for their community through sustainable, responsive, and cost-effective solutions. Read more at [phila.gov/phillyrising](http://www.phila.gov/phillyrising/).
